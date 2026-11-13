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
  facts,
  safeLink,
  searchCatalog,
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
import { fetchCatalog, fetchAdvice } from "./adviser-client";
import { DEFAULT_API_ENDPOINT } from "./api/config";
import { localAdvice, localStatus } from "./local-ai";
import type { LocalAiBridge, LocalAiStatus } from "./local-ai";
import { EXPRESSIVE_LIGHT, EXPRESSIVE_DARK } from "./expressive-theme";
import { ExpressiveSurface } from "./ExpressiveSurface";
import { ExpressiveButton } from "./ExpressiveButton";
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
const money = (n: number | null) =>
  n === null ? "Chưa rõ" : n.toLocaleString("vi-VN") + " ₫";
const TASKS = [
  "Văn phòng & học tập",
  "Lập trình",
  "Thiết kế",
  "Máy ảo",
  "Chơi game",
];
export default function AdviserApp() {
  return (
    <SafeAreaProvider>
      <Adviser />
    </SafeAreaProvider>
  );
}
function Adviser() {
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
  const store = useRef<ReturnType<typeof createAdviserStore> | null>(null);
  if (!store.current)
    store.current = createAdviserStore(
      INITIAL,
      () => AsyncStorage.getItem(KEY),
      (raw) => AsyncStorage.setItem(KEY, raw),
      setState,
    );
  const [tab, setTab] = useState("advisor"),
    [query, setQuery] = useState(""),
    [source, setSource] = useState(""),
    [sort, setSort] = useState("price"),
    [showExcluded, setShowExcluded] = useState(false);
  const [form, setForm] = useState(false),
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
    const ok = await store.current!.update(reduce);
    if (!ok)
      setNotice("Không lưu được thay đổi. Dữ liệu đã lưu trước đó được giữ.");
    return ok;
  }
  useEffect(() => {
    let mounted = true;
    void store.current!.load().then((ok) => {
      if (mounted) {
        setBoot(ok ? "ready" : "failed");
        const currentEndpoint = store.current!.current().endpoint;
        if (!currentEndpoint && DEFAULT_API_ENDPOINT) {
          void persist((s) => ({ ...s, endpoint: DEFAULT_API_ENDPOINT }));
          setEndpoint(DEFAULT_API_ENDPOINT);
        } else {
          setEndpoint(currentEndpoint);
        }
        setToken(store.current!.current().token);
      }
    });
    return () => {
      mounted = false;
      abort.current?.abort();
      refreshAbort.current?.abort();
    };
  }, []);
  async function refresh() {
    const current = store.current!.current();
    if (!current.endpoint || !store.current!.ready() || refreshBusy.current)
      return;
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
        current.endpoint !== store.current!.current().endpoint ||
        current.token !== store.current!.current().token
      )
        return;
      if (
        value.catalog.revision !== store.current!.current().catalog.revision
      ) {
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
      if (!controller.signal.aborted || store.current!.ready())
        setConnection(
          "Nguồn không truy cập được · giữ bản đã lưu; giá hiện tại chưa xác minh",
        );
    } finally {
      clearTimeout(timer);
      refreshBusy.current = false;
      setRefreshing(false);
    }
  }
  useEffect(() => {
    if (boot !== "ready" || !state.endpoint) return;
    void refresh();
    const timer = setInterval(() => void refresh(), 30000);
    return () => {
      clearInterval(timer);
      refreshAbort.current?.abort();
    };
  }, [boot, state.endpoint, state.token]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") {
        cancel();
        refreshAbort.current?.abort();
      } else void refresh();
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
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
  }, [form, detail, history, tab, deletion, pending]);
  const rows = useMemo(
    () => searchCatalog(state.catalog, state.requirements, query, source, sort),
    [state.catalog, state.requirements, query, source, sort],
  );
  const visible = rows.filter(
    (x) => showExcluded || x.assessment.state !== "excluded",
  );
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
    const r = { ...draft, budget: Number(budget) };
    if (!validRequirements(r)) {
      setFieldError("Nhập ngân sách nguyên dương, tối đa 1.000.000.000 ₫.");
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
    const current = store.current!.current();
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
    const current = store.current!.current();
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
      const latest = store.current!.current();
      if (
        controller.signal.aborted ||
        request.current !== Number(context.requestId) ||
        latest.catalog.revision !== context.catalogRevision ||
        latest.revision !== context.decisionRevision
      )
        return;
      const allowed = Object.values(facts(detail, current.requirements));
      if (
        value.text
          .split("\n\n")
          .some((text: string) => text && !allowed.includes(text))
      )
        throw Error("UNSUPPORTED_AI_FACT");
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
        color: small ? c.muted : c.text,
        fontSize: small ? 13 : 16,
        lineHeight: small ? 20 : 25,
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
  ) => (
    <ExpressiveButton
      label={label}
      onPress={onPress}
      secondary={secondary}
      disabled={disabled}
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
  ) => (
    <View style={{ gap: 5 }}>
      {txt(label, true)}
      <TextInput
        ref={numeric ? budgetInput : undefined}
        accessibilityLabel={label}
        accessibilityHint={numeric && fieldError ? fieldError : undefined}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        keyboardType={numeric ? "numeric" : "default"}
        autoCapitalize="none"
        style={{
          minHeight: 48,
          borderWidth: 1,
          borderColor: c.line,
          borderRadius: 14,
          padding: 12,
          color: c.text,
          backgroundColor: c.card,
        }}
      />
      {numeric && fieldError ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          style={{ color: c.error, fontSize: 14, lineHeight: 22 }}
        >
          {fieldError}
        </Text>
      ) : null}
    </View>
  );
  const card = (children: React.ReactNode, key?: string) => (
    <View
      key={key}
      style={{
        backgroundColor: c.card,
        borderRadius: 24,
        padding: 20,
        gap: 12,
        borderWidth: 1,
        borderColor: c.line,
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
    return card(
      <>
        {txt(
          v.source.toUpperCase() +
            (v.brand ? ` · ${v.brand}` : "") +
            " · " +
            (v.condition === "used" ? "Máy cũ" : "Tin đăng"),
          true,
        )}
        <Text style={{ fontSize: 20, fontWeight: "800", color: c.text }}>
          {v.name}
        </Text>
        {txt(
          `${specification(v)} · ${v.cpu ?? "CPU chưa rõ"}` +
            (v.gpu ? ` · ${v.gpu}` : ""),
        )}
        {listingEvidence(v).conflicts.map((issue) => (
          <Text key={issue} style={{ color: c.error, lineHeight: 22 }}>
            {issue} · cần kiểm tra nguồn
          </Text>
        ))}
        {txt(
          money(v.advertisedPrice) +
            (v.priceOriginal && v.priceOriginal > (v.advertisedPrice ?? 0)
              ? ` (Niêm yết: ${money(v.priceOriginal)}${v.discountPercent ? ` -${v.discountPercent}%` : ""})`
              : "") +
            (v.installment ? ` · ${v.installment}` : ""),
        )}
        {txt(
          `Giá ghi nhận ${new Date(v.observedAt).toLocaleString("vi-VN")}. Tổng thanh toán chưa rõ.`,
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
            () =>
              setSelected((ids) =>
                ids.includes(v.id)
                  ? ids.filter((x) => x !== v.id)
                  : ids.length < 2
                    ? [...ids, v.id]
                    : (setNotice("Chỉ so sánh tối đa 2 cấu hình."), ids),
              ),
            true,
          )}
        </View>
      </>,
      v.id,
    );
  }
  function modal(
    visible: boolean,
    title: string,
    close: () => void,
    children: React.ReactNode,
  ) {
    return (
      <Modal
        visible={visible}
        onRequestClose={close}
        animationType={reduceMotion ? "none" : "fade"}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
          <View style={{ padding: 18, gap: 10 }}>
            <Text
              accessibilityRole="header"
              numberOfLines={2}
              accessibilityLabel={title}
              style={{ fontSize: 23, fontWeight: "800", color: c.text }}
            >
              {title}
            </Text>
            {button("Đóng", close, true)}
          </View>
          {notice ? (
            <View
              accessibilityLiveRegion="polite"
              style={{
                padding: 16,
                borderRadius: 16,
                backgroundColor: c.container,
                gap: 8,
              }}
            >
              {txt(notice)}
              {button("Đã hiểu", () => setNotice(""), true)}
            </View>
          ) : null}
          <ScrollView
            ref={title === "Nhu cầu của bạn" ? needsScroll : undefined}
            contentContainerStyle={{
              padding: 18,
              gap: 16,
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
          label="Đang khôi phục quyết định…"
          color={c.text}
          reduceMotion={reduceMotion}
        />
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <FlatList
        data={tab === "advisor" || tab === "explore" ? visible : []}
        keyExtractor={(item) => item.listing.id}
        renderItem={({ item }) => listingCard(item.listing)}
        initialNumToRender={5}
        windowSize={7}
        key={tab}
        style={{ flex: 1, minHeight: 0 }}
        contentContainerStyle={{
          padding: 20,
          gap: 18,
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
                  style={{ color: c.text, fontSize: 32, fontWeight: "900" }}
                >
                  lựa.
                </Text>
                {txt("Thiết bị thật. Quyết định có căn cứ.", true)}
              </View>
              {button(
                refreshing ? "Đang kiểm tra…" : "Cập nhật",
                () => void refresh(),
                true,
                refreshing || !state.endpoint,
              )}
            </View>
            {boot === "failed" &&
              card(
                <>
                  {txt(
                    "Không đọc được dữ liệu đã lưu. Tạm khóa ghi để bảo vệ dữ liệu.",
                  )}
                  {button(
                    "Xuất dữ liệu gốc",
                    () => {
                      void AsyncStorage.getItem(KEY)
                        .then((raw) =>
                          Share.share({
                            message: raw ?? "Không đọc được dữ liệu",
                          }),
                        )
                        .catch(() => setNotice("Không đọc được dữ liệu gốc."));
                    },
                    true,
                  )}
                  {button(
                    "Khôi phục bằng dữ liệu ban đầu",
                    () => {
                      void store
                        .current!.update(() => INITIAL, true)
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
                  {button("Đã hiểu", () => setNotice(""), true)}
                </>,
              )}
            {txt(connection, true)}
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
                    <ExpressiveSurface key={state.revision} reduceMotion={reduceMotion}>
                      <Text
                        style={{
                          fontSize: 28,
                          fontWeight: "800",
                          color: c.text,
                        }}
                      >
                        Máy nào hợp việc của bạn?
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
                      {button("Điều chỉnh nhu cầu", () => edit())}
                    </ExpressiveSurface>,
                  )}
                {input(query, setQuery, "Tìm tên máy, CPU, RAM hoặc nhà bán")}
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
                    sort === "price" ? "Sắp xếp: giá lịch sử" : "Sắp xếp: tên",
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
                            : "Không có tin đáp ứng các tiêu chí đã biết. Giữ nguyên ngân sách và yêu cầu.",
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
                )}
              </>
            )}
            {tab === "saved" && (
              <>
                {txt("Quyết định đã lưu · giá và cấu hình tại thời điểm lưu")}
                {state.saved.length === 0 && txt("Chưa lưu quyết định nào.")}
                {state.saved.map((s) =>
                  card(
                    <>
                      {txt(new Date(s.savedAt).toLocaleString("vi-VN"), true)}
                      {txt(s.listings.map((v) => v.name).join("\n"))}
                      {txt(
                        "Ngân sách khi lưu: " + money(s.requirements.budget),
                        true,
                      )}
                      {button("Mở bản lịch sử", () => setHistory(s))}
                      {button(
                        "Xóa bản lưu",
                        () =>
                          setDeletion({
                            label: `Xóa bản lưu: ${s.listings.map((v) => v.name).join(", ")}?`,
                            run: () =>
                              persist((latest) => ({
                                ...latest,
                                saved: latest.saved.filter(
                                  (x) => x.id !== s.id,
                                ),
                              })),
                          }),
                        true,
                      )}
                    </>,
                    s.id,
                  ),
                )}
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
                      "Nguồn phiên bản: " + state.catalog.revision.slice(0, 16),
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
      {selected.length > 0 && tab !== "compare" && (
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
        style={{
          flexDirection: "row",
          padding: 8,
          gap: 4,
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
            accessibilityState={{ selected: tab === id }}
            aria-selected={tab === id}
            onPress={() => {
              cancel();
              setTab(id);
            }}
            style={{
              flex: 1,
              minHeight: 56,
              justifyContent: "center",
              borderRadius: 16,
              backgroundColor: tab === id ? c.accent : c.bg,
              padding: 3,
            }}
          >
            <View style={{ alignItems: "center", gap: 4 }}>
              <NavigationIcon
                name={id}
                color={tab === id ? c.onAccent : c.text}
              />
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 12,
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
                    (detail.priceOriginal ? `\nGiá niêm yết: ${money(detail.priceOriginal)}${detail.discountPercent ? ` (-${detail.discountPercent}%)` : ""}` : "") +
                    (detail.installment ? `\nƯu đãi: ${detail.installment}` : ""),
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
                "Lưu quyết định này",
                () => void save([detail]),
                false,
                boot !== "ready",
              )}
            {!historical &&
              card(
                <>
                  {txt(localBridge ? "Gemini Nano · AI trên thiết bị" : "Trợ lý AI · FastAPI Backend")}
                  {txt(
                    "Trạng thái: " +
                      (localBridge
                        ? {
                            available: "Sẵn sàng",
                            downloadable: "Có thể tải mô hình",
                            downloading: "Đang tải mô hình",
                            unavailable: "Thiết bị chưa hỗ trợ hoặc AICore chưa sẵn sàng",
                          }[aiStatus]
                        : state.endpoint
                          ? `Đã kết nối máy chủ (${state.endpoint})`
                          : "Chưa kết nối máy chủ tư vấn"),
                    true,
                  )}
                  {localBridge && (
                    button(
                      "Kiểm tra AI trên máy",
                      () => {
                        void localStatus(localBridge).then(setAiStatus);
                      },
                      true,
                    )
                  )}
                  {localBridge && aiStatus === "downloadable" &&
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
                  {localBridge && aiStatus === "downloading" &&
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
            )}{" "}
            {history.listings.map((v) =>
              card(
                <>
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
