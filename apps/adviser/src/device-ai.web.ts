import { parseDeviceText, type DeviceProfile } from "./device-profile";
export async function aiCapability() {
  return "unsupported";
}
export async function prepareAi() {
  throw Error("AI native không có trong bản xem trước.");
}
export async function cancelAi() {}
export async function extractDeviceNeeds(text: string, p: DeviceProfile) {
  return {
    proposal: parseDeviceText(text, p),
    mode: "Bộ phân tích cục bộ · bản xem trước",
  };
}
export async function verifyNativeSignature(
  payload: string,
  signature: string,
  key: string,
) {
  try {
    const bytes = (s: string) =>
      Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
    const k = await crypto.subtle.importKey(
      "spki",
      bytes(key),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    return crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      k,
      bytes(signature),
      new TextEncoder().encode(payload),
    );
  } catch {
    return false;
  }
}

export async function digestText(payload: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
