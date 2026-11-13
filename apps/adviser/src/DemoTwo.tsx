import ReferenceExplorer from "./ReferenceExplorer";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Share,
  AppState,
  BackHandler,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LIGHT } from "./design-tokens";
import { storage, storageKind } from "./demo-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TASKS, PRIORITIES, bestOffer, total, money, fit } from "./domain";
import {
  EMPTY_NEEDS,
  EMPTY_FILTERS,
  evaluate,
  updateTasks,
  validateNeeds,
} from "./picker";
import type { Needs } from "./picker";
import {
  BASE,
  UPDATE,
  validateCatalog,
  run,
  proposeBudget,
  applyProposal,
} from "./integration";
import type { Catalog, BudgetProposal } from "./integration";

const KEY = "lua-integration-demo2-v1";
const initial: Needs = {
  ...EMPTY_NEEDS,
  primaryUseOrder: ["study", "code"],
  tasks: ["study", "code"],
  useOrderConfirmed: true,
  revision: 1,
};
type State = {
  schema: 1;
  catalog: Catalog;
  previous: Catalog | null;
  needs: Needs;
  confirmed?: boolean;
  saved?: {
    id: string;
    needs: Needs;
    ids: string[];
    date: string;
    catalog: string;
    observations: string[];
  }[];
};
function Button({
  title,
  onPress,
  disabled = false,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "quiet";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        variant === "quiet" && s.quietButton,
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.4 },
      ]}
    >
      <Text style={[s.buttonText, variant === "quiet" && s.quietButtonText]}>
        {title}
      </Text>
    </Pressable>
  );
}
const CHOICE_COLORS = ["#EEE5FF", "#DFF3EE", "#FFEAD7", "#E2EBFF"];
const CHOICE_INK = ["#59409D", "#21594A", "#814919", "#35538C"];
function ChoiceCard({
  title,
  description,
  selected,
  rank,
  symbol,
  colorIndex = 0,
  disabled = false,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  rank?: number;
  symbol: string;
  colorIndex?: number;
  disabled?: boolean;
  onPress: () => void;
}) {
  const color = CHOICE_COLORS[colorIndex % 4],
    ink = CHOICE_INK[colorIndex % 4];
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.choiceCard,
        {
          backgroundColor: selected ? "#F0E8FF" : "#FFFFFF",
          borderColor: selected ? LIGHT.primary : "#E2DCEB",
        },
        pressed && { backgroundColor: "#EDE5FA" },
        disabled && !selected && { opacity: 0.5 },
      ]}
    >
      <View style={[s.choiceIcon, { backgroundColor: color }]}>
        <Text accessible={false} style={[s.choiceGlyph, { color: ink }]}>
          {symbol}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={s.choiceTitle}>{title}</Text>
        <Text style={s.choiceDescription}>{description}</Text>
        {selected && (
          <Text style={s.selectedCaption}>
            {rank ? `Ưu tiên ${rank}` : "Đã chọn"}
          </Text>
        )}
      </View>
      <View
        style={[
          s.checkCircle,
          selected && {
            backgroundColor: LIGHT.primary,
            borderColor: LIGHT.primary,
          },
        ]}
      >
        <Text
          accessible={false}
          style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 17 }}
        >
          {selected ? (rank ?? "✓") : ""}
        </Text>
      </View>
    </Pressable>
  );
}
export default function DemoTwo({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<State>({
    schema: 1,
    catalog: BASE,
    previous: null,
    needs: initial,
  });
  type Screen =
    | "results"
    | "tasks"
    | "budget"
    | "preferences"
    | "review"
    | "text"
    | "detail"
    | "compare"
    | "saved"
    | "lab";
  const [referenceMode, setReferenceMode] = useState(true);
  const [screen, setScreen] = useState<Screen>("results");
  const scroll = useRef<ScrollView>(null);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
    setNotice("");
  }, [screen]);
  const [draft, setDraft] = useState(initial);
  const [amount, setAmount] = useState(String(initial.budget));
  const gate = useRef(false);
  const [query, setQuery] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [sort, setSort] = useState<"fit" | "price" | "weight">("fit");
  const [importText, setImportText] = useState("");
  const [failWrite, setFailWrite] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [text, setText] = useState("Tối đa 20 triệu");
  const [proposal, setProposal] = useState<BudgetProposal | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    storage
      .getItem(KEY)
      .then(async (raw) => {
        if (raw) return raw;
        const legacy = await AsyncStorage.getItem(KEY);
        if (legacy) {
          await storage.setItem(KEY, legacy);
        }
        return legacy;
      })
      .then((raw) => {
        if (raw) {
          const v = JSON.parse(raw);
          if (v.schema !== 1 || validateNeeds(v.needs).length)
            throw Error("Phiên lưu không hợp lệ; dữ liệu gốc được giữ lại.");
          validateCatalog(v.catalog);
          if (v.previous) validateCatalog(v.previous);
          if (active) {
            setState(v);
            setDraft(v.needs);
            setAmount(String(v.needs.budget));
          }
        }
      })
      .catch((e) => {
        if (active) setNotice(String(e.message));
      })
      .finally(async () => {
        try {
          const raw = await storage.getItem(KEY + "-draft");
          if (raw && active) {
            const d = JSON.parse(raw);
            if (d.draft && typeof d.amount === "string") {
              setDraft(d.draft);
              setAmount(d.amount);
            }
          }
        } catch {
          if (active) setNotice("Bản nháp lỗi; phiên xác nhận được giữ.");
        }
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      void storage
        .setItem(KEY + "-draft", JSON.stringify({ draft, amount }))
        .catch(() => setNotice("Không lưu được bản nháp."));
    }, 300);
    return () => clearTimeout(timer);
  }, [draft, amount, ready]);
  useEffect(() => {
    const a = AppState.addEventListener("change", () => setProposal(null));
    const b = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "results") {
        onExit();
        return true;
      }
      const back: Partial<Record<Screen, Screen>> = {
        budget: "tasks",
        preferences: "budget",
        review: "preferences",
      };
      setScreen(back[screen] ?? "results");
      return true;
    });
    return () => {
      a.remove();
      b.remove();
    };
  }, [screen, onExit]);
  async function commit(next: State) {
    if (gate.current) return;
    gate.current = true;
    setBusy(true);
    try {
      validateCatalog(next.catalog);
      if (failWrite) throw Error("Injected storage failure");
      await storage.setItem(KEY, JSON.stringify(next));
      setState(next);
      setDraft(next.needs);
      setAmount(String(next.needs.budget));
      setProposal(null);
      setNotice("Đã lưu trên thiết bị.");
      return true;
    } catch {
      setNotice("Không lưu được. Phiên và catalog hiện tại vẫn được giữ.");
    } finally {
      gate.current = false;
      setBusy(false);
    }
  }
  function checkBundle(bundle: unknown) {
    try {
      const catalog = validateCatalog(bundle);
      void commit({ ...state, catalog, previous: state.catalog });
    } catch (e) {
      setNotice(`${(e as Error).message} Catalog đang dùng không thay đổi.`);
    }
  }
  const result = run(state.needs, state.catalog);
  const filtered = evaluate(
    state.needs,
    {
      ...EMPTY_FILTERS,
      maxWeight:
        maxWeight && Number.isFinite(Number(maxWeight))
          ? Number(maxWeight)
          : null,
      sort,
    },
    state.catalog.offers,
    state.catalog.products,
  );
  const visible = (showAll ? state.catalog.products : filtered.visible).filter(
    (p) =>
      `${p.name} ${p.ram} ${p.ssd}`.toLowerCase().includes(query.toLowerCase()),
  );
  const enabled = ready && !busy;
  const product = state.catalog.products.find((p) => p.id === detail);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root}>
        <ScrollView
          ref={scroll}
          contentContainerStyle={s.page}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.eyebrow}>LỰA / DEMO 02</Text>
          <Text accessibilityRole="header" style={s.title}>
            Chọn máy. Hiểu rõ quyết định.
          </Text>
          <Text style={s.body}>
            {referenceMode
              ? "Catalog thực từ nguồn bán lẻ · Tham khảo offline, cần xác minh trước khi mua."
              : "Phòng mô phỏng · sản phẩm và giá giả."}
          </Text>
          <View style={s.navigation}>
            <Button
              variant="quiet"
              title="Gợi ý"
              onPress={() => {
                setQuery("");
                setMaxWeight("");
                setShowAll(false);
                setScreen("results");
              }}
            />
            <Button
              variant="quiet"
              title="Đã lưu"
              onPress={() => setScreen("saved")}
            />
            <Button
              variant="quiet"
              title="So sánh"
              onPress={() => setScreen("compare")}
            />
            <Button
              variant="quiet"
              title="Cài đặt / kiểm thử"
              onPress={() => setScreen("lab")}
            />
          </View>
          {(["tasks", "budget", "preferences", "review"] as Screen[]).includes(
            screen,
          ) && (
            <View style={s.wizardCard}>
              <View style={s.stepPill}>
                <Text style={s.eyebrow}>
                  BƯỚC{" "}
                  {["tasks", "budget", "preferences", "review"].indexOf(
                    screen,
                  ) + 1}{" "}
                  / 4
                </Text>
              </View>
              <View
                accessibilityLabel={`Bước ${["tasks", "budget", "preferences", "review"].indexOf(screen) + 1} trên 4`}
                style={s.progressRow}
              >
                {[0, 1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      s.progressSegment,
                      {
                        backgroundColor:
                          i <=
                          ["tasks", "budget", "preferences", "review"].indexOf(
                            screen,
                          )
                            ? LIGHT.primary
                            : "#E9E2F2",
                      },
                    ]}
                  />
                ))}
              </View>
              {screen === "tasks" && (
                <>
                  <Text accessibilityRole="header" style={s.stepTitle}>
                    Bạn cần máy cho việc gì?
                  </Text>
                  <Text style={s.body}>
                    Chọn từ một đến ba mục đích, theo thứ tự quan trọng.
                  </Text>
                  <View style={s.selectionSummary}>
                    <Text style={s.summaryText}>
                      {draft.primaryUseOrder.length}/3 mục đích đã chọn
                    </Text>
                    <Text style={s.choiceDescription}>
                      Quan trọng nhất ở vị trí 1
                    </Text>
                  </View>
                  <View style={s.choices}>
                    {TASKS.map((t, i) => (
                      <ChoiceCard
                        key={t.id}
                        title={t.name}
                        description={t.detail}
                        symbol={["Aa", "</>", "✦", "VM"][i]}
                        colorIndex={i}
                        selected={draft.primaryUseOrder.includes(t.id)}
                        rank={
                          draft.primaryUseOrder.includes(t.id)
                            ? draft.primaryUseOrder.indexOf(t.id) + 1
                            : undefined
                        }
                        disabled={
                          !enabled ||
                          (!draft.primaryUseOrder.includes(t.id) &&
                            draft.primaryUseOrder.length === 3)
                        }
                        onPress={() => {
                          const ids = draft.primaryUseOrder.includes(t.id)
                            ? draft.primaryUseOrder.filter((x) => x !== t.id)
                            : [...draft.primaryUseOrder, t.id];
                          setDraft(updateTasks(draft, ids, []));
                        }}
                      />
                    ))}
                  </View>
                  {draft.primaryUseOrder.map((id, i) => (
                    <Button
                      key={id}
                      disabled={i === 0}
                      variant="quiet"
                      title={`Đưa ${TASKS.find((t) => t.id === id)?.name} lên trước`}
                      onPress={() => {
                        const ids = [...draft.primaryUseOrder];
                        [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]];
                        setDraft(updateTasks(draft, ids, []));
                      }}
                    />
                  ))}
                  {draft.tasks.includes("vm") && (
                    <>
                      <Text style={s.body}>Bạn cần chạy bao nhiêu máy ảo?</Text>
                      {(["one", "many"] as const).map((v, i) => (
                        <ChoiceCard
                          key={v}
                          title={v === "one" ? "Một máy ảo" : "Nhiều máy ảo"}
                          description={
                            v === "one"
                              ? "Một môi trường học tập hoặc thử nghiệm."
                              : "Nhiều môi trường chạy cùng lúc."
                          }
                          symbol="VM"
                          colorIndex={i + 1}
                          selected={draft.vm === v}
                          onPress={() => setDraft({ ...draft, vm: v })}
                        />
                      ))}
                    </>
                  )}
                  <Button
                    disabled={
                      !enabled ||
                      !draft.primaryUseOrder.length ||
                      (draft.tasks.includes("vm") && draft.vm === "unknown")
                    }
                    title="Tiếp tục: ngân sách"
                    onPress={() => setScreen("budget")}
                  />
                </>
              )}
              {screen === "budget" && (
                <>
                  <Text accessibilityRole="header" style={s.stepTitle}>
                    Bạn muốn chi tối đa bao nhiêu?
                  </Text>
                  <Text style={s.body}>
                    Trần tổng chi tiêu gồm các chi phí bắt buộc đã biết. Bạn
                    luôn có thể sửa lại.
                  </Text>
                  <TextInput
                    style={s.input}
                    accessibilityLabel="Trần tổng chi tiêu VND"
                    keyboardType="number-pad"
                    value={amount}
                    onChangeText={setAmount}
                  />
                  <View style={s.budgetHighlight}>
                    <Text style={s.budgetLabel}>TRẦN CHI TIÊU CỦA BẠN</Text>
                    <Text style={s.budgetAmount}>
                      {Number.isSafeInteger(Number(amount)) &&
                      Number(amount) > 0
                        ? money(Number(amount))
                        : "Nhập số tiền hợp lệ"}
                    </Text>
                    <Text style={s.budgetHint}>
                      Bạn có thể nhập chính xác số tiền ở ô phía trên.
                    </Text>
                  </View>
                  <Text style={s.sectionLabel}>Hoặc chọn nhanh một mức</Text>
                  {[16000000, 22000000, 30000000].map((v, i) => (
                    <ChoiceCard
                      key={v}
                      title={money(v)}
                      description={
                        [
                          "Gọn ngân sách",
                          "Cân bằng nhu cầu",
                          "Thêm không gian lựa chọn",
                        ][i]
                      }
                      symbol="₫"
                      colorIndex={i}
                      selected={Number(amount) === v}
                      onPress={() => setAmount(String(v))}
                    />
                  ))}
                  <Button
                    disabled={
                      !Number.isSafeInteger(Number(amount)) ||
                      Number(amount) <= 0
                    }
                    title="Tiếp tục: ưu tiên"
                    onPress={() => setScreen("preferences")}
                  />
                  <Button
                    variant="quiet"
                    title="Quay lại"
                    onPress={() => setScreen("tasks")}
                  />
                </>
              )}
              {screen === "preferences" && (
                <>
                  <Text accessibilityRole="header" style={s.stepTitle}>
                    Điều gì quan trọng với bạn?
                  </Text>
                  <Text style={s.body}>
                    Chọn tối đa hai ưu tiên phụ. Bạn có thể bỏ qua.
                  </Text>
                  <View style={s.selectionSummary}>
                    <Text style={s.summaryText}>
                      {draft.priorities.length}/2 ưu tiên đã chọn
                    </Text>
                    <Text style={s.choiceDescription}>Không bắt buộc</Text>
                  </View>
                  {PRIORITIES.map((p, i) => (
                    <ChoiceCard
                      key={p.id}
                      title={p.name}
                      description={
                        [
                          "Dễ mang theo mỗi ngày, ít nặng vai.",
                          "Ưu tiên chi phí trong trần bạn đặt.",
                          "Thêm dư địa cho các tác vụ của bạn.",
                        ][i]
                      }
                      symbol={["↗", "₫", "✦"][i]}
                      colorIndex={i}
                      selected={draft.priorities.includes(p.id)}
                      disabled={
                        !enabled ||
                        (!draft.priorities.includes(p.id) &&
                          draft.priorities.length === 2)
                      }
                      onPress={() => {
                        const ids = draft.priorities.includes(p.id)
                          ? draft.priorities.filter((x) => x !== p.id)
                          : [...draft.priorities, p.id];
                        setDraft({ ...draft, priorities: ids });
                      }}
                    />
                  ))}
                  <Text style={s.sectionLabel}>
                    Yêu cầu bắt buộc (không được bù bằng điểm)
                  </Text>
                  {[0, 16, 32].map((n) => (
                    <Button
                      key={n}
                      variant="quiet"
                      title={`${(draft.advisor?.minimumRamGiB ?? 0) === n ? "✓ " : ""}${n ? `RAM tối thiểu ${n} GB` : "Không đặt RAM tối thiểu"}`}
                      onPress={() =>
                        setDraft({
                          ...draft,
                          advisor: {
                            ...draft.advisor,
                            minimumRamGiB: n || undefined,
                          },
                        })
                      }
                    />
                  ))}
                  {["", "Windows", "macOS", "Linux"].map((os) => (
                    <Button
                      key={os}
                      variant="quiet"
                      title={`${(draft.advisor?.mandatoryOS ?? "") === os ? "✓ " : ""}${os ? `Bắt buộc ${os}` : "Không bắt buộc OS"}`}
                      onPress={() =>
                        setDraft({
                          ...draft,
                          advisor: {
                            ...draft.advisor,
                            mandatoryOS: os || undefined,
                          },
                        })
                      }
                    />
                  ))}
                  <Text style={s.body}>
                    Chi phí phụ kiện bắt buộc (VND; bỏ trống khi chưa rõ, 0 khi
                    không cần)
                  </Text>
                  <TextInput
                    accessibilityLabel="Chi phí phụ kiện bắt buộc"
                    style={s.input}
                    keyboardType="number-pad"
                    value={
                      draft.advisor?.requiredAccessoriesVnd === null
                        ? ""
                        : String(draft.advisor?.requiredAccessoriesVnd ?? 0)
                    }
                    onChangeText={(v) =>
                      setDraft({
                        ...draft,
                        advisor: {
                          ...draft.advisor,
                          requiredAccessoriesVnd:
                            v.trim() === "" ? null : Number(v),
                        },
                      })
                    }
                  />
                  <Button
                    title="Kiểm tra lựa chọn"
                    onPress={() => setScreen("review")}
                  />
                  <Button
                    variant="quiet"
                    title="Quay lại"
                    onPress={() => setScreen("budget")}
                  />
                </>
              )}
              {screen === "review" && (
                <>
                  <Text accessibilityRole="header" style={s.stepTitle}>
                    Xác nhận lựa chọn của bạn
                  </Text>
                  <Text style={s.body}>
                    {draft.primaryUseOrder
                      .map(
                        (id, i) =>
                          `${i + 1}. ${TASKS.find((t) => t.id === id)?.name}`,
                      )
                      .join("\n")}
                  </Text>
                  <View style={s.budgetHighlight}>
                    <Text style={s.budgetLabel}>NGÂN SÁCH ĐÃ CHỌN</Text>
                    <Text style={s.budgetAmount}>{money(Number(amount))}</Text>
                    <Text style={s.budgetHint}>
                      Chỉ dùng trần này sau khi bạn xác nhận.
                    </Text>
                  </View>
                  <Text style={s.body}>
                    Ưu tiên:{" "}
                    {draft.priorities
                      .map((id) => PRIORITIES.find((p) => p.id === id)?.name)
                      .join(", ") || "Không có ưu tiên phụ"}
                  </Text>
                  <Text style={s.body}>
                    RAM bắt buộc: {draft.advisor?.minimumRamGiB ?? "không đặt"}{" "}
                    · OS: {draft.advisor?.mandatoryOS ?? "không đặt"} · Phụ
                    kiện:{" "}
                    {draft.advisor?.requiredAccessoriesVnd === null
                      ? "chưa rõ"
                      : money(draft.advisor?.requiredAccessoriesVnd ?? 0)}
                  </Text>
                  {draft.tasks.includes("vm") && (
                    <Text style={s.body}>
                      Máy ảo: {draft.vm === "many" ? "Nhiều" : "Một"}
                    </Text>
                  )}
                  <Button
                    variant="quiet"
                    title="Sửa tác vụ"
                    onPress={() => setScreen("tasks")}
                  />
                  <Button
                    variant="quiet"
                    title="Sửa ngân sách"
                    onPress={() => setScreen("budget")}
                  />
                  <Button
                    variant="quiet"
                    title="Sửa ưu tiên"
                    onPress={() => setScreen("preferences")}
                  />
                  <Button
                    disabled={!enabled}
                    title="Xác nhận và xem gợi ý"
                    onPress={async () => {
                      const n = {
                        ...draft,
                        budget: Number(amount),
                        useOrderConfirmed: true,
                        revision: state.needs.revision + 1,
                      };
                      const errors = validateNeeds(n);
                      if (errors.length) {
                        setNotice(errors.join(" "));
                        return;
                      }
                      if (
                        await commit({ ...state, needs: n, confirmed: true })
                      ) {
                        setQuery("");
                        setMaxWeight("");
                        setShowAll(false);
                        setScreen("results");
                      }
                    }}
                  />
                </>
              )}
              <Button
                variant="quiet"
                title="Hủy và về gợi ý hiện tại"
                onPress={() => setScreen("results")}
              />
            </View>
          )}
          {screen === "text" && (
            <>
              {" "}
              <View style={s.card}>
                <Text style={s.heading}>Nhập nhu cầu bằng lời</Text>
                <Text style={s.body}>
                  Nano chưa được tích hợp trong demo này. Bộ phân tích xác định
                  chỉ nhận “Tối đa … triệu” hoặc “Không quá … triệu”. Không gửi
                  nội dung lên mạng.
                </Text>
                <TextInput
                  accessibilityLabel="Nhu cầu bằng lời"
                  value={text}
                  onChangeText={(v) => {
                    setText(v);
                    setProposal(null);
                  }}
                  style={s.input}
                />
                <Button
                  disabled={!enabled}
                  title="Phân tích bằng bộ quy tắc"
                  onPress={() => {
                    try {
                      setProposal(
                        proposeBudget(text, state.needs, state.catalog),
                      );
                    } catch (e) {
                      setNotice((e as Error).message);
                    }
                  }}
                />
                {proposal && (
                  <View>
                    <Text style={s.body}>
                      Đề xuất đổi trần: {money(state.needs.budget)} →{" "}
                      {money(proposal.budget)}. Chưa áp dụng.
                    </Text>
                    <Button
                      disabled={!enabled}
                      title="Xác nhận thay đổi trần"
                      onPress={() => {
                        try {
                          const next = applyProposal(
                            proposal,
                            state.needs,
                            state.catalog,
                          );
                          setDraft(next);
                          setAmount(String(next.budget));
                          setProposal(null);
                          setScreen("review");
                        } catch (e) {
                          setNotice((e as Error).message);
                        }
                      }}
                    />
                    <Button
                      title="Bỏ đề xuất"
                      onPress={() => setProposal(null)}
                    />
                  </View>
                )}
              </View>
              <Button
                title="Quay về gợi ý"
                onPress={() => setScreen("results")}
              />
            </>
          )}
          <Text accessibilityLiveRegion="polite" style={s.notice}>
            {ready ? notice : "Đang khôi phục phiên đã lưu…"}
          </Text>
          {screen === "results" && (
            <>
              <View style={s.card}>
                <Text accessibilityRole="header" style={s.heading}>
                  {state.confirmed
                    ? "Gợi ý dành cho bạn"
                    : "Khám phá gợi ý laptop"}
                </Text>
                <Text style={s.body}>
                  {state.confirmed
                    ? "Dựa trên nhu cầu bạn đã xác nhận."
                    : "Tham khảo các bản ghi nguồn trong trần 22 triệu. Hãy chọn nhu cầu để lọc danh sách theo lựa chọn của bạn."}
                </Text>
                <Button
                  disabled={!enabled}
                  title={
                    state.confirmed
                      ? "Điều chỉnh nhu cầu"
                      : "Tìm máy phù hợp với tôi"
                  }
                  onPress={() => setScreen("tasks")}
                />
                <Button
                  disabled={!enabled}
                  title="Nhập ngân sách bằng lời"
                  onPress={() => setScreen("text")}
                />
              </View>
              {!referenceMode && (
                <>
                  <View style={s.card}>
                    <Text style={s.heading}>Khám phá và bộ lọc</Text>
                    <TextInput
                      style={s.input}
                      accessibilityLabel="Tìm cấu hình"
                      placeholder="Tìm tên, RAM, SSD"
                      value={query}
                      onChangeText={setQuery}
                    />
                    <TextInput
                      style={s.input}
                      accessibilityLabel="Trọng lượng tối đa kg"
                      placeholder="Trọng lượng tối đa (kg)"
                      keyboardType="decimal-pad"
                      value={maxWeight}
                      onChangeText={setMaxWeight}
                    />
                    {(["fit", "price", "weight"] as const).map((v) => (
                      <Button
                        key={v}
                        title={`${sort === v ? "✓ " : ""}${v === "fit" ? "Phù hợp" : v === "price" ? "Giá thấp" : "Nhẹ nhất"}`}
                        onPress={() => setSort(v)}
                      />
                    ))}
                    <Button
                      title={
                        showAll
                          ? "Chỉ xem cấu hình đạt điều kiện"
                          : "Duyệt toàn bộ catalog (gồm cấu hình không đạt)"
                      }
                      onPress={() => setShowAll(!showAll)}
                    />
                    <Button
                      title="Xóa bộ lọc và từ khóa"
                      onPress={() => {
                        setQuery("");
                        setMaxWeight("");
                        setSort("fit");
                        setShowAll(false);
                      }}
                    />
                  </View>
                  <Text style={s.heading}>
                    Kết quả · {visible.length} cấu hình
                  </Text>
                  <Text style={s.body}>
                    {state.confirmed
                      ? "Trần đã xác nhận"
                      : "Trần của kịch bản mẫu"}
                    : {money(state.needs.budget)} · Phiên {state.needs.revision}
                  </Text>
                  {!visible.length && (
                    <Text style={s.body}>
                      {result.eligible.length
                        ? "Bộ lọc hoặc từ khóa không có kết quả. Xóa bộ lọc để quay lại danh sách phù hợp."
                        : "Không có cấu hình đạt mọi điều kiện. Hãy xem các lý do loại hoặc tự sửa nhu cầu; hệ thống không tăng ngân sách."}
                    </Text>
                  )}
                  {visible.map((p) => {
                    const offer = bestOffer(p.id, state.catalog.offers)!;
                    return (
                      <View key={p.id} style={s.card}>
                        <Text style={s.heading}>{p.name}</Text>
                        <Text style={s.price}>
                          {offer
                            ? money(total(offer)!)
                            : "Chưa có tổng giá hợp lệ"}
                        </Text>
                        <Text style={s.body}>
                          {p.ram} GB RAM · {p.ssd} GB SSD · {p.weight} kg
                        </Text>
                        <Text style={s.body}>
                          {fit(p, state.needs, state.catalog.offers).eligible
                            ? "Đạt điều kiện theo quy tắc mô phỏng."
                            : fit(
                                p,
                                state.needs,
                                state.catalog.offers,
                              ).reasons.join(" ")}{" "}
                          {p.limitation}
                        </Text>
                        <Button
                          title="Xem cấu hình và nơi bán mẫu"
                          onPress={() => {
                            setDetail(p.id);
                            setScreen("detail");
                          }}
                        />
                        <Button
                          title={`${selected.includes(p.id) ? "Bỏ so sánh" : "Chọn so sánh"} · ${p.name}`}
                          onPress={() =>
                            setSelected(
                              selected.includes(p.id)
                                ? selected.filter((id) => id !== p.id)
                                : [...selected.slice(-1), p.id],
                            )
                          }
                        />
                      </View>
                    );
                  })}
                </>
              )}
            </>
          )}
          {!referenceMode && screen === "detail" && product && (
            <View style={s.card}>
              <Text style={s.heading}>
                {product.name} · {product.id}
              </Text>
              <Text style={s.body}>{product.limitation}</Text>
              <Text style={s.body}>
                {fit(product, state.needs, state.catalog.offers).reasons.join(
                  " ",
                ) || "Đạt mọi điều kiện mẫu."}{" "}
                Nguồn: fixture {product.id} / {state.catalog.version}. Không
                phải phép đo phần cứng.
              </Text>
              <Button
                title="Lưu cấu hình và quyết định"
                disabled={!enabled}
                onPress={() =>
                  void commit({
                    ...state,
                    saved: [
                      {
                        id: String(Date.now()),
                        needs: state.needs,
                        ids: [product.id],
                        date: new Date().toISOString(),
                        catalog: state.catalog.version,
                        observations: state.catalog.offers
                          .filter((o) => o.productId === product.id)
                          .map(
                            (o) =>
                              `${o.seller}: ${total(o) === null ? "Tổng chưa đủ" : money(total(o)!)} (${o.status})`,
                          ),
                      },
                      ...(state.saved ?? []),
                    ],
                  })
                }
              />

              {state.catalog.offers
                .filter((o) => o.productId === product.id)
                .map((o) => (
                  <Text key={o.id} style={s.body}>
                    {o.seller}: thân máy {money(o.base)} + giao hàng{" "}
                    {o.shipping === null ? "chưa biết" : money(o.shipping)} +
                    phí {money(o.fee)}; tổng{" "}
                    {total(o) === null ? "Chưa đủ tổng giá" : money(total(o)!)}{" "}
                    · {o.status} ·{" "}
                    {o.eligible
                      ? "Đủ điều kiện ưu đãi mẫu"
                      : "Ưu đãi có điều kiện không được tính"}
                  </Text>
                ))}
              <Text style={s.body}>
                Không có giao dịch hoặc liên kết mua thật.
              </Text>
              <Button
                title="Đóng chi tiết"
                onPress={() => {
                  setDetail(null);
                  setScreen("results");
                }}
              />
            </View>
          )}
          {!referenceMode && screen === "compare" && selected.length < 2 && (
            <View style={s.card}>
              <Text style={s.heading}>Chọn hai cấu hình để so sánh</Text>
              <Button
                title="Chọn từ danh sách gợi ý"
                onPress={() => setScreen("results")}
              />
            </View>
          )}
          {!referenceMode && screen === "compare" && selected.length === 2 && (
            <View style={s.card}>
              <Text style={s.heading}>So sánh hai cấu hình</Text>
              {selected.map((id) => {
                const p = state.catalog.products.find((x) => x.id === id)!;
                return (
                  <Text key={id} style={s.body}>
                    {p.name}: {p.ram} GB / {p.ssd} GB · {p.weight} kg ·{" "}
                    {result.eligible.some((x) => x.id === id)
                      ? "Đạt điều kiện mẫu"
                      : "Không còn phù hợp với nhu cầu hiện tại"}
                  </Text>
                );
              })}
              <Button
                title="Chia sẻ tóm tắt"
                onPress={() => {
                  void Share.share({
                    message: `Lựa Demo 2 · dữ liệu giả · ${state.catalog.version}\nTrần ${money(state.needs.budget)}\n${selected.map((id) => state.catalog.products.find((p) => p.id === id)!.name).join(" / ")}\nGiá tham khảo ngày ${state.catalog.observedAt}`,
                  }).catch(() => setNotice("Không chia sẻ được."));
                }}
              />
            </View>
          )}
          {!referenceMode && screen === "saved" && (
            <View style={s.card}>
              <Text style={s.heading}>
                Quyết định đã lưu · {state.saved?.length ?? 0}
              </Text>
              {(state.saved ?? []).map((x) => (
                <View key={x.id}>
                  <Text style={s.body}>
                    {x.ids.join(", ")} · {x.date} · {x.catalog} · Trần{" "}
                    {money(x.needs.budget)}
                  </Text>
                  <Text style={s.body}>
                    {x.observations.join("\n")} · Giá lịch sử, không xác minh
                    lại khi mở.
                  </Text>
                  <Button
                    disabled={!enabled}
                    title="Mở nhu cầu đã lưu"
                    onPress={() =>
                      void commit({
                        ...state,
                        needs: {
                          ...x.needs,
                          revision: state.needs.revision + 1,
                        },
                      })
                    }
                  />
                  <Button
                    disabled={!enabled}
                    title="Xóa quyết định này"
                    onPress={() =>
                      void commit({
                        ...state,
                        saved: state.saved?.filter((v) => v.id !== x.id),
                      })
                    }
                  />
                </View>
              ))}
              <Button
                title="Xuất dữ liệu demo"
                onPress={() =>
                  void Share.share({ message: JSON.stringify(state) }).catch(
                    () => setNotice("Không xuất được."),
                  )
                }
              />
            </View>
          )}
          {referenceMode && (
            <ReferenceExplorer
              onProposeBudget={(budget, baseRevision) => {
                if (baseRevision !== state.needs.revision) {
                  setNotice("Đề xuất đã cũ; hãy tính lại.");
                  return;
                }
                setDraft(state.needs);
                setAmount(String(budget));
                setScreen("review");
              }}
              needs={state.needs}
              screen={screen}
              onNavigate={setScreen}
            />
          )}
          {screen === "lab" && (
            <View style={s.card}>
              <Text style={s.heading}>Phòng thử tích hợp</Text>
              <Button
                title={
                  referenceMode
                    ? "Chuyển sang fixtures để thử catalog lỗi/rollback"
                    : "Quay về cơ sở dữ liệu tham chiếu thực"
                }
                onPress={() => {
                  setReferenceMode(!referenceMode);
                  setScreen("results");
                }}
              />
              <Text style={s.body}>
                Các nút cập nhật bên dưới chỉ thay catalog giả của phòng thử,
                không thay dữ liệu tham chiếu thực.
              </Text>
              <Text style={s.body}>
                Catalog: {state.catalog.version} · Giá tham khảo:{" "}
                {state.catalog.observedAt}. Bộ nhớ {storageKind}; chưa đồng bộ
                server. Các gói bên dưới được đóng sẵn để kiểm tra
                activation/rollback offline.
              </Text>
              <Button
                disabled={!enabled || state.catalog.version === UPDATE.version}
                title="Kích hoạt gói mẫu 2 (+1,5 triệu mỗi offer)"
                onPress={() => checkBundle(UPDATE)}
              />
              <Button
                disabled={!enabled}
                title="Thử gói hỏng (giá âm)"
                onPress={() =>
                  checkBundle({
                    ...UPDATE,
                    offers: UPDATE.offers.map((o, i) =>
                      i ? o : { ...o, base: -1 },
                    ),
                  })
                }
              />
              <Button
                disabled={!enabled || !state.previous}
                title="Khôi phục catalog trước"
                onPress={() => {
                  if (state.previous)
                    void commit({
                      ...state,
                      catalog: state.previous,
                      previous: state.catalog,
                    });
                }}
              />
              <Button
                title={
                  failWrite
                    ? "Tắt giả lập lỗi ghi dữ liệu"
                    : "Bật giả lập lỗi ghi dữ liệu"
                }
                onPress={() => setFailWrite(!failWrite)}
              />
              <TextInput
                multiline
                accessibilityLabel="Gói catalog JSON"
                placeholder="Dán gói catalog JSON để kiểm tra và kích hoạt"
                value={importText}
                onChangeText={setImportText}
                style={s.input}
              />
              <Button
                disabled={!enabled}
                title="Kiểm tra và nhập JSON"
                onPress={() => {
                  try {
                    checkBundle(JSON.parse(importText));
                  } catch {
                    setNotice("JSON lỗi. Catalog hiện tại được giữ.");
                  }
                }}
              />
              <Button
                title="Xuất catalog đang dùng"
                onPress={() =>
                  void Share.share({
                    message: JSON.stringify(state.catalog),
                  }).catch(() => setNotice("Không xuất được."))
                }
              />
              <Text selectable style={s.body}>
                Khóa kết quả: {result.key}
              </Text>
              <Text style={s.body}>
                Phiên và catalog được lưu sau mỗi lần xác nhận. Đóng rồi mở lại
                Demo 2 để tiếp tục.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT.bg },
  navigation: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  wizardCard: {
    padding: 22,
    gap: 20,
    backgroundColor: LIGHT.surface,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#E8E0F3",
  },
  stepPill: {
    alignSelf: "flex-start",
    backgroundColor: LIGHT.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  progressRow: { flexDirection: "row", gap: 7 },
  progressSegment: { flex: 1, height: 6, borderRadius: 3 },
  stepTitle: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
    color: LIGHT.text,
    letterSpacing: -0.6,
  },
  choices: { gap: 12 },
  choiceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    minHeight: 104,
    borderWidth: 2,
    borderRadius: 24,
  },
  choiceIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceGlyph: { fontSize: 21, fontWeight: "800" },
  choiceTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "700",
    color: LIGHT.text,
  },
  choiceDescription: { fontSize: 14, lineHeight: 21, color: "#5D526C" },
  selectedCaption: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: LIGHT.primary,
  },
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#B5A9C8",
    alignItems: "center",
    justifyContent: "center",
  },
  selectionSummary: { gap: 5, paddingVertical: 4 },
  summaryText: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "700",
    color: LIGHT.primary,
  },
  quietButton: {
    backgroundColor: "#EEE7FA",
    paddingVertical: 12,
    minHeight: 48,
  },
  quietButtonText: { color: LIGHT.primary, fontWeight: "600", fontSize: 14 },
  budgetHighlight: {
    backgroundColor: LIGHT.primary,
    padding: 22,
    borderRadius: 26,
    gap: 10,
  },
  budgetLabel: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#EEE4FF",
  },
  budgetAmount: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
    color: LIGHT.onPrimary,
  },
  budgetHint: { fontSize: 14, lineHeight: 21, color: "#F0E8FF" },
  sectionLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
    color: LIGHT.text,
  },
  page: {
    padding: 20,
    gap: 14,
    maxWidth: 820,
    width: "100%",
    alignSelf: "center",
  },
  eyebrow: { color: "#356657", fontWeight: "700", letterSpacing: 2 },
  title: { fontSize: 32, fontWeight: "800", color: "#173d32" },
  heading: { fontSize: 21, fontWeight: "700", color: "#173d32" },
  body: { fontSize: 16, lineHeight: 25, color: "#344c44" },
  card: { padding: 20, gap: 12, backgroundColor: "#e8eee5", borderRadius: 26 },
  button: {
    minHeight: 48,
    padding: 14,
    borderRadius: 18,
    backgroundColor: LIGHT.primary,
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  input: {
    minHeight: 52,
    padding: 14,
    borderWidth: 1,
    borderColor: "#6b8276",
    borderRadius: 14,
    fontSize: 18,
    color: "#173d32",
    backgroundColor: "#fff",
  },
  price: { fontSize: 26, fontWeight: "700", color: "#244e40" },
  notice: { fontSize: 16, lineHeight: 24, color: "#714800" },
});
