import {
  mandatoryTaskSchema,
  profileMissingFields,
  softPreferenceSchema,
  type MandatoryTask,
  type SoftPreference,
  type UserRequirementProfile,
} from "../schemas/profile.js";
import { foldText } from "../tools/helpers.js";

const UNIT_AMOUNT_RE =
  /(\d{1,3}(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)\s*(triệu|trieu|tr|củ|cu|tỷ|ty)\b/giu;
const RAW_AMOUNT_RE = /\b(\d{1,3}(?:[.,]\d{3}){2,})\b/g;

const TASK_PATTERNS: { task: MandatoryTask; patterns: RegExp[] }[] = [
  { task: "gaming", patterns: [/\bgame\b/, /\bgaming\b/, /\blol\b/, /\bvalorant\b/, /\bfifa\b/, /\baaa\b/] },
  {
    task: "graphic_3d",
    patterns: [/\b3d\b/, /\bblender\b/, /\bmaya\b/, /\brender\b/, /\bsolidworks\b/, /\brevit\b/],
  },
  {
    task: "video_editing",
    patterns: [/\bdung video\b/, /\bpremiere\b/, /\bafter effect\b/, /\bedit video\b/, /\bvideo 4k\b/],
  },
  {
    task: "graphic_2d",
    patterns: [/\bdo hoa 2d\b/, /\bphotoshop\b/, /\billustrator\b/, /\bthiet ke\b/, /\bdo hoa\b/],
  },
  {
    task: "coding",
    patterns: [/\blap trinh\b/, /\bcoding\b/, /\bcode\b/, /\bdocker\b/, /\bandroid studio\b/, /\bdev\b/],
  },
  { task: "local_ai", patterns: [/\blocal ai\b/, /\bllm\b/, /\bmachine learning\b/, /\bstable diffusion\b/] },
  { task: "office", patterns: [/\bvan phong\b/, /\boffice\b/, /\bword\b/, /\bexcel\b/, /\bke toan\b/] },
  { task: "student", patterns: [/\bsinh vien\b/, /\bhoc tap\b/, /\bdi hoc\b/, /\bhoc\b/] },
  { task: "portability", patterns: [/\bmang di\b/, /\bnhe\b/, /\bportable\b/, /\bdi lam\b/] },
  { task: "battery_life", patterns: [/\bpin lau\b/, /\bthoi luong pin\b/, /\bbattery\b/, /\bpin\b/] },
];

const SOFT_PATTERNS: { preference: SoftPreference; patterns: RegExp[] }[] = [
  { preference: "lighter", patterns: [/\bnhe\b/, /\bmong\b/] },
  { preference: "better_battery", patterns: [/\bpin lau\b/, /\bthoi luong pin\b/, /\bbattery\b/] },
  { preference: "better_display", patterns: [/\bman hinh dep\b/, /\boled\b/, /\bdo phu mau\b/] },
  { preference: "quieter", patterns: [/\bit on\b/, /\bquat on\b/, /\bquiet\b/] },
  { preference: "upgradable", patterns: [/\bnang cap\b/, /\bupgrade\b/] },
  { preference: "cheaper", patterns: [/\bre hon\b/, /\btiet kiem\b/, /\bgia tot\b/] },
];

const TASK_LABELS: Record<MandatoryTask, string> = {
  office: "Văn phòng",
  student: "Học tập",
  coding: "Lập trình",
  graphic_2d: "Đồ họa 2D",
  graphic_3d: "Đồ họa 3D",
  video_editing: "Dựng video",
  gaming: "Chơi game",
  portability: "Mang đi nhiều",
  battery_life: "Pin lâu",
  local_ai: "AI cục bộ",
};

/**
 * Parses only budgets the text actually states. "2 triệu/tháng trả góp" does
 * not become a 2m ceiling; the larger stated machine price wins.
 */
export function parseBudgetVnd(text: string): number | null {
  const amounts: number[] = [];
  for (const match of text.matchAll(UNIT_AMOUNT_RE)) {
    const number = Number((match[1] ?? "").replace(",", "."));
    if (!Number.isFinite(number)) continue;
    const unit = foldText(match[2] ?? "");
    const scale = unit === "tỷ" || unit === "ty" ? 1_000_000_000 : 1_000_000;
    amounts.push(Math.round(number * scale));
  }
  for (const match of text.matchAll(RAW_AMOUNT_RE)) {
    const digits = (match[1] ?? "").replace(/[.,]/g, "");
    const value = Number(digits);
    if (Number.isFinite(value)) amounts.push(value);
  }
  const valid = amounts.filter((value) => value >= 1_000_000 && value <= 500_000_000);
  if (valid.length === 0) return null;
  return Math.max(...valid);
}

export function inferTasks(text: string): MandatoryTask[] {
  const folded = foldText(text);
  const tasks: MandatoryTask[] = [];
  for (const item of TASK_PATTERNS) {
    if (item.patterns.some((pattern) => pattern.test(folded))) tasks.push(item.task);
  }
  // 3D also implies 2D work; keep the stricter task only.
  if (tasks.includes("graphic_3d")) {
    const index = tasks.indexOf("graphic_2d");
    if (index >= 0) tasks.splice(index, 1);
  }
  return [...new Set(tasks)].slice(0, 10);
}

export function inferSoftPreferences(text: string): SoftPreference[] {
  const folded = foldText(text);
  const preferences: SoftPreference[] = [];
  for (const item of SOFT_PATTERNS) {
    if (item.patterns.some((pattern) => pattern.test(folded))) preferences.push(item.preference);
  }
  return [...new Set(preferences)].slice(0, 2);
}

export function inferGoals(text: string, tasks: readonly MandatoryTask[]): string[] {
  const goals = tasks.slice(0, 3).map((task) => TASK_LABELS[task]);
  if (goals.length > 0) return goals;
  const cleaned = text.replace(/\s+/g, " ").trim();
  return [cleaned.length > 0 ? cleaned.slice(0, 120) : "Chưa xác định nhu cầu"];
}

export function buildDeterministicProfile(
  message: string,
  draft?: UserRequirementProfile | null,
): UserRequirementProfile {
  const inferredTasks = inferTasks(message);
  const tasks = inferredTasks.length > 0 ? inferredTasks : (draft?.mandatory_tasks ?? []);
  const inferredGoals = inferGoals(message, inferredTasks);
  const goals =
    inferredTasks.length === 0 && draft?.primary_goals.length
      ? [...draft.primary_goals]
      : inferredGoals;
  const budget = parseBudgetVnd(message) ?? draft?.max_budget_vnd ?? null;
  const category = /điện thoại|\bphone\b|iphone|samsung galaxy/i.test(message)
    ? "phone"
    : (draft?.category ?? "laptop");
  const inferredSoft = inferSoftPreferences(message);
  const profile = {
    category,
    primary_goals: goals,
    mandatory_tasks: tasks,
    max_budget_vnd: budget,
    soft_preferences: inferredSoft.length > 0 ? inferredSoft : (draft?.soft_preferences ?? []),
    missing_fields: [] as string[],
  } satisfies UserRequirementProfile;
  profile.missing_fields = profileMissingFields(profile);
  return profile;
}

/**
 * LLM values are accepted for goals/tasks/preferences only. Budget always
 * comes from an explicit number in the user's message or the confirmed draft.
 */
export function mergeProfile(
  extracted: {
    category: "laptop" | "phone";
    primary_goals: string[];
    mandatory_tasks: MandatoryTask[];
    soft_preferences: SoftPreference[];
  } | null,
  message: string,
  draft?: UserRequirementProfile | null,
): UserRequirementProfile {
  const deterministic = buildDeterministicProfile(message, draft);
  const budget = parseBudgetVnd(message) ?? draft?.max_budget_vnd ?? null;
  const tasks = (extracted?.mandatory_tasks?.length ? extracted.mandatory_tasks : deterministic.mandatory_tasks)
    .filter((task) => mandatoryTaskSchema.safeParse(task).success)
    .slice(0, 10);
  const goals = (extracted?.primary_goals?.length ? extracted.primary_goals : deterministic.primary_goals)
    .map((goal) => goal.trim())
    .filter(Boolean)
    .slice(0, 3);
  const soft = (extracted?.soft_preferences?.length
    ? extracted.soft_preferences
    : deterministic.soft_preferences
  )
    .filter((preference) => softPreferenceSchema.safeParse(preference).success)
    .slice(0, 2);

  const profile: UserRequirementProfile = {
    category: extracted?.category === "phone" || deterministic.category === "phone" ? "phone" : "laptop",
    primary_goals: goals.length > 0 ? goals : deterministic.primary_goals,
    mandatory_tasks: tasks,
    max_budget_vnd: budget,
    soft_preferences: soft,
    missing_fields: [],
  };
  profile.missing_fields = profileMissingFields(profile);
  return profile;
}

export function sameProfile(left: UserRequirementProfile, right: UserRequirementProfile): boolean {
  return (
    left.category === right.category &&
    left.max_budget_vnd === right.max_budget_vnd &&
    JSON.stringify([...left.primary_goals].sort()) === JSON.stringify([...right.primary_goals].sort()) &&
    JSON.stringify([...left.mandatory_tasks].sort()) === JSON.stringify([...right.mandatory_tasks].sort()) &&
    JSON.stringify([...left.soft_preferences].sort()) === JSON.stringify([...right.soft_preferences].sort())
  );
}

export function isConfirmationMessage(message: string): boolean {
  const folded = foldText(message).trim();
  if (!folded) return true;
  return /^(dung|dong y|ok|oke|xac nhan|chot|duoc|yes)\b/.test(folded);
}

export function buildConfirmationQuestions(profile: UserRequirementProfile): string[] {
  const questions: string[] = [];
  if (profile.max_budget_vnd == null) {
    questions.push("Ngân sách tối đa của bạn là bao nhiêu (ghi rõ bằng VNĐ)?");
  }
  if (profile.missing_fields.includes("primary_goals")) {
    questions.push("Bạn sẽ dùng máy chủ yếu cho việc gì?");
  }
  if (questions.length === 0) {
    const budget = profile.max_budget_vnd?.toLocaleString("vi-VN") ?? "";
    questions.push(
      `Xác nhận: ngân sách tối đa ${budget}₫ cho ${profile.primary_goals.join(", ")}?`,
    );
  }
  return questions.slice(0, 2);
}

export { TASK_LABELS };
