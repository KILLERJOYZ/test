import { syncReferenceCatalog } from "./catalog-sync";
import { rollbackReferences } from "./reference-storage";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  BackHandler,
  AppState,
  Share,
  StatusBar,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAdvisorTheme, legacyPalette } from "./AdvisorTheme";
import { ExpressiveButton } from "./ExpressiveButton";
import ReferenceExplorer from "./ReferenceExplorer";
import { storage } from "./demo-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connectedDraft } from "./unified-adapters";
import { money } from "./domain";
import { EMPTY_NEEDS, type Needs } from "./picker";
import {
  CATEGORIES,
  PURPOSES,
  DEVICE_PRIORITIES,
  OS_OPTIONS,
  FORM_OPTIONS,
  bands,
  newProfile,
  changeCategory,
  setPurposes,
  reorder,
  questions,
  profileErrors,
  validateRestoredProfile,
  applyDeviceText,
  type DeviceProfile,
  type TextProposal,
} from "./device-profile";
import {
  aiCapability,
  prepareAi,
  cancelAi,
  extractDeviceNeeds,
} from "./device-ai";

const KEY = "device-advisor-v1";
type Screen =
  | "results"
  | "category"
  | "purposes"
  | "budget"
  | "priorities"
  | "clarify"
  | "review"
  | "detail"
  | "compare"
  | "saved"
  | "settings"
  | "text";
const STEPS: Screen[] = [
  "category",
  "purposes",
  "budget",
  "priorities",
  "clarify",
  "review",
];
export function profileToNeeds(p: DeviceProfile): Needs {
  return {
    ...EMPTY_NEEDS,
    budget: p.ceilingVnd ?? 22000000,
    tasks: ["study"],
    primaryUseOrder: ["study"],
    useOrderConfirmed: p.confirmed,
    revision: p.revision,
    advisor: {
      minimumRamGiB: p.minimumRamGiB ?? undefined,
      requiredAccessoriesVnd: p.accessoriesVnd,
      mandatoryOS: p.osMandatory ? (p.os ?? undefined) : undefined,
    },
    deviceProfile: p,
  };
}
function Button({
  title,
  onPress,
  disabled = false,
  quiet = false,
  selected,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  quiet?: boolean;
  selected?: boolean;
}) {
  const { colors, reduceMotion } = useAdvisorTheme();
  return (
    <ExpressiveButton
      label={title}
      onPress={onPress}
      disabled={disabled}
      secondary={quiet}
      selected={selected}
      colors={colors}
      reduceMotion={reduceMotion}
    />
  );
}
function Choice({
  title,
  description = "",
  selected = false,
  rank,
  onPress,
  disabled = false,
}: {
  title: string;
  description?: string;
  selected?: boolean;
  rank?: number;
  onPress: () => void;
  disabled?: boolean;
}) {
  const LIGHT = legacyPalette(useAdvisorTheme().colors);
  const s = makeStyles(LIGHT);
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={title}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        s.choice,
        selected && s.chosen,
        disabled && !selected && { opacity: 0.45 },
      ]}
    >
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={s.choiceTitle}>{title}</Text>
        {!!description && <Text style={s.body}>{description}</Text>}
      </View>
      <View style={[s.badge, selected && { backgroundColor: LIGHT.primary }]}>
        <Text
          style={{
            color: LIGHT.onSecondary,
            fontWeight: "800",
          }}
        >
          {selected ? (rank ?? "✓") : "+"}
        </Text>
      </View>
    </Pressable>
  );
}
function Field({
  label,
  value,
  onChange,
  numeric = false,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  numeric?: boolean;
}) {
  const LIGHT = legacyPalette(useAdvisorTheme().colors);
  const s = makeStyles(LIGHT);
  return (
    <View style={{ gap: 7 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={s.input}
        value={value}
        onChangeText={onChange}
        keyboardType={numeric ? "number-pad" : "default"}
        secureTextEntry={label.startsWith("Khóa")}
        multiline={
          !numeric && !label.startsWith("Khóa") && !label.startsWith("Máy chủ")
        }
        placeholderTextColor={LIGHT.muted}
      />
    </View>
  );
}
export default function DeviceAdvisorApp({
  onExit,
}: { onExit?: () => void } = {}) {
  const { colors, dark } = useAdvisorTheme();
  const LIGHT = legacyPalette(colors);
  const s = makeStyles(LIGHT);
  const [draft, setDraft] = useState<DeviceProfile>(newProfile),
    [confirmed, setConfirmed] = useState<DeviceProfile>(newProfile),
    [screen, setScreen] = useState<Screen>("results"),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [restoreBlocked, setRestoreBlocked] = useState(false),
    [questionIndex, setQuestionIndex] = useState(0);
  const [token, setToken] = useState("");
  const [connection, setConnection] = useState(
    "Dữ liệu trên máy · chưa kết nối máy chủ",
  );
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [resetPending, setResetPending] = useState(false);
  const refreshing = useRef(false);
  const syncAbort = useRef<AbortController | null>(null);
  const [catalogRevision, setCatalogRevision] = useState(0),
    [serverUrl, setServerUrl] = useState("http://127.0.0.1:8788");
  useEffect(() => {
    setConnection("Dữ liệu trên máy · chưa kết nối địa chỉ này");
    return () => syncAbort.current?.abort();
  }, [serverUrl, token]);
  const [input, setInput] = useState(""),
    [proposal, setProposal] = useState<TextProposal | null>(null),
    [ai, setAi] = useState("checking"),
    [useNano, setUseNano] = useState(false),
    [aiMode, setAiMode] = useState("");
  const scroll = useRef<any>(null),
    ticket = useRef(0),
    alive = useRef(true),
    writing = useRef(false);
  useEffect(() => {
    alive.current = true;
    let active = true;
    (async () => {
      try {
        const [c, d, settings] = await Promise.all([
          storage.getItem(KEY + "-confirmed"),
          storage.getItem(KEY + "-draft"),
          storage.getItem(KEY + "-settings"),
        ]);
        if (settings && active) {
          const saved = JSON.parse(settings);
          if (typeof saved.token === "string") setToken(saved.token);
          if (typeof saved.autoRefresh === "boolean")
            setAutoRefresh(saved.autoRefresh);
          if (typeof saved.useNano === "boolean") setUseNano(saved.useNano);
          if (typeof saved.serverUrl === "string")
            setServerUrl(saved.serverUrl);
        }
        if (c && active) {
          const p = validateRestoredProfile(JSON.parse(c));
          setConfirmed(p);
          if (!d) setDraft(p);
        }
        if (d && active) setDraft(validateRestoredProfile(JSON.parse(d)));
        if (!c && !d && active) {
          const migrated = connectedDraft(
            await AsyncStorage.getItem("lua-connected-adviser-v1"),
          );
          if (migrated && active) {
            setDraft(migrated);
            setNotice(
              "Đã giữ ngân sách và yêu cầu phần cứng cũ trong bản nháp. Chọn ba mục đích và ba ưu tiên, rồi xác nhận lại.",
            );
          }
        }
      } catch {
        if (active) setRestoreBlocked(true);
        if (active)
          setNotice(
            "Không đọc được hồ sơ. Bản gốc được giữ để xuất khôi phục.",
          );
      } finally {
        if (active) setReady(true);
      }
    })();
    void aiCapability().then(setAi);
    return () => {
      active = false;
      alive.current = false;
      ticket.current++;
      void cancelAi();
    };
  }, []);
  useEffect(() => {
    if (!ready || restoreBlocked) return;
    const id = setTimeout(() => {
      void storage
        .setItem(KEY + "-draft", JSON.stringify(draft))
        .catch(() => setNotice("Không lưu được bản nháp."));
    }, 300);
    return () => clearTimeout(id);
  }, [draft, ready, restoreBlocked]);
  useEffect(() => {
    if (ready && !restoreBlocked)
      void storage
        .setItem(
          KEY + "-settings",
          JSON.stringify({ serverUrl, token, useNano, autoRefresh }),
        )
        .catch(() => setNotice("Không lưu được cài đặt."));
  }, [ready, restoreBlocked, serverUrl, token, useNano, autoRefresh]);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [screen, questionIndex]);
  useEffect(() => {
    const a = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "results") {
        onExit?.();
        return !!onExit;
      }
      const i = STEPS.indexOf(screen);
      setScreen(i > 0 ? STEPS[i - 1] : "results");
      return true;
    });
    const b = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        ticket.current++;
        setBusy(false);
        setProposal(null);
        void cancelAi();
      }
    });
    return () => {
      a.remove();
      b.remove();
    };
  }, [screen, onExit]);
  function edit(next: DeviceProfile) {
    setRestoreBlocked(false);
    ticket.current++;
    setProposal(null);
    const provenance = { ...next.provenance };
    for (const key of [
      "category",
      "pcType",
      "purposes",
      "priorities",
      "bandId",
      "targetVnd",
      "ceilingVnd",
      "accessoriesVnd",
      "condition",
      "warranty",
      "minimumRamGiB",
      "minimumStorageGiB",
      "os",
      "osMandatory",
      "formFactor",
      "formMandatory",
    ] as const) {
      if (JSON.stringify(next[key]) !== JSON.stringify(draft[key]))
        provenance[key] = { origin: "FORM", confirmed: false };
    }
    setDraft({
      ...next,
      provenance,
      confirmed: false,
      revision: draft.revision + 1,
    });
  }
  function toggle(key: "purposes" | "priorities", id: string) {
    const ids = draft[key].includes(id)
      ? draft[key].filter((x) => x !== id)
      : draft[key].length < 3
        ? [...draft[key], id]
        : draft[key];
    edit(
      key === "purposes"
        ? setPurposes(draft, ids)
        : {
            ...draft,
            priorities: ids,
            os: ids.includes("operating_system") ? draft.os : null,
            formFactor: ids.includes("form_factor") ? draft.formFactor : null,
            osMandatory: ids.includes("operating_system") && draft.osMandatory,
            formMandatory: ids.includes("form_factor") && draft.formMandatory,
          },
    );
  }
  async function commit() {
    const errors = profileErrors(draft);
    if (errors.length) {
      setNotice(errors.join(" "));
      return;
    }
    if (writing.current) return;
    writing.current = true;
    setBusy(true);
    const next = {
      ...draft,
      provenance: Object.fromEntries(
        Object.entries(draft.provenance ?? {}).map(([k, v]) => [
          k,
          { ...v, confirmed: true },
        ]),
      ),
      confirmed: true,
      revision: Math.max(draft.revision, confirmed.revision) + 1,
    };
    try {
      await storage.setItem(KEY + "-confirmed", JSON.stringify(next));
      if (alive.current) {
        setRestoreBlocked(false);
        setConfirmed(next);
        setDraft(next);
        setNotice("Đã xác nhận lựa chọn.");
        setScreen("results");
      }
    } catch {
      setNotice("Không lưu được; nhu cầu xác nhận trước vẫn được giữ.");
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }
  async function refreshCatalog() {
    if (refreshing.current || !serverUrl) return;
    refreshing.current = true;
    setBusy(true);
    const url = serverUrl,
      auth = token;
    const controller = new AbortController();
    syncAbort.current = controller;
    setConnection("Đang kiểm tra bản cập nhật…");
    try {
      const version = await syncReferenceCatalog(url, auth, controller.signal);
      if (alive.current && !controller.signal.aborted) {
        setCatalogRevision((v) => v + 1);
        setConnection(
          "Đã đồng bộ lúc " +
            new Date().toLocaleTimeString("vi-VN") +
            " · " +
            version,
        );
      }
    } catch {
      if (alive.current && !controller.signal.aborted)
        setConnection(
          "Không kết nối được. Catalog trên máy được giữ; kiểm tra địa chỉ hoặc khóa máy chủ.",
        );
    } finally {
      refreshing.current = false;
      if (alive.current) setBusy(false);
    }
  }
  useEffect(() => {
    if (!ready || !autoRefresh) return;
    void refreshCatalog();
    const timer = setInterval(() => void refreshCatalog(), 30000);
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshCatalog();
    });
    return () => {
      clearInterval(timer);
      listener.remove();
    };
  }, [ready, autoRefresh, serverUrl, token]);
  const qs = questions(draft),
    q = qs[questionIndex],
    step = STEPS.indexOf(screen),
    category = draft.category;
  const enabled = ready && !busy;
  const label = (id: string) =>
    Object.values(PURPOSES)
      .flat()
      .find((p) => p.id === id)?.label ??
    DEVICE_PRIORITIES.find((p) => p.id === id)?.label ??
    id;
  const order = (key: "purposes" | "priorities") => (
    <View style={{ gap: 8 }}>
      {draft[key].map((id, i) => (
        <View key={id} style={s.orderRow}>
          <Text style={[s.body, { flex: 1 }]}>
            {i + 1}. {label(id)}
          </Text>
          <Button
            title={`↑ ${label(id)}`}
            quiet
            disabled={i === 0}
            onPress={() =>
              edit({ ...draft, [key]: reorder(draft[key], i, -1) })
            }
          />
          <Button
            title={`↓ ${label(id)}`}
            quiet
            disabled={i === 2}
            onPress={() => edit({ ...draft, [key]: reorder(draft[key], i, 1) })}
          />
        </View>
      ))}
    </View>
  );
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <SafeAreaView style={s.root}>
        <ScrollView
          ref={scroll}
          contentContainerStyle={s.page}
          keyboardShouldPersistTaps="handled"
        >
          <Text accessibilityRole="header" style={s.title}>
            Thiết bị hợp với bạn.
          </Text>
          <View style={s.nav}>
            {[
              ["results", "Gợi ý"],
              ["saved", "Đã lưu"],
              ["compare", "So sánh"],
              ["settings", "Dữ liệu & AI"],
            ].map(([id, title]) => (
              <Button
                key={id}
                title={title}
                quiet
                selected={screen === id}
                onPress={() => setScreen(id as Screen)}
              />
            ))}
          </View>
          {!!notice && (
            <Text accessibilityLiveRegion="polite" style={s.notice}>
              {notice}
            </Text>
          )}
          {!ready && <Text style={s.body}>Đang khôi phục phiên…</Text>}
          {screen === "results" && (
            <View style={s.card}>
              <Text style={s.heading}>
                {confirmed.confirmed
                  ? "Gợi ý theo lựa chọn đã xác nhận"
                  : "Khám phá thiết bị"}
              </Text>
              <Text style={s.body}>
                {confirmed.confirmed
                  ? `${confirmed.category} · ${confirmed.purposes.map(label).join(", ")} · trần ${money(confirmed.ceilingVnd!)}`
                  : "Chọn thiết bị, ba mục đích, khoảng giá và ba ưu tiên. Mọi lựa chọn được kiểm tra trước khi tư vấn."}
              </Text>
              <Button
                disabled={!enabled}
                title={
                  confirmed.confirmed
                    ? "Điều chỉnh nhu cầu"
                    : "Bắt đầu chọn thiết bị"
                }
                onPress={() => {
                  setQuestionIndex(0);
                  setScreen("category");
                }}
              />
              <Button
                title="Nhập nhu cầu bằng lời"
                quiet
                onPress={() => setScreen("text")}
              />
            </View>
          )}
          {step >= 0 && (
            <View style={s.card}>
              <Text style={s.step}>BƯỚC {step + 1} / 6</Text>
              <View style={s.progress}>
                {STEPS.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      s.segment,
                      i <= step && { backgroundColor: LIGHT.primary },
                    ]}
                  />
                ))}
              </View>
              {screen === "category" && (
                <>
                  <Text accessibilityRole="header" style={s.heading}>
                    Bạn đang tìm thiết bị nào?
                  </Text>
                  {CATEGORIES.map((c, i) => (
                    <Choice
                      key={c}
                      title={c}
                      description={
                        [
                          "Điện thoại cho liên lạc, công việc và giải trí",
                          "Tablet để học, đọc, xem và sáng tạo",
                          "Laptop hoặc desktop theo phần mềm bạn cần",
                        ][i]
                      }
                      selected={category === c}
                      onPress={() => edit(changeCategory(draft, c))}
                    />
                  ))}
                  {category === "PC" &&
                    (["LAPTOP", "DESKTOP"] as const).map((t) => (
                      <Choice
                        key={t}
                        title={t === "LAPTOP" ? "Laptop" : "Desktop"}
                        selected={draft.pcType === t}
                        onPress={() => edit({ ...draft, pcType: t })}
                      />
                    ))}
                  <Button
                    title="Tiếp tục: ba mục đích"
                    disabled={!category || !enabled}
                    onPress={() => setScreen("purposes")}
                  />
                </>
              )}
              {screen === "purposes" && category && (
                <>
                  <Text accessibilityRole="header" style={s.heading}>
                    Chọn đúng ba mục đích
                  </Text>
                  <Text style={s.body}>
                    {draft.purposes.length}/3 đã chọn · Thứ tự 1–2–3 thể hiện
                    mức quan trọng. Nhóm người dùng sẽ có câu hỏi làm rõ.
                  </Text>
                  {PURPOSES[category].map((p, i) => (
                    <Choice
                      key={p.id}
                      title={p.label}
                      description={
                        p.persona
                          ? "Nhóm người dùng · sẽ hỏi công việc thực tế"
                          : "Mục đích sử dụng · sẽ làm rõ ứng dụng và quy mô"
                      }
                      selected={draft.purposes.includes(p.id)}
                      rank={draft.purposes.indexOf(p.id) + 1}
                      disabled={
                        !draft.purposes.includes(p.id) &&
                        draft.purposes.length === 3
                      }
                      onPress={() => toggle("purposes", p.id)}
                    />
                  ))}
                  {order("purposes")}
                  <Button
                    title="Tiếp tục: khoảng giá"
                    disabled={draft.purposes.length !== 3}
                    onPress={() => setScreen("budget")}
                  />
                </>
              )}
              {screen === "budget" && category && (
                <>
                  <Text accessibilityRole="header" style={s.heading}>
                    Khoảng giá và trần chi tiêu
                  </Text>
                  {bands(category).map((b) => (
                    <Choice
                      key={b.id}
                      title={
                        b.max === null
                          ? `Từ ${money(b.min)}`
                          : `${money(b.min)} – dưới ${money(b.max)}`
                      }
                      selected={draft.bandId === b.id}
                      description="Khoảng mong muốn; không ép bạn chi tới cận dưới"
                      onPress={() => edit({ ...draft, bandId: b.id })}
                    />
                  ))}
                  <Field
                    label="Mức chi mong muốn VND (không bắt buộc)"
                    numeric
                    value={
                      draft.targetVnd === null ? "" : String(draft.targetVnd)
                    }
                    onChange={(v) =>
                      edit({
                        ...draft,
                        targetVnd: v.trim() === "" ? null : Number(v),
                      })
                    }
                  />
                  <Field
                    label="Trần tổng chi tiêu VND"
                    numeric
                    value={
                      draft.ceilingVnd === null ? "" : String(draft.ceilingVnd)
                    }
                    onChange={(v) =>
                      edit({
                        ...draft,
                        ceilingVnd: v.trim() === "" ? null : Number(v),
                      })
                    }
                  />
                  <Field
                    label="Phụ kiện bắt buộc VND (trống = chưa biết; 0 = không cần)"
                    numeric
                    value={
                      draft.accessoriesVnd === null
                        ? ""
                        : String(draft.accessoriesVnd)
                    }
                    onChange={(v) =>
                      edit({
                        ...draft,
                        accessoriesVnd: v.trim() === "" ? null : Number(v),
                      })
                    }
                  />
                  {(["new", "used"] as const).map((v) => (
                    <Choice
                      key={v}
                      title={v === "new" ? "Máy mới" : "Máy cũ / đổi trả"}
                      selected={draft.condition === v}
                      onPress={() => edit({ ...draft, condition: v })}
                    />
                  ))}
                  <Field
                    label="RAM tối thiểu GiB (không bắt buộc)"
                    numeric
                    value={
                      draft.minimumRamGiB === null
                        ? ""
                        : String(draft.minimumRamGiB)
                    }
                    onChange={(v) =>
                      edit({
                        ...draft,
                        minimumRamGiB: v.trim() === "" ? null : Number(v),
                      })
                    }
                  />
                  <Field
                    label="Lưu trữ tối thiểu GB (không bắt buộc)"
                    value={
                      draft.minimumStorageGiB == null
                        ? ""
                        : String(draft.minimumStorageGiB)
                    }
                    numeric
                    onChange={(v) =>
                      edit({
                        ...draft,
                        minimumStorageGiB: v.trim() ? Number(v) : null,
                      })
                    }
                  />
                  {["UNKNOWN", "12", "24"].map((v) => (
                    <Button
                      key={v}
                      quiet
                      title={`${draft.warranty === v ? "✓ " : ""}${v === "UNKNOWN" ? "Bảo hành: chưa đặt yêu cầu" : `Bảo hành ít nhất ${v} tháng`}`}
                      onPress={() => edit({ ...draft, warranty: v })}
                    />
                  ))}
                  <Button
                    title="Tiếp tục: ba ưu tiên"
                    disabled={
                      !draft.bandId ||
                      !Number.isSafeInteger(draft.ceilingVnd) ||
                      !draft.ceilingVnd ||
                      draft.ceilingVnd <= 0
                    }
                    onPress={() => setScreen("priorities")}
                  />
                </>
              )}
              {screen === "priorities" && category && (
                <>
                  <Text accessibilityRole="header" style={s.heading}>
                    Chọn đúng ba ưu tiên
                  </Text>
                  <Text style={s.body}>
                    {draft.priorities.length}/3 đã chọn. Strength giữ trạng thái
                    chưa đánh giá khi chưa có rubric.
                  </Text>
                  {DEVICE_PRIORITIES.map((p) => (
                    <Choice
                      key={p.id}
                      title={p.label}
                      description={
                        p.description +
                        (category === "PC" &&
                        draft.pcType === "DESKTOP" &&
                        ["portability", "battery"].includes(p.id)
                          ? " · Không áp dụng cho desktop"
                          : "")
                      }
                      selected={draft.priorities.includes(p.id)}
                      rank={draft.priorities.indexOf(p.id) + 1}
                      disabled={
                        !draft.priorities.includes(p.id) &&
                        draft.priorities.length === 3
                      }
                      onPress={() => toggle("priorities", p.id)}
                    />
                  ))}
                  {order("priorities")}
                  {draft.priorities.includes("operating_system") && (
                    <>
                      <Text style={s.label}>Hệ điều hành</Text>
                      {OS_OPTIONS[category].map((os) => (
                        <Choice
                          key={os}
                          title={os}
                          selected={draft.os === os}
                          onPress={() => edit({ ...draft, os })}
                        />
                      ))}
                      <Choice
                        title="OS là yêu cầu bắt buộc"
                        description="Không chọn: chỉ là ưu tiên mềm"
                        selected={draft.osMandatory}
                        onPress={() =>
                          edit({ ...draft, osMandatory: !draft.osMandatory })
                        }
                      />
                    </>
                  )}
                  {draft.priorities.includes("form_factor") && (
                    <>
                      <Text style={s.label}>Kiểu dáng</Text>
                      {FORM_OPTIONS[category].map((formFactor) => (
                        <Choice
                          key={formFactor}
                          title={formFactor}
                          selected={draft.formFactor === formFactor}
                          onPress={() => edit({ ...draft, formFactor })}
                        />
                      ))}
                      <Choice
                        title="Kiểu dáng là yêu cầu bắt buộc"
                        description="Không chọn: chỉ là ưu tiên mềm"
                        selected={draft.formMandatory}
                        onPress={() =>
                          edit({
                            ...draft,
                            formMandatory: !draft.formMandatory,
                          })
                        }
                      />
                    </>
                  )}
                  <Button
                    title="Tiếp tục: làm rõ nhu cầu"
                    disabled={
                      draft.priorities.length !== 3 ||
                      (draft.priorities.includes("operating_system") &&
                        !draft.os) ||
                      (draft.priorities.includes("form_factor") &&
                        !draft.formFactor)
                    }
                    onPress={() => {
                      setQuestionIndex(0);
                      setScreen("clarify");
                    }}
                  />
                </>
              )}
              {screen === "clarify" && q && (
                <>
                  <Text accessibilityRole="header" style={s.heading}>
                    Làm rõ: {label(q.id)}
                  </Text>
                  <Text style={s.body}>
                    {questionIndex + 1}/{qs.length} · {q.why}
                  </Text>
                  <Field
                    label={q.prompt}
                    value={
                      draft.answers[q.id]?.value === "UNKNOWN"
                        ? ""
                        : (draft.answers[q.id]?.value ?? "")
                    }
                    onChange={(value) =>
                      edit({
                        ...draft,
                        answers: {
                          ...draft.answers,
                          [q.id]: { value, origin: "FORM", confirmed: true },
                        },
                      })
                    }
                  />
                  <Button
                    title="Chưa biết"
                    quiet
                    onPress={() =>
                      edit({
                        ...draft,
                        answers: {
                          ...draft.answers,
                          [q.id]: {
                            value: "UNKNOWN",
                            origin: "FORM",
                            confirmed: true,
                          },
                        },
                      })
                    }
                  />
                  <Text style={s.body}>
                    Câu trả lời: {draft.answers[q.id]?.value ?? "Chưa trả lời"}
                  </Text>
                  <Button
                    title={
                      questionIndex === qs.length - 1
                        ? "Kiểm tra lựa chọn"
                        : "Câu tiếp theo"
                    }
                    disabled={!draft.answers[q.id]?.value.trim()}
                    onPress={() =>
                      questionIndex === qs.length - 1
                        ? setScreen("review")
                        : setQuestionIndex(questionIndex + 1)
                    }
                  />
                  {questionIndex > 0 && (
                    <Button
                      title="Câu trước"
                      quiet
                      onPress={() => setQuestionIndex(questionIndex - 1)}
                    />
                  )}
                </>
              )}
              {screen === "review" && (
                <>
                  <Text accessibilityRole="header" style={s.heading}>
                    Kiểm tra toàn bộ lựa chọn
                  </Text>
                  <Text style={s.body}>
                    {category} {category === "PC" ? draft.pcType : ""}
                  </Text>
                  <Text style={s.label}>Ba mục đích</Text>
                  {draft.purposes.map((id, i) => (
                    <Text key={id} style={s.body}>
                      {i + 1}. {label(id)} ·{" "}
                      {draft.answers[id]?.value === "UNKNOWN"
                        ? "Chưa biết chi tiết"
                        : draft.answers[id]?.value}
                    </Text>
                  ))}
                  <Text style={s.label}>Ba ưu tiên</Text>
                  {draft.priorities.map((id, i) => (
                    <Text key={id} style={s.body}>
                      {i + 1}. {label(id)}
                      {id === "strength" ? " · UNRATED" : ""}
                      {category === "PC" &&
                      draft.pcType === "DESKTOP" &&
                      ["battery", "portability"].includes(id)
                        ? " · Không áp dụng"
                        : ""}
                    </Text>
                  ))}
                  <Text style={s.body}>
                    Khoảng:{" "}
                    {category &&
                    bands(category).find((b) => b.id === draft.bandId)
                      ? draft.bandId
                      : "chưa chọn"}{" "}
                    · Mong muốn:{" "}
                    {draft.targetVnd === null
                      ? "chưa đặt"
                      : money(draft.targetVnd)}
                  </Text>
                  <Text style={s.price}>
                    Trần{" "}
                    {draft.ceilingVnd === null
                      ? "chưa đặt"
                      : money(draft.ceilingVnd)}
                  </Text>
                  <Text style={s.body}>
                    Phụ kiện:{" "}
                    {draft.accessoriesVnd === null
                      ? "chưa rõ"
                      : money(draft.accessoriesVnd)}{" "}
                    · {draft.condition === "new" ? "Máy mới" : "Máy cũ"} · Bảo
                    hành:{" "}
                    {draft.warranty === "UNKNOWN"
                      ? "chưa đặt"
                      : draft.warranty + " tháng"}
                  </Text>
                  {draft.minimumStorageGiB != null && (
                    <Text style={s.body}>
                      Lưu trữ tối thiểu: {draft.minimumStorageGiB} GB
                    </Text>
                  )}
                  {draft.minimumRamGiB !== null && (
                    <Text style={s.body}>
                      RAM tối thiểu: {draft.minimumRamGiB} GiB
                    </Text>
                  )}
                  {draft.os && (
                    <Text style={s.body}>
                      OS {draft.os} ·{" "}
                      {draft.osMandatory ? "bắt buộc" : "ưu tiên"}
                    </Text>
                  )}
                  {draft.formFactor && (
                    <Text style={s.body}>
                      Kiểu dáng {draft.formFactor} ·{" "}
                      {draft.formMandatory ? "bắt buộc" : "ưu tiên"}
                    </Text>
                  )}
                  {["purposes", "budget", "priorities", "clarify"].map((id) => (
                    <Button
                      key={id}
                      quiet
                      title={`Sửa ${id === "purposes" ? "mục đích" : id === "budget" ? "ngân sách" : id === "priorities" ? "ưu tiên" : "câu trả lời"}`}
                      onPress={() => {
                        setQuestionIndex(0);
                        setScreen(id as Screen);
                      }}
                    />
                  ))}
                  <Button
                    title="Xác nhận và xem gợi ý"
                    disabled={!enabled || profileErrors(draft).length > 0}
                    onPress={() => void commit()}
                  />
                  {profileErrors(draft).map((e) => (
                    <Text key={e} style={s.notice}>
                      {e}
                    </Text>
                  ))}
                </>
              )}
              {step > 0 && (
                <Button
                  title="Quay lại"
                  quiet
                  onPress={() => setScreen(STEPS[step - 1])}
                />
              )}
              <Button
                title="Hủy, giữ gợi ý đã xác nhận"
                quiet
                onPress={() => setScreen("results")}
              />
            </View>
          )}
          {screen === "text" && (
            <View style={s.card}>
              <Text style={s.heading}>Nhập nhu cầu bằng lời</Text>
              <Text style={s.body}>
                Ví dụ: “Phone tối đa 20 triệu”. Đề xuất phải được xác nhận; ba
                mục đích và ba ưu tiên còn thiếu sẽ chọn ở biểu mẫu.
              </Text>
              <Field
                label="Nhu cầu của bạn"
                value={input}
                onChange={(value) => {
                  ticket.current++;
                  setInput(value);
                  setBusy(false);
                  void cancelAi();
                  setProposal(null);
                }}
              />
              <Button
                title="Phân tích nhu cầu"
                disabled={busy || !input.trim()}
                onPress={async () => {
                  const id = ++ticket.current;
                  setBusy(true);
                  try {
                    const result = await extractDeviceNeeds(
                      input,
                      draft,
                      useNano,
                    );
                    if (id === ticket.current) {
                      setProposal(result.proposal);
                      setAiMode(result.mode);
                    }
                  } catch (e) {
                    if (id === ticket.current) setNotice((e as Error).message);
                  } finally {
                    if (id === ticket.current) setBusy(false);
                  }
                }}
              />
              <Button
                title="Hủy phân tích"
                quiet
                onPress={() => {
                  ticket.current++;
                  setBusy(false);
                  setProposal(null);
                  void cancelAi();
                }}
              />
              {proposal && (
                <>
                  <Text style={s.body}>
                    {aiMode} · Loại: {proposal.category ?? "giữ nguyên"} · Trần:{" "}
                    {proposal.ceilingVnd === undefined
                      ? "giữ nguyên"
                      : money(proposal.ceilingVnd)}
                  </Text>
                  <Button
                    title="Chấp nhận đề xuất, bổ sung lựa chọn"
                    onPress={() => {
                      try {
                        setDraft(applyDeviceText(draft, proposal));
                        setProposal(null);
                        setScreen("category");
                      } catch (e) {
                        setNotice((e as Error).message);
                      }
                    }}
                  />
                </>
              )}
            </View>
          )}
          {screen === "settings" && (
            <View style={s.card}>
              <Text style={s.heading}>Dữ liệu và AI trên thiết bị</Text>
              <Text accessibilityLiveRegion="polite" style={s.body}>
                {connection}
              </Text>
              <Field
                label="Máy chủ catalog HTTPS / localhost"
                value={serverUrl}
                onChange={setServerUrl}
              />
              <Field
                label="Khóa dịch vụ (nếu máy chủ yêu cầu)"
                value={token}
                onChange={setToken}
              />
              <Button
                title="Đồng bộ catalog đã ký"
                disabled={busy}
                onPress={() => void refreshCatalog()}
              />
              <Choice
                title="Tự kiểm tra dữ liệu mỗi 30 giây"
                selected={autoRefresh}
                description="Chỉ tải catalog; không gửi hồ sơ nhu cầu."
                onPress={() => setAutoRefresh(!autoRefresh)}
              />
              <Button
                title="Khôi phục catalog trước"
                disabled={busy}
                onPress={async () => {
                  setBusy(true);
                  try {
                    await rollbackReferences();
                    setCatalogRevision((v) => v + 1);
                    setNotice("Đã khôi phục snapshot.");
                  } catch (e) {
                    setNotice((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              />
              <Text style={s.body}>
                AI: {ai}. Biểu mẫu luôn hoạt động offline. Không tự gửi nội dung
                lên cloud.
              </Text>
              <Button
                title="Kiểm tra AI"
                onPress={() => void aiCapability().then(setAi)}
              />
              <Button
                title="Chuẩn bị / tải AI"
                disabled={ai !== "downloadable"}
                onPress={async () => {
                  setAi("downloading");
                  try {
                    setAi(await prepareAi());
                  } catch (e) {
                    setAi("error");
                    setNotice((e as Error).message);
                  }
                }}
              />
              <Choice
                title="Dùng AI khi sẵn sàng (thử nghiệm)"
                selected={useNano}
                description="Chất lượng tiếng Việt cần đánh giá trên thiết bị; kết quả luôn được kiểm tra và review"
                onPress={() => setUseNano(!useNano)}
              />
              <Button
                title="Xuất hồ sơ và bản nháp"
                onPress={() =>
                  void Share.share({
                    message: JSON.stringify({ confirmed, draft }),
                  }).catch(() => setNotice("Không xuất được."))
                }
              />
              <Button
                title="Xuất dữ liệu gốc để khôi phục"
                onPress={async () => {
                  try {
                    const c = await storage.getItem(KEY + "-confirmed"),
                      d = await storage.getItem(KEY + "-draft");
                    await Share.share({
                      message: JSON.stringify({ confirmed: c, draft: d }),
                    });
                  } catch {
                    setNotice("Không xuất được dữ liệu gốc.");
                  }
                }}
              />
              <Button
                title="Xóa phiên hiện tại"
                onPress={async () => {
                  try {
                    await storage.removeItem(KEY + "-confirmed");
                    await storage.removeItem(KEY + "-draft");
                    const p = newProfile();
                    setConfirmed(p);
                    setDraft(p);
                    setNotice(
                      "Đã xóa phiên; các quyết định đã lưu vẫn được giữ.",
                    );
                    setRestoreBlocked(false);
                    setScreen("results");
                  } catch {
                    setNotice("Không xóa được phiên. Hãy thử lại.");
                  }
                }}
              />
              {resetPending && (
                <Button
                  title="Giữ phiên hiện tại"
                  quiet
                  onPress={() => setResetPending(false)}
                />
              )}
              {onExit && (
                <Button title="Chọn demo khác" quiet onPress={onExit} />
              )}
            </View>
          )}
          <ReferenceExplorer
            catalogRevision={catalogRevision}
            needs={profileToNeeds(confirmed)}
            endpoint={serverUrl}
            token={token}
            screen={screen}
            onNavigate={setScreen}
            onProposeBudget={(budget, revision) => {
              if (revision !== confirmed.revision) {
                setNotice("Đề xuất đã cũ.");
                return;
              }
              setDraft({
                ...confirmed,
                ceilingVnd: budget,
                confirmed: false,
                revision: confirmed.revision + 1,
              });
              setScreen("review");
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const makeStyles = (LIGHT: ReturnType<typeof legacyPalette>) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: LIGHT.bg },
    page: {
      padding: 20,
      gap: 16,
      maxWidth: 820,
      width: "100%",
      alignSelf: "center",
    },
    brand: { color: LIGHT.primary, fontWeight: "800", letterSpacing: 2 },
    title: {
      fontSize: 32,
      lineHeight: 40,
      color: LIGHT.text,
      fontWeight: "800",
    },
    heading: {
      fontSize: 26,
      lineHeight: 34,
      color: LIGHT.text,
      fontWeight: "800",
    },
    body: { fontSize: 16, lineHeight: 25, color: LIGHT.muted },
    label: {
      fontSize: 17,
      lineHeight: 25,
      fontWeight: "700",
      color: LIGHT.text,
    },
    card: {
      backgroundColor: LIGHT.surface,
      padding: 22,
      borderRadius: 30,
      gap: 16,
      borderWidth: 1,
      borderColor: LIGHT.line,
    },
    button: {
      backgroundColor: LIGHT.primary,
      padding: 15,
      minHeight: 50,
      borderRadius: 20,
      justifyContent: "center",
    },
    buttonText: {
      color: LIGHT.onPrimary,
      fontWeight: "700",
      fontSize: 15,
      lineHeight: 22,
    },
    quiet: { backgroundColor: LIGHT.container },
    nav: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    choice: {
      padding: 18,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: LIGHT.line,
      backgroundColor: LIGHT.surface,
      minHeight: 90,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    chosen: { borderColor: LIGHT.primary, backgroundColor: LIGHT.container },
    choiceTitle: {
      fontSize: 19,
      lineHeight: 26,
      fontWeight: "700",
      color: LIGHT.text,
    },
    badge: {
      height: 32,
      width: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: LIGHT.secondary,
    },
    input: {
      borderColor: LIGHT.line,
      borderWidth: 1,
      padding: 15,
      borderRadius: 16,
      minHeight: 54,
      fontSize: 18,
      color: LIGHT.text,
      backgroundColor: LIGHT.surface,
    },
    step: {
      alignSelf: "flex-start",
      backgroundColor: LIGHT.secondary,
      padding: 10,
      borderRadius: 16,
      color: LIGHT.onSecondary,
      fontWeight: "800",
    },
    progress: { flexDirection: "row", gap: 5 },
    segment: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: LIGHT.container,
    },
    notice: {
      padding: 14,
      borderRadius: 16,
      backgroundColor: LIGHT.container,
      color: LIGHT.onSecondary,
      fontSize: 15,
      lineHeight: 23,
    },
    price: {
      fontSize: 28,
      lineHeight: 36,
      color: LIGHT.primary,
      fontWeight: "800",
    },
    orderRow: {
      flexDirection: "row",
      gap: 6,
      alignItems: "center",
      flexWrap: "wrap",
    },
  });
