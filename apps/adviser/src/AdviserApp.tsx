import { NavigationIcon } from "./NavigationIcon";
import { useExpressiveTheme } from "./useExpressiveTheme";
import { ComparisonView } from "./ComparisonView";
import { ExpressiveLoading } from "./ExpressiveLoading";
import { listingEvidence, specification } from "./listing-evidence";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  AccessibilityInfo,
  Platform,
  useWindowDimensions,
  AppState,
  BackHandler,
  Linking,
  Modal,
  NativeModules,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import imported from "./real-catalog.json";
import {
  INITIAL_REQUIREMENTS,
  assess,
  budgetUpgradeCandidates,
  facts,
  observationAgeLabel,
  parseQuotationDraft,
  relatedListings,
  safeLink,
  searchCatalog,
  taskGuidance,
  validRequirements,
} from "./catalog";
import type {
  AdviceContext,
  Catalog,
  Listing,
  Requirements,
  SavedDecision,
} from "./catalog";
import { createAdviserStore } from "./adviser-store";
import type { AdviserState } from "./adviser-store";
import {
  fetchCatalog,
  fetchAdvice,
  submitListingReport,
} from "./adviser-client";
import { DEFAULT_API_ENDPOINT } from "./api/config";
import { localAdvice, localStatus } from "./local-ai";
import type { LocalAiBridge, LocalAiStatus } from "./local-ai";
import {
  EXPRESSIVE_LIGHT,
  EXPRESSIVE_DARK,
  EXPRESSIVE_SHAPE,
  EXPRESSIVE_SPACE,
  EXPRESSIVE_TYPE,
  EXPRESSIVE_ELEVATION,
} from "./expressive-theme";
import { ExpressiveSurface } from "./ExpressiveSurface";
import { ExpressiveButton } from "./ExpressiveButton";
import { VI, formatVnd } from "./i18n";
import DeviceAdvisorApp from "./DeviceAdvisorApp";
import { AdvisorTheme } from "./AdvisorTheme";
const localBridge = NativeModules.AdviserLocalAi as LocalAiBridge | undefined;

const KEY = "lua-connected-adviser-v1";
const INITIAL: AdviserState = {
  schemaVersion: 1,
  requirements: INITIAL_REQUIREMENTS,
  revision: 0,
  saved: [],
  catalog: imported as Catalog,
  endpoint: DEFAULT_API_ENDPOINT,
  token: "",
};
const money = formatVnd;
const TASKS = [
  "Văn phòng & học tập",
  "Lập trình",
  "Thiết kế",
  "Máy ảo",
  "Chơi game",
];
export default function AdviserApp() {
  return (
    <AdvisorTheme>
      <SafeAreaProvider>
        <Adviser />
      </SafeAreaProvider>
    </AdvisorTheme>
  );
}
function Adviser() {
  const [deviceAdvisorOpen, setDeviceAdvisorOpen] = useState(false);
  const dark = useColorScheme() === "dark";
  const c = useExpressiveTheme(dark);
  const { width } = useWindowDimensions();
  const expanded = width >= 840;
  const [reduceMotion, setReduceMotion] = useState(true);
  const [deletion, setDeletion] = useState<{
    label: string;
    run: () => Promise<boolean>;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const budgetInput = useRef<any>(null);
  const needsScroll = useRef<any>(null);
  const [fieldError, setFieldError] = useState("");
  useEffect(() => {
    let mounted = true;
    const check = () =>
      void AccessibilityInfo.isReduceMotionEnabled().then((v) => {
        if (mounted) setReduceMotion(v);
      });
    check();
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    const app = AppState.addEventListener("change", (v) => {
      if (v === "active") check();
    });
    return () => {
      mounted = false;
      listener.remove();
      app.remove();
    };
  }, []);
  const [aiStatus, setAiStatus] = useState<LocalAiStatus>("unavailable");
  useEffect(() => {
    void localStatus(localBridge).then(setAiStatus);
  }, []);
  const [state, setState] = useState(INITIAL),
    [boot, setBoot] = useState<"loading" | "ready" | "failed">("loading");
  const storeRef = useRef<ReturnType<typeof createAdviserStore> | null>(null);
  function getStore() {
    if (!storeRef.current) {
      storeRef.current = createAdviserStore(
        INITIAL,
        () => AsyncStorage.getItem(KEY),
        (raw) => AsyncStorage.setItem(KEY, raw),
        setState,
      );
    }
    return storeRef.current;
  }
  const [tab, setTab] = useState("advisor"),
    [query, setQuery] = useState(""),
    [savedQuery, setSavedQuery] = useState(""),
    [source, setSource] = useState(""),
    [sort, setSort] = useState("price"),
    [showExcluded, setShowExcluded] = useState(false);
  const [form, setForm] = useState(false),
    [quoteModal, setQuoteModal] = useState(false),
    [quoteName, setQuoteName] = useState(""),
    [quoteUrl, setQuoteUrl] = useState(""),
    [quotePrice, setQuotePrice] = useState(""),
    [quoteShipping, setQuoteShipping] = useState(""),
    [quoteFees, setQuoteFees] = useState(""),
    [quoteRam, setQuoteRam] = useState(""),
    [quoteStorage, setQuoteStorage] = useState(""),
    [quoteError, setQuoteError] = useState(""),
    [draft, setDraft] = useState<Requirements>(INITIAL_REQUIREMENTS),
    [budget, setBudget] = useState("25000000");
  const [selected, setSelected] = useState<string[]>([]),
    [detail, setDetail] = useState<Listing | null>(null),
    [historical, setHistorical] = useState(false),
    [history, setHistory] = useState<SavedDecision | null>(null);
  const [notice, setNotice] = useState(""),
    [connection, setConnection] = useState(
      "Dữ liệu đóng gói · chưa kết nối nguồn cập nhật",
    ),
    [checkedAt, setCheckedAt] = useState(""),
    [refreshing, setRefreshing] = useState(false);
  const [endpoint, setEndpoint] = useState(""),
    [token, setToken] = useState(""),
    [question, setQuestion] = useState(""),
    [answer, setAnswer] = useState(""),
    [proposal, setProposal] = useState<Requirements | null>(null),
    [busy, setBusy] = useState(false);
  const request = useRef(0),
    abort = useRef<AbortController | null>(null),
    refreshAbort = useRef<AbortController | null>(null),
    refreshBusy = useRef(false),
    ids = useRef(0);
  function cancel() {
    request.current++;
    abort.current?.abort();
    setBusy(false);
  }
  async function persist(reduce: (s: AdviserState) => AdviserState) {
    const ok = await getStore().update(reduce);
    if (!ok)
      setNotice("Không lưu được thay đổi. Dữ liệu đã lưu trước đó được giữ.");
    return ok;
  }
  useEffect(() => {
    let mounted = true;
    const bootTimer = setTimeout(() => {
      if (mounted) setBoot((b) => (b === "loading" ? "failed" : b));
    }, 5000);
    void getStore()
      .load()
      .then((ok) => {
        if (mounted) {
          clearTimeout(bootTimer);
          setBoot(ok ? "ready" : "failed");
          const currentEndpoint = getStore().current().endpoint;
          if (!currentEndpoint && DEFAULT_API_ENDPOINT) {
            void persist((s) => ({ ...s, endpoint: DEFAULT_API_ENDPOINT }));
            setEndpoint(DEFAULT_API_ENDPOINT);
          } else {
            setEndpoint(currentEndpoint);
          }
          setToken(getStore().current().token);
        }
      });
    return () => {
      mounted = false;
      clearTimeout(bootTimer);
      abort.current?.abort();
      refreshAbort.current?.abort();
    };
  }, []);
  async function refresh() {
    const current = getStore().current();
    if (!current.endpoint || !getStore().ready() || refreshBusy.current) return;
    refreshBusy.current = true;
    setRefreshing(true);
    const controller = new AbortController();
    refreshAbort.current = controller;
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const value = await fetchCatalog(
        current.endpoint,
        current.token,
        controller.signal,
      );
      if (
        current.endpoint !== getStore().current().endpoint ||
        current.token !== getStore().current().token
      )
        return;
      if (value.catalog.revision !== getStore().current().catalog.revision) {
        cancel();
        setAnswer("");
        setProposal(null);
        if (!(await persist((s) => ({ ...s, catalog: value.catalog })))) return;
        setSelected((ids) =>
          ids.filter((id) =>
            value.catalog.listings.some((v: Listing) => v.id === id),
          ),
        );
        setDetail(null);
      }
      setCheckedAt(value.checkedAt);
      setConnection("Đã kết nối · tự kiểm tra thay đổi mỗi 30 giây");
    } catch {
      if (!controller.signal.aborted || getStore().ready())
        setConnection(
          "Nguồn không truy cập được · giữ bản đã lưu; giá hiện tại chưa xác minh",
        );
    } finally {
      clearTimeout(timer);
      refreshBusy.current = false;
      setRefreshing(false);
    }
  }
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  const cancelRef = useRef(cancel);
  cancelRef.current = cancel;
  useEffect(() => {
    if (boot !== "ready" || !state.endpoint) return;
    void refreshRef.current();
    const timer = setInterval(() => void refreshRef.current(), 30000);
    return () => {
      clearInterval(timer);
      refreshAbort.current?.abort();
    };
  }, [boot, state.endpoint, state.token]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") {
        cancelRef.current();
        refreshAbort.current?.abort();
      } else void refreshRef.current();
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (deviceAdvisorOpen) return;
    if (Platform.OS === "web") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (deletion) {
        if (!pending) setDeletion(null);
        return true;
      }
      if (form) {
        setForm(false);
        return true;
      }
      if (quoteModal) {
        setQuoteModal(false);
        return true;
      }
      if (detail) {
        cancel();
        setDetail(null);
        return true;
      }
      if (history) {
        setHistory(null);
        return true;
      }
      if (tab !== "advisor") {
        setTab("advisor");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [
    form,
    quoteModal,
    detail,
    history,
    tab,
    deletion,
    pending,
    deviceAdvisorOpen,
  ]);
  const rows = useMemo(
    () => searchCatalog(state.catalog, state.requirements, query, source, sort),
    [state.catalog, state.requirements, query, source, sort],
  );
  const visible = rows.filter(
    (x) => showExcluded || x.assessment.state !== "excluded",
  );
  const upgrades = useMemo(
    () => budgetUpgradeCandidates(state.catalog, state.requirements),
    [state.catalog, state.requirements],
  );
  const siblings = useMemo(
    () => (detail && !historical ? relatedListings(state.catalog, detail) : []),
    [state.catalog, detail, historical],
  );
  const filteredSaved = useMemo(() => {
    const q = savedQuery.trim().toLocaleLowerCase("vi");
    if (!q) return state.saved;
    return state.saved.filter((s) =>
      [
        s.savedAt,
        new Date(s.savedAt).toLocaleString("vi-VN"),
        ...s.listings.map((v) => `${v.name} ${v.source}`),
      ]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(q),
    );
  }, [state.saved, savedQuery]);
  function open(v: Listing, old = false) {
    setNotice("");
    cancel();
    setAnswer("");
    setProposal(null);
    setQuestion("");
    setDetail(v);
    setHistorical(old);
  }
  function edit(r = state.requirements) {
    setNotice("");
    setFieldError("");
    setDraft(JSON.parse(JSON.stringify(r)));
    setBudget(String(r.budget));
    setForm(true);
  }
  async function confirm() {
    if (pendingRef.current) return;
    const trimmed = budget.trim();
    const numericBudget = Number(trimmed);
    const r = { ...draft, budget: numericBudget };
    if (!validRequirements(r)) {
      const msg =
        !trimmed || !/^-?\d+$/.test(trimmed)
          ? "Ngân sách phải là số nguyên (VND). Nhập ngân sách nguyên dương, tối đa 1.000.000.000 ₫."
          : numericBudget <= 0
            ? "Ngân sách phải lớn hơn 0 ₫. Nhập ngân sách nguyên dương, tối đa 1.000.000.000 ₫."
            : numericBudget > 1000000000
              ? "Ngân sách vượt giới hạn. Nhập ngân sách nguyên dương, tối đa 1.000.000.000 ₫."
              : "Nhập ngân sách nguyên dương, tối đa 1.000.000.000 ₫.";
      setFieldError(msg);
      needsScroll.current?.scrollTo({ y: 0, animated: false });
      budgetInput.current?.focus();
      return;
    }
    setFieldError("");
    pendingRef.current = true;
    setPending(true);
    const committed = await persist((s) => ({
      ...s,
      requirements: r,
      revision: s.revision + 1,
    }));
    pendingRef.current = false;
    setPending(false);
    if (committed) {
      setNotice("Đã cập nhật nhu cầu và đánh giá lại danh sách.");
      cancel();
      setAnswer("");
      setProposal(null);
      setHistory(null);
      setForm(false);
    }
  }
  async function save(listings: Listing[]) {
    if (!listings.length || pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    const current = getStore().current();
    const snapshot: SavedDecision = {
      id: `decision-${Date.now()}-${++ids.current}`,
      savedAt: new Date().toISOString(),
      catalogRevision: current.catalog.revision,
      requirements: JSON.parse(JSON.stringify(current.requirements)),
      listings: JSON.parse(JSON.stringify(listings)),
    };
    if (
      await persist((s) => ({
        ...s,
        saved: [snapshot, ...s.saved].slice(0, 1000),
      }))
    )
      setNotice("Đã lưu bản quyết định kèm cấu hình và giá lịch sử.");
    pendingRef.current = false;
    setPending(false);
  }
  async function ask() {
    if (!detail || historical) return;
    cancel();
    const current = getStore().current();
    const context: AdviceContext = {
      catalogRevision: current.catalog.revision,
      decisionRevision: current.revision,
      focusId: detail.id,
      requestId: String(++request.current),
    };
    const controller = new AbortController();
    abort.current = controller;
    setBusy(true);
    setProposal(null);
    const timer = setTimeout(() => controller.abort(), 50000);
    try {
      let value;
      if (localBridge) {
        value = await localAdvice(
          localBridge,
          context,
          detail,
          current.requirements,
          question,
          controller.signal,
        );
      } else if (current.endpoint) {
        value = await fetchAdvice(
          current.endpoint,
          current.token,
          context,
          current.requirements,
          question,
          controller.signal,
        );
      } else {
        throw Error("NO_AI_SERVICE");
      }
      const latest = getStore().current();
      if (
        controller.signal.aborted ||
        request.current !== Number(context.requestId) ||
        latest.catalog.revision !== context.catalogRevision ||
        latest.revision !== context.decisionRevision
      )
        return;
      setAnswer(value.text);
      setProposal(value.proposal);
    } catch (e) {
      if (request.current === Number(context.requestId))
        setAnswer(
          "AI chưa sẵn sàng hoặc phản hồi chưa hợp lệ. Nhu cầu được giữ nguyên. Kiểm tra trạng thái AI hoặc xem dữ kiện có nguồn ở phía trên.",
        );
    } finally {
      clearTimeout(timer);
      if (request.current === Number(context.requestId)) setBusy(false);
    }
  }
  const txt = (text: string, small = false) => (
    <Text
      style={{
        ...(small ? EXPRESSIVE_TYPE.caption : EXPRESSIVE_TYPE.body),
        color: small ? c.muted : c.text,
      }}
    >
      {text}
    </Text>
  );
  const button = (
    label: string,
    onPress: () => void,
    secondary = false,
    disabled = false,
    choice?: { selected: boolean; role?: "radio" | "checkbox" },
    loading = false,
  ) => (
    <ExpressiveButton
      label={label}
      onPress={onPress}
      secondary={secondary}
      disabled={disabled}
      loading={loading}
      selected={choice?.selected}
      role={choice?.role}
      colors={c}
      reduceMotion={reduceMotion}
    />
  );
  const input = (
    value: string,
    onChangeText: (t: string) => void,
    label: string,
    numeric = false,
    secure = false,
  ) => {
    const isBudget = label === "Ngân sách tối đa (VND)";
    return (
      <View style={{ gap: EXPRESSIVE_SPACE.xs }}>
        {txt(label, true)}
        <TextInput
          ref={isBudget ? budgetInput : undefined}
          accessibilityLabel={label}
          accessibilityHint={isBudget && fieldError ? fieldError : undefined}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          keyboardType={numeric ? "numeric" : "default"}
          autoCapitalize="none"
          style={{
            minHeight: 48,
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: EXPRESSIVE_SHAPE.field,
            padding: EXPRESSIVE_SPACE.md,
            color: c.text,
            backgroundColor: c.card,
          }}
        />
        {isBudget && fieldError ? (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
            style={{ ...EXPRESSIVE_TYPE.label, color: c.error }}
          >
            {fieldError}
          </Text>
        ) : null}
      </View>
    );
  };
  const card = (children: React.ReactNode, key?: string) => (
    <View
      key={key}
      style={{
        backgroundColor: c.card,
        borderRadius: EXPRESSIVE_SHAPE.card,
        padding: EXPRESSIVE_SPACE.xl,
        gap: EXPRESSIVE_SPACE.md,
        borderWidth: 1,
        borderColor: c.line,
        ...EXPRESSIVE_ELEVATION.card,
      }}
    >
      {children}
    </View>
  );
  function summary(v: Listing) {
    return `${v.name}\n${specification(v)}\nGiá niêm yết lịch sử: ${money(v.advertisedPrice)}\n${v.source} · ${v.observedAt}\nTổng chi, tồn kho và năng lực tác vụ chưa xác minh.\n${v.url}`;
  }
  function listingCard(v: Listing) {
    const a = assess(v, state.requirements);
    const g = taskGuidance(v, state.requirements);
    return card(
      <>
        {txt(
          v.source.toUpperCase() +
            (v.brand ? ` · ${v.brand}` : "") +
            " · " +
            (v.condition === "used" ? "Máy cũ" : "Tin đăng") +
            " · " +
            observationAgeLabel(v.observedAt),
          true,
        )}
        <Text
          accessibilityRole="header"
          style={{ ...EXPRESSIVE_TYPE.section, color: c.text }}
        >
          {v.name}
        </Text>
        {txt(
          `${specification(v)} · ${v.cpu ?? "CPU chưa rõ"}` +
            (v.gpu ? ` · ${v.gpu}` : ""),
        )}
        {g.strengths.length > 0 &&
          txt("Điểm phù hợp đã biết: " + g.strengths.join(" · "), true)}
        {listingEvidence(v).conflicts.map((issue) => (
          <Text
            key={issue}
            accessibilityRole="alert"
            style={{ ...EXPRESSIVE_TYPE.label, color: c.error }}
          >
            {issue} · cần kiểm tra nguồn
          </Text>
        ))}
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            ...EXPRESSIVE_TYPE.section,
            color: c.text,
            fontVariant: ["tabular-nums"],
          }}
        >
          {money(v.advertisedPrice)}
        </Text>
        {(Boolean(
          v.priceOriginal && v.priceOriginal > (v.advertisedPrice ?? 0),
        ) ||
          Boolean(v.installment)) &&
          txt(
            [
              v.priceOriginal && v.priceOriginal > (v.advertisedPrice ?? 0)
                ? `Niêm yết: ${money(v.priceOriginal)}${v.discountPercent ? ` (-${v.discountPercent}%)` : ""}`
                : "",
              v.installment ?? "",
            ]
              .filter(Boolean)
              .join(" · "),
            true,
          )}
        {txt(
          a.total !== null
            ? `Giá ghi nhận ${new Date(v.observedAt).toLocaleString("vi-VN")}. Tổng chi phí đã biết: ${money(a.total)}.`
            : `Giá ghi nhận ${new Date(v.observedAt).toLocaleString("vi-VN")}. Tổng thanh toán chưa rõ.`,
          true,
        )}
        {txt(
          a.failed.length
            ? "Không đạt: " + a.failed.join("; ")
            : "Cần xác minh · chưa phải đề xuất phù hợp",
          true,
        )}
        <View style={styles.row}>
          {button("Xem cấu hình", () => open(v))}
          {button(
            selected.includes(v.id) ? "Bỏ so sánh" : "So sánh",
            () => {
              if (selected.includes(v.id)) {
                setSelected((ids) => ids.filter((x) => x !== v.id));
              } else if (selected.length >= 2) {
                setNotice("Chỉ so sánh tối đa 2 cấu hình.");
              } else {
                setSelected((ids) =>
                  ids.includes(v.id) || ids.length >= 2 ? ids : [...ids, v.id],
                );
              }
            },
            true,
          )}
        </View>
      </>,
      v.id,
    );
  }
  function savedCard(s: SavedDecision) {
    return card(
      <>
        {txt(
          "Ngày lưu: " +
            new Date(s.savedAt).toLocaleDateString("vi-VN") +
            " · " +
            new Date(s.savedAt).toLocaleString("vi-VN"),
          true,
        )}
        <Text
          accessibilityRole="header"
          style={{ ...EXPRESSIVE_TYPE.section, color: c.text }}
        >
          {s.listings.map((v) => v.name).join("\n")}
        </Text>
        {txt("Ngân sách khi lưu: " + money(s.requirements.budget), true)}
        {button(VI.openHistorySnapshot, () => setHistory(s))}
        {button(
          VI.deleteSavedSnapshot,
          () =>
            setDeletion({
              label: `Xóa bản lưu: ${s.listings.map((v) => v.name).join(", ")}?`,
              run: () =>
                persist((latest) => ({
                  ...latest,
                  saved: latest.saved.filter((x) => x.id !== s.id),
                })),
            }),
          true,
        )}
      </>,
      s.id,
    );
  }
  function modal(
    visible: boolean,
    title: string,
    close: () => void,
    children: React.ReactNode,
  ) {
    const sheetContent = (
      <SafeAreaView
        style={
          expanded
            ? {
                width: Math.min(640, Math.round(width * 0.56)),
                height: "100%",
                backgroundColor: c.bg,
                borderTopLeftRadius: EXPRESSIVE_SHAPE.dialog,
                borderBottomLeftRadius: EXPRESSIVE_SHAPE.dialog,
                borderLeftWidth: 1,
                borderColor: c.line,
                ...EXPRESSIVE_ELEVATION.modal,
              }
            : { flex: 1, backgroundColor: c.bg }
        }
      >
        <View
          style={{
            padding: EXPRESSIVE_SPACE.lg,
            gap: EXPRESSIVE_SPACE.sm,
            width: "100%",
            maxWidth: 840,
            alignSelf: "center",
          }}
        >
          <Text
            accessibilityRole="header"
            numberOfLines={2}
            accessibilityLabel={title}
            style={{
              ...EXPRESSIVE_TYPE.title,
              color: c.text,
            }}
          >
            {title}
          </Text>
          {button(VI.close, close, true)}
        </View>
        {notice ? (
          <View
            accessibilityLiveRegion="polite"
            style={{
              padding: EXPRESSIVE_SPACE.lg,
              borderRadius: EXPRESSIVE_SHAPE.selected,
              backgroundColor: c.container,
              gap: EXPRESSIVE_SPACE.sm,
              width: "100%",
              maxWidth: 840,
              alignSelf: "center",
            }}
          >
            {txt(notice)}
            {button(VI.acknowledge, () => setNotice(""), true)}
          </View>
        ) : null}
        <ScrollView
          ref={title === VI.needsModalTitle ? needsScroll : undefined}
          contentContainerStyle={{
            padding: EXPRESSIVE_SPACE.lg,
            gap: EXPRESSIVE_SPACE.lg,
            paddingBottom: 40,
            width: "100%",
            maxWidth: 840,
            alignSelf: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <ExpressiveSurface reduceMotion={reduceMotion}>
            {children}
          </ExpressiveSurface>
        </ScrollView>
      </SafeAreaView>
    );
    return (
      <Modal
        visible={visible}
        transparent={expanded}
        onRequestClose={close}
        animationType={reduceMotion ? "none" : "fade"}
      >
        {expanded ? (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
              backgroundColor: "rgba(15, 29, 22, 0.42)",
            }}
          >
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel={VI.closeSheetBackdrop}
              style={{ flex: 1 }}
            />
            {sheetContent}
          </View>
        ) : (
          sheetContent
        )}
      </Modal>
    );
  }
  if (boot === "loading")
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: c.bg,
        }}
      >
        <ExpressiveLoading
          label={VI.bootLoading}
          color={c.text}
          reduceMotion={reduceMotion}
        />
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      {deviceAdvisorOpen ? (
        <DeviceAdvisorApp
          asFeature
          onExit={() => setDeviceAdvisorOpen(false)}
        />
      ) : (
        <FlatList<
          | { kind: "listing"; listing: Listing }
          | { kind: "saved"; saved: SavedDecision }
        >
          data={
            tab === "advisor" || tab === "explore"
              ? visible.map((x) => ({
                  kind: "listing" as const,
                  listing: x.listing,
                }))
              : tab === "saved"
                ? filteredSaved.map((s) => ({
                    kind: "saved" as const,
                    saved: s,
                  }))
                : []
          }
          keyExtractor={(item) =>
            item.kind === "listing" ? item.listing.id : item.saved.id
          }
          renderItem={({ item }) => (
            <View
              style={
                expanded && item.kind === "listing" ? { flex: 1 } : undefined
              }
            >
              {item.kind === "listing"
                ? listingCard(item.listing)
                : savedCard(item.saved)}
            </View>
          )}
          numColumns={
            expanded && (tab === "advisor" || tab === "explore") ? 2 : 1
          }
          columnWrapperStyle={
            expanded && (tab === "advisor" || tab === "explore")
              ? { gap: EXPRESSIVE_SPACE.lg }
              : undefined
          }
          initialNumToRender={5}
          windowSize={7}
          key={`${tab}-${expanded ? "2col" : "1col"}`}
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{
            padding: EXPRESSIVE_SPACE.lg,
            gap: EXPRESSIVE_SPACE.lg,
            paddingBottom: 30,
            width: "100%",
            maxWidth: expanded ? 1120 : 680,
            alignSelf: "center",
          }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <ExpressiveSurface key={tab} reduceMotion={reduceMotion}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text
                    accessibilityRole="header"
                    style={{ ...EXPRESSIVE_TYPE.display, color: c.text }}
                  >
                    {VI.brandTitle}
                  </Text>
                  {txt(VI.brandSubtitle, true)}
                </View>
                {button(
                  refreshing ? VI.refreshBusy : VI.refreshAction,
                  () => void refresh(),
                  true,
                  refreshing || !state.endpoint,
                  undefined,
                  refreshing,
                )}
              </View>
              {boot === "failed" &&
                card(
                  <>
                    {txt(VI.bootFailedNotice)}
                    {button(
                      VI.exportRawData,
                      () => {
                        void AsyncStorage.getItem(KEY)
                          .then((raw) =>
                            Share.share({
                              message: raw ?? "Không đọc được dữ liệu",
                            }),
                          )
                          .catch(() =>
                            setNotice("Không đọc được dữ liệu gốc."),
                          );
                      },
                      true,
                    )}
                    {button(
                      VI.restoreInitialData,
                      () => {
                        void getStore()
                          .update(() => INITIAL, true)
                          .then((ok) => {
                            if (ok) setBoot("ready");
                          });
                      },
                      true,
                    )}
                  </>,
                )}
              {notice &&
                card(
                  <>
                    {txt(notice)}
                    {button(VI.acknowledge, () => setNotice(""), true)}
                  </>,
                )}
              {txt(connection, true)}
              {(tab === "advisor" || tab === "explore") &&
                card(
                  <>
                    <Text style={{ ...EXPRESSIVE_TYPE.section, color: c.text }}>
                      Device Advisor
                    </Text>
                    {txt(
                      "Điện thoại, tablet hoặc PC · lựa chọn đầy đủ theo ba mục đích và ba ưu tiên.",
                      true,
                    )}
                    {button("Mở Device Advisor", () => {
                      cancel();
                      setDeviceAdvisorOpen(true);
                    })}
                  </>,
                )}
              {checkedAt &&
                txt(
                  "Kiểm tra máy chủ: " +
                    new Date(checkedAt).toLocaleString("vi-VN"),
                  true,
                )}
              {(tab === "advisor" || tab === "explore") && (
                <>
                  {tab === "advisor" &&
                    card(
                      <ExpressiveSurface
                        key={state.revision}
                        reduceMotion={reduceMotion}
                      >
                        <Text
                          style={{
                            ...EXPRESSIVE_TYPE.headline,
                            color: c.text,
                          }}
                        >
                          {VI.heroTitle}
                        </Text>
                        {txt(
                          `${state.catalog.listings.length} tin đăng thực tế từ dữ liệu kho. Giá là quan sát lịch sử, không phải giá trực tiếp.`,
                        )}
                        {txt(
                          `Trần chi: ${money(state.requirements.budget)} · ${state.requirements.minRam ? `RAM ≥ ${state.requirements.minRam} GB` : "RAM: chưa đặt yêu cầu"} · ${state.requirements.minStorage ? `Ổ ≥ ${state.requirements.minStorage} GB` : "Ổ: chưa đặt yêu cầu"}`,
                        )}
                        {txt(
                          state.requirements.tasks.join(" · ") ||
                            "Chưa chọn tác vụ",
                          true,
                        )}
                        {button(VI.adjustNeeds, () => edit())}
                        {button(
                          VI.checkExternalQuote,
                          () => {
                            setQuoteError("");
                            setQuoteModal(true);
                          },
                          true,
                        )}
                      </ExpressiveSurface>,
                    )}
                  {input(query, setQuery, VI.searchPlaceholder)}
                  <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
                    {[
                      "",
                      ...new Set(state.catalog.listings.map((v) => v.source)),
                    ].map((s) => (
                      <View key={s}>
                        {button(
                          s || "Mọi nguồn",
                          () => setSource(s),
                          source !== s,
                          false,
                          { selected: source === s, role: "radio" },
                        )}
                      </View>
                    ))}
                  </ScrollView>
                  <View style={styles.row}>
                    {button(
                      sort === "price"
                        ? "Sắp xếp: giá lịch sử"
                        : "Sắp xếp: tên",
                      () => setSort(sort === "price" ? "name" : "price"),
                      true,
                    )}
                    {button(
                      showExcluded ? "Ẩn máy không đạt" : "Hiện máy không đạt",
                      () => setShowExcluded(!showExcluded),
                      true,
                    )}
                  </View>
                  {txt(
                    `${visible.length} tin cần kiểm tra · ${rows.filter((x) => x.assessment.state === "excluded").length} không đạt yêu cầu đã biết`,
                    true,
                  )}
                  {!visible.length &&
                    card(
                      <>
                        {txt(
                          query
                            ? "Không tìm thấy tin khớp từ khóa."
                            : source
                              ? "Nguồn này không có tin đáp ứng bộ lọc."
                              : connection.startsWith(
                                    "Nguồn không truy cập được",
                                  ) && !state.catalog.listings.length
                                ? "Nguồn dữ liệu hiện không truy cập được và chưa có dữ liệu đã lưu."
                                : "Không có tin đáp ứng các tiêu chí đã biết. Giữ nguyên ngân sách và yêu cầu.",
                        )}
                        {!query && !source && rows.length > 0 && (
                          <>
                            {txt(
                              `Lý do loại: ${rows.filter((x) => x.assessment.failed.some((f) => f.includes("ngân sách"))).length} vượt ngân sách · ${rows.filter((x) => x.assessment.failed.some((f) => f.includes("RAM"))).length} thiếu RAM · ${rows.filter((x) => x.assessment.failed.some((f) => f.includes("Ổ"))).length} thiếu ổ lưu trữ · ${rows.filter((x) => x.assessment.failed.some((f) => f.includes("Hệ điều hành"))).length} lệch hệ điều hành.`,
                              true,
                            )}
                            {upgrades.length > 0 &&
                              txt(
                                `Tham khảo trần chi (+5.000.000 ₫, không khuyến khích vượt ngân sách): có ${upgrades.length} tin chỉ vượt trần hiện tại, ví dụ ${upgrades[0].listing.name} (+${money(upgrades[0].extraVnd)} · ${specification(upgrades[0].listing)} · vẫn cần tự xác minh tồn kho và phí).`,
                                true,
                              )}
                          </>
                        )}
                        {query || source
                          ? button("Xóa tìm kiếm & bộ lọc", () => {
                              setQuery("");
                              setSource("");
                            })
                          : button("Chỉnh nhu cầu", () => edit())}
                      </>,
                    )}
                </>
              )}
              {tab === "compare" && (
                <>
                  {txt("Đối chiếu cấu hình · tối đa 2 tin đăng")}
                  {selected.length === 0 &&
                    txt("Chọn “So sánh” trên các thẻ máy để bắt đầu.")}
                  <ComparisonView
                    items={selected
                      .map((id) =>
                        state.catalog.listings.find((v) => v.id === id),
                      )
                      .filter((v): v is Listing => !!v)}
                    requirements={state.requirements}
                    expanded={expanded}
                    colors={c}
                    reduceMotion={reduceMotion}
                    onRemove={(id) =>
                      setSelected((ids) => ids.filter((x) => x !== id))
                    }
                    onOpen={(v) => open(v)}
                    onBrowse={() => setTab("explore")}
                  />
                  {button(
                    "Lưu quyết định so sánh",
                    () =>
                      void save(
                        state.catalog.listings.filter((v) =>
                          selected.includes(v.id),
                        ),
                      ),
                    false,
                    selected.length === 0 || boot !== "ready",
                    undefined,
                    pending,
                  )}
                </>
              )}
              {tab === "saved" && (
                <>
                  {txt("Quyết định đã lưu · giá và cấu hình tại thời điểm lưu")}
                  {state.saved.length > 0 &&
                    input(
                      savedQuery,
                      setSavedQuery,
                      "Tìm quyết định đã lưu theo tên máy hoặc ngày",
                    )}
                  {state.saved.length === 0 && txt("Chưa lưu quyết định nào.")}
                  {state.saved.length > 0 &&
                    filteredSaved.length === 0 &&
                    txt("Không có bản lưu khớp từ khóa tìm kiếm.")}
                </>
              )}
              {tab === "settings" && (
                <>
                  {card(
                    <>
                      {txt("Kết nối cập nhật dữ liệu")}
                      {txt(
                        "Máy chủ đọc lại tệp nguồn mỗi lần ứng dụng kiểm tra. Kho dữ liệu hiện có không phải nguồn giá thời gian thực.",
                        true,
                      )}
                      {input(
                        endpoint,
                        setEndpoint,
                        "Địa chỉ dịch vụ HTTPS (hoặc http://127.0.0.1:8788 qua ADB)",
                      )}
                      {input(
                        token,
                        setToken,
                        "Mã truy cập dịch vụ (không phải khóa nhà cung cấp AI)",
                        false,
                        true,
                      )}
                      {button("Lưu kết nối", () => {
                        refreshAbort.current?.abort();
                        cancel();
                        void persist((s) => ({
                          ...s,
                          endpoint: endpoint.trim(),
                          token,
                        }));
                      })}
                      {button(
                        "Ngắt kết nối",
                        () => {
                          cancel();
                          refreshAbort.current?.abort();
                          setEndpoint("");
                          setToken("");
                          setConnection("Dữ liệu đã lưu · chưa kết nối");
                          void persist((s) => ({
                            ...s,
                            endpoint: "",
                            token: "",
                          }));
                        },
                        true,
                      )}
                    </>,
                  )}
                  {card(
                    <>
                      {txt("Dữ liệu & quyền riêng tư")}
                      {txt(
                        "Gemini Nano chạy qua Android AICore trên thiết bị tương thích. Không dùng khóa OpenAI hoặc gửi câu hỏi lên máy chủ. Tải mô hình cần mạng và dung lượng trống. Lịch sử lưu trên máy. Mã truy cập nguồn dữ liệu lưu trong bộ nhớ riêng ứng dụng.",
                        true,
                      )}
                      {txt(
                        "Nguồn phiên bản: " +
                          state.catalog.revision.slice(0, 16),
                        true,
                      )}
                      {button(
                        "Xóa toàn bộ lịch sử",
                        () =>
                          setDeletion({
                            label: `Xóa toàn bộ ${state.saved.length} quyết định đã lưu?`,
                            run: () => persist((s) => ({ ...s, saved: [] })),
                          }),
                        true,
                      )}
                      {button(
                        "Xuất quyết định đã lưu",
                        () =>
                          void Share.share({
                            message: JSON.stringify(state.saved, null, 2),
                          }),
                        true,
                      )}
                    </>,
                  )}
                </>
              )}
            </ExpressiveSurface>
          }
        />
      )}
      {!deviceAdvisorOpen && selected.length > 0 && tab !== "compare" && (
        <View style={{ padding: 12, backgroundColor: c.container }}>
          <ExpressiveSurface
            key={selected.join(":")}
            reduceMotion={reduceMotion}
          >
            {button(`So sánh ${selected.length} cấu hình đã chọn`, () =>
              setTab("compare"),
            )}
          </ExpressiveSurface>
        </View>
      )}
      <View
        accessibilityRole="tablist"
        style={{
          flexDirection: "row",
          padding: EXPRESSIVE_SPACE.sm,
          gap: EXPRESSIVE_SPACE.xs,
          borderTopWidth: 1,
          borderColor: c.line,
        }}
      >
        {[
          ["advisor", "Tư vấn"],
          ["explore", "Khám phá"],
          ["compare", `So sánh ${selected.length}`],
          ["saved", "Đã lưu"],
          ["settings", "Cài đặt"],
        ].map(([id, label]) => (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: tab === id }}
            aria-selected={tab === id}
            onPress={() => {
              cancel();
              setDeviceAdvisorOpen(false);
              setTab(id);
            }}
            style={{
              flex: 1,
              minHeight: 56,
              justifyContent: "center",
              borderRadius: EXPRESSIVE_SHAPE.selected,
              backgroundColor: tab === id ? c.accent : c.bg,
              paddingVertical: 6,
              paddingHorizontal: 4,
            }}
          >
            <View style={{ alignItems: "center", gap: 4 }}>
              <NavigationIcon
                name={id}
                color={tab === id ? c.onAccent : c.text}
              />
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  lineHeight: 18,
                  fontWeight: "700",
                  color: tab === id ? c.onAccent : c.text,
                }}
              >
                {label}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
      {modal(
        !!deletion,
        "Xác nhận xóa",
        () => {
          if (!pending) setDeletion(null);
        },
        <>
          {txt(deletion?.label ?? "")}
          {button("Hủy", () => setDeletion(null), true, pending)}
          {button(
            pending ? "Đang xóa…" : "Xác nhận xóa",
            () => {
              if (!deletion || pendingRef.current) return;
              pendingRef.current = true;
              setPending(true);
              void deletion
                .run()
                .then((ok) => {
                  if (ok) {
                    setDeletion(null);
                    setNotice("Đã xóa lịch sử đã chọn.");
                  }
                })
                .finally(() => {
                  pendingRef.current = false;
                  setPending(false);
                });
            },
            false,
            pending,
          )}
        </>,
      )}
      {modal(
        form,
        "Nhu cầu của bạn",
        () => setForm(false),
        <>
          {input(budget, setBudget, "Ngân sách tối đa (VND)", true)}
          {txt("Yêu cầu bắt buộc về RAM")}
          <View style={styles.row}>
            {[0, 8, 16, 32, 64].map((n) => (
              <View key={n}>
                {button(
                  n === 0 ? "Chưa rõ" : `${n} GB`,
                  () => setDraft({ ...draft, minRam: n }),
                  draft.minRam !== n,
                  false,
                  { selected: draft.minRam === n, role: "radio" },
                )}
              </View>
            ))}
          </View>
          {txt("Ổ lưu trữ tối thiểu")}
          <View style={styles.row}>
            {[0, 256, 512, 1024].map((n) => (
              <View key={n}>
                {button(
                  n === 0 ? "Chưa rõ" : `${n} GB`,
                  () => setDraft({ ...draft, minStorage: n }),
                  draft.minStorage !== n,
                  false,
                  { selected: draft.minStorage === n, role: "radio" },
                )}
              </View>
            ))}
          </View>
          {input(
            draft.os,
            (os) => setDraft({ ...draft, os }),
            "Hệ điều hành bắt buộc (để trống nếu không yêu cầu)",
          )}
          {txt("Tác vụ cần làm · cần bằng chứng riêng để kết luận năng lực")}
          {TASKS.map((t) => (
            <View key={t}>
              {button(
                t,
                () =>
                  setDraft({
                    ...draft,
                    tasks: draft.tasks.includes(t)
                      ? draft.tasks.filter((x) => x !== t)
                      : [...draft.tasks, t],
                  }),
                !draft.tasks.includes(t),
                false,
                { selected: draft.tasks.includes(t), role: "checkbox" },
              )}
            </View>
          ))}
          {txt(
            "Bạn xác nhận các yêu cầu này trước khi danh sách được tính lại.",
            true,
          )}
          {button(
            "Xác nhận & đánh giá lại",
            () => void confirm(),
            false,
            boot !== "ready" || pending,
          )}
        </>,
      )}
      {modal(
        quoteModal,
        "Kiểm tra báo giá ngoài",
        () => setQuoteModal(false),
        <>
          {txt(
            "Nhập thông tin báo giá hoặc liên kết HTTPS từ nhà bán được hỗ trợ (FPT Shop, Thế Giới Di Động, Điện Máy Xanh, CellphoneS, GearVN, Phong Vũ, HACOM, LaptopAZ) để tính tổng chi phí và đối chiếu với nhu cầu hiện tại.",
            true,
          )}
          {input(quoteName, setQuoteName, "Tên máy / cấu hình trong báo giá")}
          {input(
            quoteUrl,
            setQuoteUrl,
            "Liên kết HTTPS (để trống nếu là báo giá tại cửa hàng)",
          )}
          {input(quotePrice, setQuotePrice, "Giá niêm yết (VND)", true)}
          {input(
            quoteShipping,
            setQuoteShipping,
            "Phí giao hàng bắt buộc (VND, để trống nếu chưa rõ)",
            true,
          )}
          {input(
            quoteFees,
            setQuoteFees,
            "Phí bắt buộc khác (VND, để trống nếu chưa rõ)",
            true,
          )}
          {input(quoteRam, setQuoteRam, "RAM (GB, để trống nếu chưa rõ)", true)}
          {input(
            quoteStorage,
            setQuoteStorage,
            "Ổ lưu trữ (GB, để trống nếu chưa rõ)",
            true,
          )}
          {quoteError ? (
            <Text
              accessibilityRole="alert"
              style={{ ...EXPRESSIVE_TYPE.label, color: c.error }}
            >
              {quoteError}
            </Text>
          ) : null}
          {button("Đánh giá báo giá này", () => {
            const parsed = parseQuotationDraft({
              name: quoteName,
              url: quoteUrl,
              advertisedPrice: quotePrice,
              shipping: quoteShipping,
              fees: quoteFees,
              ram: quoteRam,
              storage: quoteStorage,
            });
            if (!parsed) {
              setQuoteError(
                "Vui lòng nhập tên máy, giá nguyên dương hợp lệ (≤ 1.000.000.000 ₫) và liên kết HTTPS (nếu có).",
              );
              return;
            }
            setQuoteError("");
            setQuoteModal(false);
            open(parsed.listing);
            setNotice(
              parsed.recognizedRetailer
                ? `Đã nhận diện nhà bán ${parsed.listing.source.toUpperCase()} và đối chiếu với nhu cầu.`
                : "Đã nạp báo giá thủ công để đối chiếu với nhu cầu.",
            );
          })}
        </>,
      )}
      {modal(
        !!detail,
        detail?.name ?? "",
        () => {
          cancel();
          setDetail(null);
        },
        detail && (
          <>
            {historical && txt("BẢN LỊCH SỬ · không dùng làm giá hiện tại")}
            {card(
              <>
                {Object.values(
                  facts(
                    detail,
                    historical && history
                      ? history.requirements
                      : state.requirements,
                  ),
                ).map((f, i) => (
                  <View key={i}>{txt(f)}</View>
                ))}
                {txt(
                  `Hệ điều hành: ${detail.os ?? "chưa rõ"}\nMàn hình: ${detail.screen ?? "chưa rõ"}\nKhối lượng: ${detail.weight ?? "chưa rõ"}` +
                    (detail.gpu ? `\nCard đồ họa: ${detail.gpu}` : "") +
                    (detail.battery ? `\nPin: ${detail.battery}` : "") +
                    (detail.brand ? `\nThương hiệu: ${detail.brand}` : "") +
                    (detail.priceOriginal
                      ? `\nGiá niêm yết: ${money(detail.priceOriginal)}${detail.discountPercent ? ` (-${detail.discountPercent}%)` : ""}`
                      : "") +
                    (detail.installment
                      ? `\nƯu đãi: ${detail.installment}`
                      : ""),
                  true,
                )}
              </>,
            )}
            {button(
              "Mở tin gốc tại nhà bán",
              () => {
                if (safeLink(detail.url))
                  void Linking.openURL(detail.url).catch(() =>
                    setNotice("Không mở được liên kết."),
                  );
              },
              true,
            )}
            {txt(
              "Rời ứng dụng để tự xác minh cấu hình, tồn kho, điều kiện và tổng tiền. Giá trong ứng dụng không bảo đảm còn hiệu lực.",
              true,
            )}
            {button(
              "Chia sẻ kèm nguồn & ngày",
              () => void Share.share({ message: summary(detail) }),
              true,
            )}
            {!historical &&
              button(
                VI.reportDataDiscrepancy,
                () => {
                  const current = getStore().current();
                  if (!current.endpoint) {
                    setNotice(
                      "Đã ghi nhận phản hồi sai lệch trên thiết bị. Kết nối dịch vụ trong Cài đặt để gửi tới hàng đợi kiểm duyệt.",
                    );
                    return;
                  }
                  const ctrl = new AbortController();
                  void submitListingReport(
                    current.endpoint,
                    current.token,
                    {
                      listingId: detail.id,
                      category: listingEvidence(detail).conflicts.length
                        ? "spec"
                        : "price",
                      note: `Báo kiểm tra tin đăng ${detail.name}`,
                    },
                    ctrl.signal,
                  )
                    .then((rep) =>
                      setNotice(
                        `Đã gửi báo cáo kiểm duyệt (${rep.id}). Bộ phận dữ liệu sẽ đối chiếu nguồn gốc.`,
                      ),
                    )
                    .catch(() =>
                      setNotice(
                        "Không gửi được báo cáo tới máy chủ. Đã giữ nguyên cảnh báo trên máy.",
                      ),
                    );
                },
                true,
              )}
            {!historical &&
              button(
                "Lưu quyết định này",
                () => void save([detail]),
                false,
                boot !== "ready",
                undefined,
                pending,
              )}
            {!historical &&
              siblings.length > 0 &&
              card(
                <>
                  {txt("Các phiên bản / nơi bán cùng dòng máy")}
                  {txt(
                    "Chuyển nhanh cấu hình hoặc nhà bán khác để cập nhật toàn bộ thông số, giá lịch sử và đánh giá.",
                    true,
                  )}
                  {siblings.map((rel) => (
                    <View key={rel.id}>
                      {button(
                        `${rel.source.toUpperCase()} · ${specification(rel)} · ${money(rel.advertisedPrice)}`,
                        () => open(rel),
                        true,
                      )}
                    </View>
                  ))}
                </>,
              )}
            {!historical &&
              card(
                <>
                  {txt(
                    localBridge
                      ? "Gemini Nano · AI trên thiết bị"
                      : "Trợ lý AI · FastAPI Backend",
                  )}
                  {txt(
                    "Trạng thái: " +
                      (localBridge
                        ? {
                            available: "Sẵn sàng",
                            downloadable: "Có thể tải mô hình",
                            downloading: "Đang tải mô hình",
                            unavailable:
                              "Thiết bị chưa hỗ trợ hoặc AICore chưa sẵn sàng",
                          }[aiStatus]
                        : state.endpoint
                          ? `Đã kết nối máy chủ (${state.endpoint})`
                          : "Chưa kết nối máy chủ tư vấn"),
                    true,
                  )}
                  {localBridge &&
                    button(
                      "Kiểm tra AI trên máy",
                      () => {
                        void localStatus(localBridge).then(setAiStatus);
                      },
                      true,
                    )}
                  {localBridge &&
                    aiStatus === "downloadable" &&
                    button(
                      "Tải mô hình Gemini Nano",
                      () => {
                        if (localBridge) {
                          setAiStatus("downloading");
                          void localBridge
                            .download()
                            .then(() => localStatus(localBridge))
                            .then(setAiStatus)
                            .catch(() => setAiStatus("unavailable"));
                        }
                      },
                      true,
                    )}
                  {localBridge &&
                    aiStatus === "downloading" &&
                    button(
                      "Hủy tải mô hình",
                      () => {
                        localBridge?.cancel("download");
                        void localStatus(localBridge).then(setAiStatus);
                      },
                      true,
                    )}
                  {localBridge && aiStatus === "downloading" && (
                    <ExpressiveLoading
                      label="Đang tải mô hình…"
                      color={c.text}
                      reduceMotion={reduceMotion}
                    />
                  )}
                  {input(question, setQuestion, "Câu hỏi cho AI")}
                  {txt(
                    localBridge
                      ? "Câu hỏi và dữ kiện được xử lý bằng Gemini Nano trên thiết bị. Không gửi tới dịch vụ AI đám mây."
                      : "Câu hỏi và dữ kiện được kiểm chứng qua dịch vụ tư vấn FastAPI kết nối PostgreSQL.",
                    true,
                  )}
                  {button(
                    busy ? "Đang hỏi AI…" : "Hỏi AI",
                    () => void ask(),
                    false,
                    busy ||
                      boot !== "ready" ||
                      (!localBridge && !state.endpoint) ||
                      (!!localBridge && aiStatus !== "available") ||
                      !question.trim(),
                  )}
                  {busy && (
                    <ExpressiveLoading
                      label="Đang xử lý trên thiết bị…"
                      color={c.text}
                      reduceMotion={reduceMotion}
                    />
                  )}
                  {busy && button("Hủy yêu cầu", cancel, true)}
                  {answer && txt(answer)}
                  {proposal && (
                    <>
                      {txt(
                        `Đề xuất: ${money(proposal.budget)} · RAM ${proposal.minRam} GB · ổ ${proposal.minStorage} GB · ${proposal.tasks.join(", ")}`,
                      )}
                      {button(
                        "Đưa vào bản nháp để xem lại",
                        () => {
                          edit(proposal);
                          setProposal(null);
                          cancel();
                          setDetail(null);
                        },
                        true,
                      )}
                    </>
                  )}
                </>,
              )}
          </>
        ),
      )}
      {modal(
        !!history && !detail,
        "Quyết định lịch sử",
        () => setHistory(null),
        history && (
          <>
            {txt(new Date(history.savedAt).toLocaleString("vi-VN"))}
            {txt(
              "Giá quan sát được giữ nguyên. Mở kết quả hiện tại sẽ tạo lần đánh giá mới.",
            )}
            {history.listings.map((v) =>
              card(
                <>
                  <Text
                    accessibilityRole="header"
                    style={{
                      ...EXPRESSIVE_TYPE.section,
                      color: c.text,
                    }}
                  >
                    {v.name}
                  </Text>
                  {txt(summary(v))}
                  {button("Xem cấu hình lịch sử", () => open(v, true), true)}
                </>,
                v.id,
              ),
            )}
            {button(
              "Dùng nhu cầu cũ để đánh giá hiện tại",
              () => {
                edit(history.requirements);
                setHistory(null);
              },
              true,
            )}
          </>
        ),
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
});
