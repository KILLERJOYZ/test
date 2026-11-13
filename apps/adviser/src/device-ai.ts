import { requireOptionalNativeModule } from "expo-modules-core";
import {
  parseDeviceText,
  type DeviceProfile,
  type TextProposal,
} from "./device-profile";
type Native = {
  capability: () => Promise<string>;
  download: () => Promise<string>;
  extract: (text: string) => Promise<string>;
  cancel: () => Promise<void>;
  digest: (payload: string) => Promise<string>;
  verify: (
    payload: string,
    signature: string,
    publicKey: string,
  ) => Promise<boolean>;
};
const native = requireOptionalNativeModule<Native>("DeviceAdvisorNative");
export async function aiCapability() {
  if (!native) return "unsupported";
  try {
    return await native.capability();
  } catch {
    return "error";
  }
}
export async function prepareAi() {
  if (!native)
    throw Error("Thiết bị chưa hỗ trợ AI này. Bạn vẫn dùng biểu mẫu được.");
  return native.download();
}
export async function cancelAi() {
  await native?.cancel();
}
export async function extractDeviceNeeds(
  text: string,
  p: DeviceProfile,
  useNano = false,
): Promise<{ proposal: TextProposal; mode: string }> {
  // Critical values must agree with independently parsed source text before review.
  const proposal = parseDeviceText(text, p);
  if (useNano) {
    if (!native || (await native.capability()) !== "ready")
      return { proposal, mode: "Bộ phân tích cục bộ · AI chưa sẵn sàng" };
    const raw = await native.extract(text);
    const parsed = JSON.parse(
      raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, ""),
    );
    if (
      !parsed ||
      Object.keys(parsed).some(
        (k) => !["category", "ceilingVnd"].includes(k),
      ) ||
      (parsed.ceilingVnd !== undefined &&
        parsed.ceilingVnd !== proposal.ceilingVnd) ||
      (parsed.category !== undefined && parsed.category !== proposal.category)
    )
      throw Error("AI không khớp nội dung đã kiểm tra. Hãy dùng biểu mẫu.");
    return { proposal, mode: "AI trên thiết bị · đề xuất đã kiểm tra" };
  }
  return { proposal, mode: "Bộ phân tích cục bộ · không dùng mô hình" };
}
export const verifyNativeSignature = async (
  payload: string,
  signature: string,
  key: string,
) => (native ? native.verify(payload, signature, key) : false);

export async function digestText(payload: string) {
  if (!native) throw Error("Native cryptography unavailable");
  return native.digest(payload);
}
