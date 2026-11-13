import trust from "./catalog-trust.json";
import { verifyNativeSignature, digestText } from "./device-ai";
import { validateManifest, validateReferenceBundle } from "./catalog-contract";
import { activateReferences } from "./reference-storage";
const byteLength = (s: string) => {
  let n = 0;
  for (const c of s) {
    const v = c.codePointAt(0)!;
    n += v <= 127 ? 1 : v <= 2047 ? 2 : v <= 65535 ? 3 : 4;
  }
  return n;
};
export async function syncReferenceCatalog(
  baseUrl: string,
  token = "",
  signal?: AbortSignal,
) {
  const url = new URL(baseUrl);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !(
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "10.0.2.2"].includes(url.hostname))
    )
  )
    throw Error("Dùng HTTPS hoặc máy chủ localhost để kiểm thử.");
  const base = url.href.replace(/\/$/, "");
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(() => controller.abort(), 20000);
  const read = async (path: string, max: number) => {
    const response = await fetch(base + path, {
      signal: controller.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (
      !response.ok ||
      Number(response.headers.get("content-length") ?? 0) > max
    )
      throw Error("Máy chủ từ chối hoặc gói quá lớn.");
    const text = await response.text();
    if (byteLength(text) > max) throw Error("Gói quá lớn.");
    return text;
  };
  try {
    const envelope = JSON.parse(await read("/advisor/v1/manifest", 20000));
    if (
      typeof envelope.payload !== "string" ||
      typeof envelope.signature !== "string" ||
      !(await verifyNativeSignature(
        envelope.payload,
        envelope.signature,
        trust.publicKey,
      ))
    )
      throw Error("Chữ ký manifest không hợp lệ.");
    const m = validateManifest(JSON.parse(envelope.payload));
    const raw = await read(
      `/advisor/v1/catalogs/${encodeURIComponent(m.catalogVersion)}/bundle`,
      m.bytes,
    );
    if (byteLength(raw) !== m.bytes || (await digestText(raw)) !== m.sha256)
      throw Error("Hash/kích thước catalog sai.");
    const b = validateReferenceBundle(JSON.parse(raw));
    if (b.catalogVersion !== m.catalogVersion)
      throw Error("Phiên bản catalog không khớp.");
    if (controller.signal.aborted) throw Error("Đã hủy đồng bộ.");
    await activateReferences(b);
    return b.catalogVersion;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}
