import { build } from "esbuild";
import { createRequire } from "node:module";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { createHash, sign } from "node:crypto";
import assert from "node:assert/strict";
const dir = ".expo/catalog-tests";
mkdirSync(dir, { recursive: true });
const mocks = {
  "expo-sqlite": `import {DatabaseSync} from 'node:sqlite';const db=new DatabaseSync(':memory:');const api={execAsync:async sql=>db.exec(sql),getFirstAsync:async(sql,...args)=>db.prepare(sql).get(...args),getAllAsync:async(sql,...args)=>db.prepare(sql).all(...args),runAsync:async(sql,...args)=>{if(globalThis.failCatalogWrite&&sql.startsWith('INSERT INTO reference_listing'))throw Error('injected write failure');return db.prepare(sql).run(...args)},withExclusiveTransactionAsync:async fn=>{db.exec('BEGIN IMMEDIATE');try{await fn(api);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}}};globalThis.catalogTestSql=api;export async function openDatabaseAsync(){return api}`,
  "./device-ai": `import {verify,createPublicKey,createHash} from 'node:crypto';export async function verifyNativeSignature(p,s,k){return verify('sha256',Buffer.from(p),createPublicKey({key:Buffer.from(k,'base64'),format:'der',type:'spki'}),Buffer.from(s,'base64'))};export async function digestText(p){return createHash('sha256').update(p).digest('hex')}`,
};
await build({
  stdin: {
    contents: `export {syncReferenceCatalog} from './src/catalog-sync';export {loadReferences,rollbackReferences} from './src/catalog-database';export {validateReferenceBundle,validateManifest} from './src/catalog-contract'`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: dir + "/system.cjs",
  plugins: [
    {
      name: "native-boundaries",
      setup(b) {
        b.onResolve({ filter: /.*/ }, (a) =>
          a.path in mocks ? { path: a.path, namespace: "mock" } : undefined,
        );
        b.onLoad({ filter: /.*/, namespace: "mock" }, (a) => ({
          contents: mocks[a.path],
          loader: "js",
        }));
      },
    },
  ],
});
const api = createRequire(import.meta.url)("../" + dir + "/system.cjs");
const seed = JSON.parse(readFileSync("src/reference-seed.json", "utf8"));
const privateKey = readFileSync(".expo/catalog-publisher/private.pem", "utf8");
let bundle = {
  schemaVersion: 1,
  market: "VN",
  catalogVersion: "test-a",
  rows: seed.rows,
};
let tamper = false,
  badHash = false;
const requests = [];
const server = createServer((req, res) => {
  requests.push({ method: req.method, url: req.url });
  const raw = JSON.stringify(bundle);
  const payload = JSON.stringify({
    schemaVersion: 1,
    market: "VN",
    catalogVersion: bundle.catalogVersion,
    minAppVersion: 1,
    bytes: Buffer.byteLength(raw),
    sha256: badHash
      ? "0".repeat(64)
      : createHash("sha256").update(raw).digest("hex"),
  });
  if (req.url === "/advisor/v1/manifest") {
    const signature = sign("sha256", Buffer.from(payload), privateKey).toString(
      "base64",
    );
    res.end(
      JSON.stringify({ payload: tamper ? payload + " " : payload, signature }),
    );
  } else res.end(raw);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + server.address().port;
let count = 0;
async function check(label, fn) {
  await fn();
  count++;
  console.log("PASS: " + label);
}
try {
  await check("bundled real catalog loads into actual SQLite", async () =>
    assert.equal((await api.loadReferences()).length, 75),
  );
  await globalThis.catalogTestSql.runAsync(
    "UPDATE reference_meta SET value=? WHERE key='version'",
    "9d2055abff9bcf99",
  );
  await check(
    "signed HTTP manifest, digest, validation and SQLite activation",
    async () => {
      assert.equal(await api.syncReferenceCatalog(base), "test-a");
      assert.equal((await api.loadReferences())[0].catalogVersion, "test-a");
    },
  );
  await check(
    "explicit rollback to an older bundled snapshot survives reload",
    async () => {
      await api.rollbackReferences();
      assert.equal(
        (await api.loadReferences())[0].catalogVersion,
        "9d2055abff9bcf99",
      );
      await api.syncReferenceCatalog(base);
    },
  );
  await check("tampered signature rejected before activation", async () => {
    tamper = true;
    await assert.rejects(api.syncReferenceCatalog(base));
    tamper = false;
    assert.equal((await api.loadReferences())[0].catalogVersion, "test-a");
  });
  await check("signed wrong hash rejected before activation", async () => {
    badHash = true;
    await assert.rejects(api.syncReferenceCatalog(base));
    badHash = false;
  });
  await check("signed duplicate rows rejected", async () => {
    bundle = {
      ...bundle,
      catalogVersion: "bad-duplicate",
      rows: [seed.rows[0], seed.rows[0]],
    };
    await assert.rejects(api.syncReferenceCatalog(base));
  });
  await check(
    "unsafe source rejected even with valid publisher signature",
    async () => {
      bundle = {
        ...bundle,
        catalogVersion: "bad-source",
        rows: [{ ...seed.rows[0], url: "https://evil.example/product" }],
      };
      await assert.rejects(api.syncReferenceCatalog(base));
    },
  );
  await check(
    "partial write failure rolls back prior rows and active version",
    async () => {
      bundle = {
        ...bundle,
        catalogVersion: "test-b",
        rows: seed.rows.slice(0, 2),
      };
      globalThis.failCatalogWrite = true;
      await assert.rejects(api.syncReferenceCatalog(base));
      globalThis.failCatalogWrite = false;
      assert.equal((await api.loadReferences()).length, 75);
      assert.equal((await api.loadReferences())[0].catalogVersion, "test-a");
    },
  );
  await check(
    "valid replacement followed by rollback restores complete snapshot",
    async () => {
      await api.syncReferenceCatalog(base);
      assert.equal((await api.loadReferences()).length, 2);
      await api.rollbackReferences();
      assert.equal((await api.loadReferences()).length, 75);
      assert.equal((await api.loadReferences())[0].catalogVersion, "test-a");
    },
  );
  await check(
    "transport rejects arbitrary cleartext hosts and credentials",
    async () => {
      await assert.rejects(api.syncReferenceCatalog("http://example.com"));
      await assert.rejects(
        api.syncReferenceCatalog("https://user:pass@example.com"),
      );
      assert.ok(
        requests.every(
          (r) => r.method === "GET" && r.url.startsWith("/advisor/v1/"),
        ),
      );
    },
  );
  writeFileSync(
    dir + "/results.json",
    JSON.stringify(
      {
        status: "passed",
        checks: count,
        crypto: "real RSA SHA256",
        transport: "local HTTP",
        database: "actual SQLite through Expo API adapter",
        nativeCryptography: "separate Android runtime smoke required",
      },
      null,
      2,
    ),
  );
} finally {
  server.close();
}
