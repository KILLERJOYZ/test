import http from "node:http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import {
  generateKeyPairSync,
  createPublicKey,
  createHash,
  sign,
  verify,
} from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const keyDir = path.join(app, ".expo", "catalog-publisher");
mkdirSync(keyDir, { recursive: true });
const keyFile = path.join(keyDir, "private.pem");
if (!existsSync(keyFile)) {
  const pair = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  writeFileSync(keyFile, pair.privateKey);
}
const key = readFileSync(keyFile, "utf8");
const publicKey = createPublicKey(key)
  .export({ type: "spki", format: "der" })
  .toString("base64");
const seed = JSON.parse(
  readFileSync(path.join(app, "src/reference-seed.json"), "utf8"),
);
if (process.env.ADVISOR_CATALOG_VERSION) {
  if (!/^[a-zA-Z0-9._-]{1,80}$/.test(process.env.ADVISOR_CATALOG_VERSION))
    throw Error("Invalid catalog version");
  seed.version = process.env.ADVISOR_CATALOG_VERSION;
}
const bundle = JSON.stringify({
  schemaVersion: 1,
  market: "VN",
  catalogVersion: seed.version,
  rows: seed.rows,
});
const payload = JSON.stringify({
  schemaVersion: 1,
  market: "VN",
  catalogVersion: seed.version,
  minAppVersion: 1,
  bytes: Buffer.byteLength(bundle),
  sha256: createHash("sha256").update(bundle).digest("hex"),
});
const signature = sign("sha256", Buffer.from(payload), key).toString("base64");
if (process.argv.includes("--prepare")) {
  writeFileSync(
    path.join(app, "src/catalog-trust.json"),
    JSON.stringify({ publicKey }, null, 2) + "\n",
  );
  console.log("Prepared catalog publisher trust (public key only).");
} else if (process.argv.includes("--test")) {
  if (
    !verify(
      "sha256",
      Buffer.from(payload),
      createPublicKey(key),
      Buffer.from(signature, "base64"),
    )
  )
    throw Error("Signature failed");
  if (
    verify(
      "sha256",
      Buffer.from(payload + "tampered"),
      createPublicKey(key),
      Buffer.from(signature, "base64"),
    )
  )
    throw Error("Tampering accepted");
  console.log("PASS: real RSA manifest signature and tamper rejection.");
} else {
  const server = http.createServer((req, res) => {
    let body;
    if (req.url === "/advisor/v1/manifest")
      body = JSON.stringify({ payload, signature });
    else if (req.url === `/advisor/v1/catalogs/${seed.version}/bundle`)
      body = bundle;
    else if (req.url === "/health")
      body = JSON.stringify({ status: "ok", catalogVersion: seed.version });
    else {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "content-length": Buffer.byteLength(body),
      "access-control-allow-origin": "*",
    });
    res.end(body);
  });
  server.listen(Number(process.env.ADVISOR_PORT ?? 8790), "127.0.0.1", () =>
    console.log("Signed catalog server listening on localhost."),
  );
}
