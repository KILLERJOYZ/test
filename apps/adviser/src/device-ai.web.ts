import { parseDeviceText, type DeviceProfile } from "./device-profile";
export async function aiCapability() {
  return "unsupported";
}
export async function prepareAi() {
  throw Error("AI native không có trong bản xem trước.");
}
export async function cancelAi() {}
export async function extractDeviceNeeds(
  text: string,
  p: DeviceProfile,
  _useNano = false,
) {
  return {
    proposal: parseDeviceText(text, p),
    mode: "Bộ phân tích cục bộ · bản xem trước",
  };
}

export function parseLaptopUtteranceLocal(text: string): {
  budget?: number;
  minRam?: number;
  minStorage?: number;
  tasks: string[];
  maxWeightKg?: number;
} {
  const lower = text.toLocaleLowerCase("vi");
  let budget: number | undefined;
  const mTrieu = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|củ)\b/);
  if (mTrieu) {
    const val = Math.round(Number(mTrieu[1].replace(",", ".")) * 1000000);
    if (val > 0 && val <= 1000000000) budget = val;
  }
  let minRam: number | undefined;
  const mRam = lower.match(/\bram\s*(8|16|24|32|64)\s*gb\b|\b(16|32|64)\s*gb\s*ram\b/);
  if (mRam) minRam = Number(mRam[1] || mRam[2]);
  let minStorage: number | undefined;
  const mSsd = lower.match(/\b(?:ssd|ổ|rom)\s*(256|512|1024)\s*gb\b|\b(1|2)\s*tb\b/);
  if (mSsd) {
    minStorage = mSsd[2] ? Number(mSsd[2]) * 1024 : Number(mSsd[1]);
  }
  let maxWeightKg: number | undefined;
  const mWeight = lower.match(/(?:dưới|nhẹ hơn|tối đa)\s*(\d+(?:[.,]\d+)?)\s*kg\b/);
  if (mWeight) {
    maxWeightKg = Number(mWeight[1].replace(",", "."));
  } else if (/(mỏng nhẹ|hay mang|di chuyển|mang đi học|giảng đường)/.test(lower)) {
    maxWeightKg = 1.6;
  }
  const tasks: string[] = [];
  if (/(văn phòng|học tập|sinh viên|word|excel|giảng đường)/.test(lower))
    tasks.push("Văn phòng & học tập");
  if (/(lập trình|code|it|dev|web|backend|mobile)/.test(lower))
    tasks.push("Lập trình");
  if (/(thiết kế|đồ họa|2d|3d|photoshop|figma|premiere|render|edit)/.test(lower))
    tasks.push("Thiết kế");
  if (/(máy ảo|docker|vm|virtual|kubernetes)/.test(lower))
    tasks.push("Máy ảo");
  if (/(chơi game|gaming|game|valorant|lol|aaa|esport)/.test(lower))
    tasks.push("Chơi game");
  return { budget, minRam, minStorage, tasks, maxWeightKg };
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
