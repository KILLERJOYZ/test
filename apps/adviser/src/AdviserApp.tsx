import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as RN from "react-native";
import {
  AccessibilityInfo,
  AppState,
  BackHandler,
  FlatList,
  Linking,
  Modal,
  NativeModules,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  fetchAdvice,
  fetchCatalog,
  fetchListingReview,
  submitListingReport,
  type SynthesizedReview,
} from "./adviser-client";
import { createAdviserStore, type AdviserState } from "./adviser-store";
import { AdvisorTheme } from "./AdvisorTheme";
import { DEFAULT_API_ENDPOINT } from "./api/config";
import {
  assess,
  budgetUpgradeCandidates,
  facts,
  formatSavedShareBrief,
  INITIAL_REQUIREMENTS,
  MAX_COMPARE_ITEMS,
  observationAgeLabel,
  parseQuotationDraft,
  relatedListings,
  safeLink,
  savedDecisionDiffs,
  searchCatalog,
  taskGuidance,
  validRequirements,
  variantHardwareDiff,
  type AdviceContext,
  type Catalog,
  type CatalogExtraFilters,
  type Listing,
  type Requirements,
  type SavedDecision,
} from "./catalog";
import { ComparisonView } from "./ComparisonView";
import { CopilotSheet } from "./CopilotSheet";
import {
  createUniqueDecisionId,
  swapComparisonColumn,
} from "./decision-state";
import DeviceAdvisorApp from "./DeviceAdvisorApp";
import { ExpressiveButton } from "./ExpressiveButton";
import { ExpressiveLoading } from "./ExpressiveLoading";
import { ExpressiveSurface } from "./ExpressiveSurface";
import {
  EXPRESSIVE_ELEVATION,
  EXPRESSIVE_SHAPE,
  EXPRESSIVE_SPACE,
  EXPRESSIVE_TYPE,
  type ExpressiveColors,
} from "./expressive-theme";
import { formatVnd, formatVndDigits, parseVndDigits, VI } from "./i18n";
import { Icon } from "./icons";
import {
  listingEvidence,
  specChips,
  specification,
} from "./listing-evidence";
import {
  localAdvice,
  localStatus,
  type LocalAiBridge,
  type LocalAiStatus,
} from "./local-ai";
import { NavigationIcon } from "./NavigationIcon";
import { ProactiveCopilotBar } from "./ProactiveCopilotBar";
import imported from "./real-catalog.json";
import { RetailerBadge, retailerDisplayName } from "./RetailerBadge";
import {
  loadSharedSettings,
  saveSharedSettings,
  subscribeSharedSettings,
} from "./shared-settings";
import { useExpressiveTheme } from "./useExpressiveTheme";

const SafeImage = (RN as Record<string, any>).Image as
  | React.ComponentType<any>
  | undefined;

const localBridge = NativeModules.AdviserLocalAi as LocalAiBridge | undefined;

const KEY = "lua-connected-adviser-v1";
const UI_SESSION_KEY = "lua-adviser-ui-session-v1";
const PAGE_SIZE = 12;

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

function buildOfflineReviewFallback(v: Listing): SynthesizedReview {
  const chips = specChips(v);
  return {
    listingId: v.id,
    performance:
      v.cpu || v.gpu
        ? `Cấu hình ghi nhận ${chips.cpu}${v.gpu ? ` đi kèm ${chips.gpu}` : ""}, RAM ${chips.ram} và ổ ${chips.ssd}. Chưa có dữ liệu đo kiểm độc lập.`
        : "Chưa có dữ liệu đo kiểm độc lập.",
    thermals_noise: "Chưa có dữ liệu đo kiểm độc lập về nhiệt độ vỏ và độ ồn quạt.",
    battery_real: v.battery
      ? `Thông số pin công bố: ${v.battery}. Chưa có dữ liệu đo kiểm độc lập về thời lượng thực tế.`
      : "Chưa có dữ liệu đo kiểm độc lập về thời lượng pin thực tế.",
    quirks_cons:
      listingEvidence(v).conflicts.join("; ") ||
      "Cần kiểm tra trực tiếp cổng kết nối, khả năng nâng cấp RAM/SSD và chính sách đổi trả tại nơi bán.",
    sourceName: `Thông số niêm yết (${retailerDisplayName(v.source)})`,
    sourceUrl: v.url,
    checkedAt: v.observedAt,
    status: "offline_spec_baseline",
  };
}

interface ListingCardProps {
  listing: Listing;
  requirements: Requirements;
  rankBadge?: number | null;
  inCompare: boolean;
  compareCount: number;
  colors: ExpressiveColors;
  reduceMotion: boolean;
  onOpen: (v: Listing) => void;
  onToggleCompare: (id: string) => void;
}

const ListingCard = React.memo(function ListingCard({
  listing: v,
  requirements,
  rankBadge,
  inCompare,
  compareCount,
  colors: c,
  reduceMotion,
  onOpen,
  onToggleCompare,
}: ListingCardProps) {
  const a = assess(v, requirements);
  const g = taskGuidance(v, requirements);
  const chips = specChips(v);
  const conflicts = listingEvidence(v).conflicts;
  const hasDiscount =
    v.priceOriginal != null &&
    v.advertisedPrice != null &&
    v.priceOriginal > v.advertisedPrice;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${v.name}. Giá ${money(v.advertisedPrice)}. Nhấn để xem chi tiết cấu hình và nơi bán.`}
      onPress={() => onOpen(v)}
      style={({ pressed }) => [
        {
          flex: 1,
          backgroundColor: c.card,
          borderRadius: EXPRESSIVE_SHAPE.card,
          padding: EXPRESSIVE_SPACE.xl,
          gap: EXPRESSIVE_SPACE.md,
          borderWidth: 2,
          borderColor: inCompare ? c.accent : c.line,
          opacity: pressed ? 0.94 : 1,
          ...EXPRESSIVE_ELEVATION.card,
        },
      ]}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.badgeWrap}>
          {rankBadge != null && rankBadge >= 1 && rankBadge <= 3 && (
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: c.accent,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  lineHeight: 16,
                  fontWeight: "800",
                  color: c.onAccent,
                }}
              >
                Đề xuất #{rankBadge}
              </Text>
            </View>
          )}
          <RetailerBadge source={v.source} colors={c} compact />
          {v.condition === "used" && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: c.container,
              }}
            >
              <Text style={{ fontSize: 12, color: c.onContainer, fontWeight: "700" }}>
                Máy cũ
              </Text>
            </View>
          )}
        </View>
        <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.muted }}>
          {observationAgeLabel(v.observedAt)}
        </Text>
      </View>

      <View style={styles.titleMediaRow}>
        {SafeImage && v.thumbnail && safeLink(v.thumbnail) ? (
          <SafeImage
            source={{ uri: v.thumbnail }}
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            style={styles.cardThumb}
          />
        ) : null}
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            accessibilityRole="header"
            style={{ ...EXPRESSIVE_TYPE.section, color: c.text }}
          >
            {v.name}
          </Text>
          <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.muted }}>
            {`Hãng: ${v.brand ?? "Chưa rõ"} · Kiểu máy: ${v.model ?? (v.name.split(/[(/-]/)[0]?.trim() || "Chưa rõ")}`}
          </Text>
        </View>
      </View>

      <View style={styles.priceFocalBlock}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            fontSize: 28,
            lineHeight: 36,
            fontWeight: "800",
            color: c.accent,
            fontVariant: ["tabular-nums"],
          }}
        >
          {money(v.advertisedPrice)}
        </Text>
        {hasDiscount && (
          <View style={styles.discountRow}>
            <Text
              style={{
                ...EXPRESSIVE_TYPE.caption,
                color: c.muted,
                textDecorationLine: "line-through",
                fontVariant: ["tabular-nums"],
              }}
            >
              {money(v.priceOriginal)}
            </Text>
            {v.discountPercent ? (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 999,
                  backgroundColor: c.container,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: c.accent,
                  }}
                >
                  -{v.discountPercent}%
                </Text>
              </View>
            ) : null}
          </View>
        )}
        {v.installment ? (
          <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.muted }}>
            {v.installment}
          </Text>
        ) : null}
      </View>

      {/* PSREF-style full spec table inside card */}
      <View
        style={[
          styles.specTable,
          { backgroundColor: c.container, borderColor: c.line },
        ]}
      >
        {(
          [
            ["Hãng / Dòng", [v.brand, v.model].filter(Boolean).join(" · ") || null],
            ["CPU", v.cpu ?? chips.cpu],
            ["GPU", v.gpu ?? chips.gpu],
            ["RAM", chips.ram],
            ["Lưu trữ", chips.ssd],
            ["Màn hình", v.screen],
            ["Pin", v.battery],
            ["Cân nặng", v.weight],
            ["HĐH", v.os],
          ] as [string, string | null | undefined][]
        ).map(([label, val], idx, arr) => {
          const known =
            val != null &&
            val !== "" &&
            val !== "Chưa rõ" &&
            val !== "Chưa xác minh" &&
            val !== "CPU chưa rõ" &&
            val !== "GPU tích hợp / chưa rõ" &&
            val !== "RAM chưa rõ";
          return (
            <View
              key={label}
              style={[
                styles.specTableRow,
                idx < arr.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderColor: c.line,
                },
              ]}
            >
              <Text
                style={{
                  width: 84,
                  fontSize: 12,
                  lineHeight: 16,
                  fontWeight: "800",
                  color: c.muted,
                }}
              >
                {label}
              </Text>
              <Text
                numberOfLines={2}
                style={{
                  flex: 1,
                  fontSize: 13,
                  lineHeight: 18,
                  fontWeight: known ? "700" : "400",
                  color: known ? c.onContainer : c.muted,
                  fontStyle: known ? "normal" : "italic",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {known ? val : "Chưa công bố"}
              </Text>
            </View>
          );
        })}
      </View>

      {g.strengths.length > 0 && (
        <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.text }}>
          ✓ {g.strengths.join(" · ")}
        </Text>
      )}
      {g.caveats.length > 0 && (
        <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.muted }}>
          ⚠ {g.caveats.join(" · ")}
        </Text>
      )}

      {conflicts.map((issue) => (
        <Text
          key={issue}
          accessibilityRole="alert"
          style={{ ...EXPRESSIVE_TYPE.label, color: c.error }}
        >
          {issue} · cần kiểm tra nguồn
        </Text>
      ))}

      {a.failed.length > 0 && (
        <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.error, fontWeight: "700" }}>
          Không đạt tiêu chí: {a.failed.join("; ")}
        </Text>
      )}

      <View style={[styles.row, { marginTop: "auto" }]}>
        <ExpressiveButton
          label={VI.viewConfigAction}
          onPress={() => onOpen(v)}
          colors={c}
          reduceMotion={reduceMotion}
        />
        <ExpressiveButton
          label={
            inCompare
              ? VI.removeCompareAction
              : `${VI.compareAction}${compareCount ? ` (${compareCount}/${MAX_COMPARE_ITEMS})` : ""}`
          }
          secondary
          selected={inCompare}
          onPress={() => onToggleCompare(v.id)}
          colors={c}
          reduceMotion={reduceMotion}
        />
      </View>
    </Pressable>
  );
});

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
  const [focusedLabel, setFocusedLabel] = useState<string | null>(null);

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
    [sort, setSort] = useState<"fit" | "price" | "total" | "name">("fit"),
    [maxWeightKg, setMaxWeightKg] = useState<number | null>(null),
    [screenBand, setScreenBand] = useState<"all" | "compact" | "standard">("all"),
    [showCompromises, setShowCompromises] = useState(false),
    [showExcluded, setShowExcluded] = useState(false),
    [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [copilotOpen, setCopilotOpen] = useState(false),
    [form, setForm] = useState(false),
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
    [budget, setBudget] = useState(
      formatVndDigits(String(INITIAL_REQUIREMENTS.budget)),
    );

  const [selected, setSelected] = useState<string[]>([]),
    [recentListingIds, setRecentListingIds] = useState<string[]>([]),
    [saveGroupName, setSaveGroupName] = useState(""),
    [detail, setDetail] = useState<Listing | null>(null),
    [detailSection, setDetailSection] = useState<
      "overview" | "specs" | "reviews" | "report"
    >("overview"),
    [buyingOptionsOpen, setBuyingOptionsOpen] = useState(false),
    [reviewData, setReviewData] = useState<SynthesizedReview | null>(null),
    [reviewBusy, setReviewBusy] = useState(false),
    [reportCategory, setReportCategory] = useState<
      "price" | "spec" | "stock" | "link"
    >("spec"),
    [reportNote, setReportNote] = useState(""),
    [historical, setHistorical] = useState(false),
    [history, setHistory] = useState<SavedDecision | null>(null);

  const [notice, setNotice] = useState(""),
    [connection, setConnection] = useState(
      "Dữ liệu đóng gói · kéo xuống để làm mới khi kết nối máy chủ",
    ),
    [checkedAt, setCheckedAt] = useState(""),
    [refreshing, setRefreshing] = useState(false);

  const [endpoint, setEndpoint] = useState(""),
    [token, setToken] = useState(""),
    [question, setQuestion] = useState(""),
    [answer, setAnswer] = useState(""),
    [proposal, setProposal] = useState<Requirements | null>(null),
    [busy, setBusy] = useState(false),
    [aiElapsedSec, setAiElapsedSec] = useState(0);

  const request = useRef(0),
    abort = useRef<AbortController | null>(null),
    refreshAbort = useRef<AbortController | null>(null),
    reviewAbort = useRef<AbortController | null>(null),
    refreshBusy = useRef(false),
    applyingSharedRef = useRef(false);

  function cancel() {
    request.current++;
    abort.current?.abort();
    localBridge?.cancel(String(request.current));
    setBusy(false);
  }

  useEffect(() => {
    if (!busy) {
      setAiElapsedSec(0);
      return;
    }
    const t = setInterval(() => setAiElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);

  async function persist(reduce: (s: AdviserState) => AdviserState) {
    const ok = await getStore().update(reduce);
    if (!ok)
      setNotice("Không lưu được thay đổi. Dữ liệu đã lưu trước đó được giữ.");
    return ok;
  }

  // Restore store + UI session + shared connection settings
  useEffect(() => {
    let mounted = true;
    const unsubShared = subscribeSharedSettings((shared) => {
      if (!mounted) return;
      applyingSharedRef.current = true;
      setEndpoint(shared.endpoint);
      setToken(shared.token);
      if (getStore().ready()) {
        void persist((s) => ({
          ...s,
          endpoint: shared.endpoint,
          token: shared.token,
        }));
      }
      setTimeout(() => {
        applyingSharedRef.current = false;
      }, 0);
    });

    const bootTimer = setTimeout(() => {
      if (mounted) setBoot((b) => (b === "loading" ? "failed" : b));
    }, 5000);

    void Promise.all([
      getStore().load(),
      AsyncStorage.getItem(UI_SESSION_KEY).catch(() => null),
      loadSharedSettings(),
    ]).then(([ok, rawSession, shared]) => {
      if (!mounted) return;
      clearTimeout(bootTimer);
      setBoot(ok ? "ready" : "failed");

      if (rawSession) {
        try {
          const ui = JSON.parse(rawSession);
          if (
            typeof ui.tab === "string" &&
            ["advisor", "explore", "compare", "saved", "settings"].includes(
              ui.tab,
            )
          ) {
            setTab(ui.tab);
          }
          if (typeof ui.query === "string") setQuery(ui.query);
          if (typeof ui.source === "string") setSource(ui.source);
          if (
            typeof ui.sort === "string" &&
            ["fit", "price", "total", "name"].includes(ui.sort)
          ) {
            setSort(ui.sort);
          }
          if (Array.isArray(ui.selected)) {
            setSelected(
              ui.selected
                .filter((id: unknown) => typeof id === "string")
                .slice(0, MAX_COMPARE_ITEMS),
            );
          }
        } catch {
          // Ignore malformed transient session cache
        }
      }

      const current = getStore().current();
      const nextEndpoint =
        shared?.endpoint || current.endpoint || DEFAULT_API_ENDPOINT;
      const nextToken = shared?.token ?? current.token;
      if (
        ok &&
        (nextEndpoint !== current.endpoint || nextToken !== current.token)
      ) {
        void persist((s) => ({
          ...s,
          endpoint: nextEndpoint,
          token: nextToken,
        }));
      }
      setEndpoint(nextEndpoint);
      setToken(nextToken);
    });

    return () => {
      mounted = false;
      unsubShared();
      clearTimeout(bootTimer);
      abort.current?.abort();
      refreshAbort.current?.abort();
      reviewAbort.current?.abort();
    };
  }, []);

  // Persist transient UI state across orientation/activity recreation (F-09)
  useEffect(() => {
    if (boot !== "ready") return;
    const t = setTimeout(() => {
      void AsyncStorage.setItem(
        UI_SESSION_KEY,
        JSON.stringify({ tab, query, source, sort, selected }),
      ).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [boot, tab, query, source, sort, selected]);

  // Reset pagination slice when filter/sort/search changes (UI-05)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    query,
    source,
    sort,
    showExcluded,
    maxWeightKg,
    screenBand,
    state.revision,
    tab,
  ]);

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
      setConnection("Đã đồng bộ dữ liệu máy chủ · kéo xuống để cập nhật");
    } catch {
      if (!controller.signal.aborted || getStore().ready())
        setConnection(
          "Chế độ ngoại tuyến · đang dùng catalog đã kiểm tra trên thiết bị",
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

  // Initial one-shot sync on ready/endpoint change — NO 30s battery-draining polling (UI-11, F-18)
  useEffect(() => {
    if (boot !== "ready" || !state.endpoint) return;
    void refreshRef.current();
    return () => {
      refreshAbort.current?.abort();
    };
  }, [boot, state.endpoint, state.token]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") {
        cancelRef.current();
        refreshAbort.current?.abort();
      } else {
        void refreshRef.current();
      }
    });
    return () => sub.remove();
  }, []);

  // Load synthesized review when user switches to Reviews section in Detail modal (STT 4.0)
  useEffect(() => {
    reviewAbort.current?.abort();
    if (!detail || detailSection !== "reviews") return;
    const fallback = buildOfflineReviewFallback(detail);
    if (!state.endpoint) {
      setReviewData(fallback);
      setReviewBusy(false);
      return;
    }
    const ctrl = new AbortController();
    reviewAbort.current = ctrl;
    setReviewBusy(true);
    const timer = setTimeout(() => ctrl.abort(), 12000);
    void fetchListingReview(state.endpoint, state.token, detail.id, ctrl.signal)
      .then((res) => {
        if (!ctrl.signal.aborted && res && typeof res.performance === "string") {
          setReviewData(res);
        } else if (!ctrl.signal.aborted) {
          setReviewData(fallback);
        }
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setReviewData(fallback);
      })
      .finally(() => {
        clearTimeout(timer);
        if (!ctrl.signal.aborted) setReviewBusy(false);
      });
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [detail?.id, detailSection, state.endpoint, state.token]);

  useEffect(() => {
    if (deviceAdvisorOpen) return;
    if (Platform.OS === "web") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (deletion) {
        if (!pending) setDeletion(null);
        return true;
      }
      if (copilotOpen) {
        setCopilotOpen(false);
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
      if (buyingOptionsOpen) {
        setBuyingOptionsOpen(false);
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
    copilotOpen,
    form,
    quoteModal,
    buyingOptionsOpen,
    detail,
    history,
    tab,
    deletion,
    pending,
    deviceAdvisorOpen,
  ]);

  const extraFilters = useMemo<CatalogExtraFilters>(
    () => ({
      maxWeightKg,
      maxScreenIn: screenBand === "compact" ? 14.5 : null,
      minScreenIn: screenBand === "standard" ? 15.0 : null,
    }),
    [maxWeightKg, screenBand],
  );

  const rows = useMemo(
    () =>
      searchCatalog(
        state.catalog,
        state.requirements,
        query,
        source,
        sort,
        extraFilters,
      ),
    [state.catalog, state.requirements, query, source, sort, extraFilters],
  );

  const visible = useMemo(
    () =>
      rows.filter((x) => showExcluded || x.assessment.state !== "excluded"),
    [rows, showExcluded],
  );

  const pagedListings = useMemo(
    () => visible.slice(0, visibleCount),
    [visible, visibleCount],
  );

  const top3Ids = useMemo(() => {
    if (tab !== "advisor" || sort !== "fit" || query || source) return [];
    return visible
      .filter((x) => x.assessment.state !== "excluded")
      .slice(0, 3)
      .map((x) => x.listing.id);
  }, [tab, sort, query, source, visible]);

  const upgrades = useMemo(
    () => budgetUpgradeCandidates(state.catalog, state.requirements),
    [state.catalog, state.requirements],
  );

  const siblings = useMemo(
    () =>
      detail && !historical ? relatedListings(state.catalog, detail, 8) : [],
    [state.catalog, detail, historical],
  );

  const buyingOptions = useMemo(() => {
    if (!detail) return [];
    const list = historical ? [detail] : [detail, ...siblings];
    return [...list].sort(
      (a, b) =>
        (a.advertisedPrice ?? Infinity) - (b.advertisedPrice ?? Infinity) ||
        a.id.localeCompare(b.id),
    );
  }, [detail, siblings, historical]);

  const filteredSaved = useMemo(() => {
    const q = savedQuery.trim().toLocaleLowerCase("vi");
    if (!q) return state.saved;
    return state.saved.filter((s) =>
      [
        s.groupName ?? "",
        s.savedAt,
        new Date(s.savedAt).toLocaleString("vi-VN"),
        ...s.listings.map(
          (v) => `${v.name} ${v.source} ${retailerDisplayName(v.source)}`,
        ),
      ]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(q),
    );
  }, [state.saved, savedQuery]);

  const open = useCallback((v: Listing, old = false) => {
    setNotice("");
    cancelRef.current();
    setAnswer("");
    setProposal(null);
    setQuestion("");
    setBuyingOptionsOpen(false);
    setDetailSection("overview");
    setReviewData(null);
    setReportCategory(
      listingEvidence(v).conflicts.length ? "spec" : "price",
    );
    setReportNote("");
    setDetail(v);
    setHistorical(old);
    if (!old) {
      setRecentListingIds((prev) => [v.id, ...prev].slice(0, 8));
    }
  }, []);

  const handleToggleCompare = useCallback((id: string) => {
    setSelected((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id);
      if (ids.length >= MAX_COMPARE_ITEMS) {
        setNotice(`Chỉ so sánh tối đa ${MAX_COMPARE_ITEMS} cấu hình.`);
        return ids;
      }
      return [...ids, id];
    });
  }, []);

  function edit(r = state.requirements) {
    setNotice("");
    setFieldError("");
    setDraft(JSON.parse(JSON.stringify(r)));
    setBudget(formatVndDigits(String(r.budget)));
    setForm(true);
  }

  async function applyConfirmedRequirements(r: Requirements) {
    if (!validRequirements(r) || pendingRef.current) return false;
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
      setCopilotOpen(false);
    }
    return committed;
  }

  async function confirm() {
    if (pendingRef.current) return;
    const rawDigits = parseVndDigits(budget);
    const numericBudget = Number(rawDigits);
    const r = { ...draft, budget: numericBudget };
    if (!rawDigits || !validRequirements(r)) {
      const msg = !rawDigits
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
    await applyConfirmedRequirements(r);
  }

  async function save(listings: Listing[], groupLabel = saveGroupName) {
    if (!listings.length || pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    const trimmedGroup = groupLabel.trim().slice(0, 80);
    const listingsCopy: Listing[] = JSON.parse(JSON.stringify(listings));
    let nextCount = 0;
    const ok = await persist((s) => {
      const snapshot: SavedDecision = {
        id: createUniqueDecisionId(),
        savedAt: new Date().toISOString(),
        catalogRevision: s.catalog.revision,
        requirements: JSON.parse(JSON.stringify(s.requirements)),
        listings: listingsCopy,
        ...(trimmedGroup ? { groupName: trimmedGroup } : {}),
      };
      const updated = [snapshot, ...s.saved].slice(0, 1000);
      nextCount = updated.length;
      return {
        ...s,
        saved: updated,
      };
    });
    if (ok) {
      setSaveGroupName("");
      setNotice(
        nextCount >= 900
          ? `Đã lưu quyết định (${nextCount}/1.000 bản lưu — sắp đầy bộ nhớ lịch sử).`
          : "Đã lưu bản quyết định kèm cấu hình và giá lịch sử.",
      );
    }
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
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      let value;
      if (localBridge && aiStatus === "available") {
        try {
          value = await localAdvice(
            localBridge,
            context,
            detail,
            current.requirements,
            question,
            controller.signal,
            25000,
          );
        } catch (localErr) {
          if (current.endpoint && !controller.signal.aborted) {
            value = await fetchAdvice(
              current.endpoint,
              current.token,
              context,
              current.requirements,
              question,
              controller.signal,
            );
          } else {
            throw localErr;
          }
        }
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
    } catch {
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
    placeholder?: string,
  ) => {
    const isBudget = label === "Ngân sách tối đa (VND)";
    const isFocused = focusedLabel === label;
    return (
      <View style={{ gap: EXPRESSIVE_SPACE.xs }}>
        {txt(label, true)}
        <TextInput
          ref={isBudget ? budgetInput : undefined}
          accessibilityLabel={label}
          accessibilityHint={isBudget && fieldError ? fieldError : undefined}
          value={value}
          onFocus={() => setFocusedLabel(label)}
          onBlur={() =>
            setFocusedLabel((cur) => (cur === label ? null : cur))
          }
          onChangeText={onChangeText}
          secureTextEntry={secure}
          keyboardType={numeric ? "number-pad" : "default"}
          autoCapitalize="none"
          placeholder={placeholder}
          placeholderTextColor={c.muted}
          style={{
            minHeight: 48,
            borderWidth: isFocused ? 2 : 1,
            borderColor: isBudget && fieldError ? c.error : isFocused ? c.accent : c.line,
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
    return `${v.name}\n${specification(v)}\nGiá niêm yết lịch sử: ${money(v.advertisedPrice)}\nNhà bán: ${retailerDisplayName(v.source)} · ${observationAgeLabel(v.observedAt)}\nTổng chi, tồn kho và năng lực tác vụ cần kiểm tra tại cửa hàng.\n${v.url}`;
  }

  function savedCard(s: SavedDecision) {
    const diffs = savedDecisionDiffs(s, state.catalog);
    return card(
      <>
        <View style={styles.cardTopRow}>
          {s.groupName ? (
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: c.container,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: c.onContainer,
                }}
              >
                {s.groupName}
              </Text>
            </View>
          ) : null}
          {txt(
            "Lưu lúc: " + new Date(s.savedAt).toLocaleString("vi-VN"),
            true,
          )}
        </View>
        <Text
          accessibilityRole="header"
          style={{ ...EXPRESSIVE_TYPE.section, color: c.text }}
        >
          {s.listings.map((v) => v.name).join("\n")}
        </Text>
        {txt(
          `Ngân sách khi lưu: ${money(s.requirements.budget)} · ${s.listings.length} cấu hình`,
          true,
        )}
        {diffs.map((d) => {
          const item = s.listings.find((x) => x.id === d.listingId);
          if (!item || d.status === "unchanged") return null;
          return (
            <Text
              key={d.listingId}
              style={{
                ...EXPRESSIVE_TYPE.caption,
                color: d.status === "removed" ? c.error : c.accent,
                fontWeight: "700",
              }}
            >
              {d.status === "removed"
                ? `• ${item.name}: không còn trong bản catalog hiện tại`
                : `• ${item.name}: giá hiện tại ${money(d.currentPrice)} (${(d.deltaVnd ?? 0) > 0 ? "+" : "-"}${money(Math.abs(d.deltaVnd ?? 0))})`}
            </Text>
          );
        })}
        <View style={styles.row}>
          {button(VI.openHistorySnapshot, () => setHistory(s))}
          {s.listings.length >= 2 &&
            button(
              "Đưa vào bảng so sánh",
              () => {
                const liveIds = s.listings
                  .map((v) => v.id)
                  .filter((id) =>
                    state.catalog.listings.some((x) => x.id === id),
                  )
                  .slice(0, MAX_COMPARE_ITEMS);
                if (liveIds.length < 2) {
                  setNotice(
                    "Một số cấu hình lịch sử không còn trong catalog hiện tại.",
                  );
                  return;
                }
                setSelected(liveIds);
                setTab("compare");
              },
              true,
            )}
          {button(
            VI.deleteSavedSnapshot,
            () =>
              setDeletion({
                label: `Xóa bản lưu: ${s.groupName ? `${s.groupName} — ` : ""}${s.listings.map((v) => v.name).join(", ")}?`,
                run: () =>
                  persist((latest) => ({
                    ...latest,
                    saved: latest.saved.filter((x) => x.id !== s.id),
                  })),
              }),
            true,
          )}
        </View>
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
                width: Math.min(680, Math.round(width * 0.58)),
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
          <View style={styles.modalHeaderRow}>
            <Text
              accessibilityRole="header"
              accessibilityLabel={title}
              style={{
                ...EXPRESSIVE_TYPE.title,
                color: c.text,
                flex: 1,
              }}
            >
              {title}
            </Text>
            {button(VI.close, close, true)}
          </View>
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

  const sortCycleLabel =
    sort === "fit"
      ? VI.sortByFit
      : sort === "price"
        ? VI.sortByPrice
        : sort === "total"
          ? VI.sortByTotal
          : VI.sortByName;

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
              ? pagedListings.map((x) => ({
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
          renderItem={({ item }) => {
            if (item.kind === "saved") {
              return <View style={{ width: "100%" }}>{savedCard(item.saved)}</View>;
            }
            const topIdx = top3Ids.indexOf(item.listing.id);
            const twoCol = expanded && (tab === "advisor" || tab === "explore");
            const cardWidth = twoCol
              ? Math.floor((Math.min(width, 1120) - EXPRESSIVE_SPACE.lg * 3) / 2)
              : undefined;
            return (
              <View style={twoCol ? { width: cardWidth } : { width: "100%" }}>
                <ListingCard
                  listing={item.listing}
                  requirements={state.requirements}
                  rankBadge={topIdx >= 0 ? topIdx + 1 : null}
                  inCompare={selected.includes(item.listing.id)}
                  compareCount={selected.length}
                  colors={c}
                  reduceMotion={reduceMotion}
                  onOpen={open}
                  onToggleCompare={handleToggleCompare}
                />
              </View>
            );
          }}
          ItemSeparatorComponent={() => (
            <View style={{ height: EXPRESSIVE_SPACE.lg }} />
          )}
          ListHeaderComponentStyle={{ marginBottom: EXPRESSIVE_SPACE.lg }}
          ListFooterComponentStyle={{ marginTop: EXPRESSIVE_SPACE.lg }}
          numColumns={
            expanded && (tab === "advisor" || tab === "explore") ? 2 : 1
          }
          columnWrapperStyle={
            expanded && (tab === "advisor" || tab === "explore")
              ? { gap: EXPRESSIVE_SPACE.lg, alignItems: "stretch" }
              : undefined
          }
          refreshing={refreshing}
          onRefresh={() => void refresh()}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (
              (tab === "advisor" || tab === "explore") &&
              visibleCount < visible.length
            ) {
              setVisibleCount((n) => Math.min(visible.length, n + PAGE_SIZE));
            }
          }}
          initialNumToRender={6}
          windowSize={7}
          key={`${tab}-${expanded ? "2col" : "1col"}`}
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{
            padding: EXPRESSIVE_SPACE.lg,
            paddingBottom: 30,
            width: "100%",
            maxWidth: expanded ? 1120 : 680,
            alignSelf: "center",
          }}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            (tab === "advisor" || tab === "explore") &&
            visibleCount < visible.length ? (
              <View style={{ paddingVertical: EXPRESSIVE_SPACE.md }}>
                {button(
                  `${VI.loadMore} (${visible.length - visibleCount} còn lại)`,
                  () =>
                    setVisibleCount((n) =>
                      Math.min(visible.length, n + PAGE_SIZE),
                    ),
                  true,
                )}
              </View>
            ) : undefined
          }
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

              {notice ? (
                <View
                  accessibilityLiveRegion="polite"
                  style={{
                    backgroundColor: c.card,
                    borderRadius: EXPRESSIVE_SHAPE.card,
                    padding: EXPRESSIVE_SPACE.xl,
                    gap: EXPRESSIVE_SPACE.md,
                    borderWidth: 1,
                    borderColor: c.accent,
                    ...EXPRESSIVE_ELEVATION.card,
                  }}
                >
                  {txt(notice)}
                  {button(VI.acknowledge, () => setNotice(""), true)}
                </View>
              ) : null}

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
                    <View style={styles.row}>
                      {button("Mở Device Advisor", () => {
                        cancel();
                        setDeviceAdvisorOpen(true);
                      })}
                      {button(
                        VI.copilotAction,
                        () => setCopilotOpen(true),
                        true,
                      )}
                    </View>
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
                          `${state.catalog.listings.length} cấu hình thực tế từ các hệ thống bán lẻ Việt Nam. Giá là quan sát có nguồn, tự kiểm tra tồn kho khi mua.`,
                        )}
                        {txt(
                          `Trần chi: ${money(state.requirements.budget)} · ${state.requirements.minRam ? `RAM ≥ ${state.requirements.minRam} GB` : "RAM: mọi mức"} · ${state.requirements.minStorage ? `Ổ ≥ ${state.requirements.minStorage} GB` : "Ổ: mọi mức"}`,
                        )}
                        {txt(
                          state.requirements.tasks.join(" · ") ||
                            "Chưa chọn tác vụ ưu tiên",
                          true,
                        )}
                        <View style={styles.row}>
                          {button(VI.adjustNeeds, () => edit())}
                          {button(
                            VI.copilotAction,
                            () => setCopilotOpen(true),
                            true,
                          )}
                          {button(
                            VI.checkExternalQuote,
                            () => {
                              setQuoteError("");
                              setQuoteModal(true);
                            },
                            true,
                          )}
                        </View>
                      </ExpressiveSurface>,
                    )}

                  {input(query, setQuery, VI.searchPlaceholder)}

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {[
                      "",
                      ...new Set(state.catalog.listings.map((v) => v.source)),
                    ].map((s) => (
                      <Pressable
                        key={s || "all"}
                        accessibilityRole="radio"
                        accessibilityLabel={retailerDisplayName(s)}
                        accessibilityState={{ selected: source === s }}
                        onPress={() => setSource(s)}
                        style={{ minHeight: 48, justifyContent: "center" }}
                      >
                        <RetailerBadge
                          source={s}
                          colors={c}
                          selected={source === s}
                        />
                      </Pressable>
                    ))}
                  </ScrollView>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {[
                      { label: "Mọi cân nặng", val: null },
                      { label: "Mỏng nhẹ ≤ 1.5 kg", val: 1.5 },
                      { label: "Di động ≤ 2.0 kg", val: 2.0 },
                    ].map((opt) => (
                      <View key={opt.label}>
                        {button(
                          opt.label,
                          () => setMaxWeightKg(opt.val),
                          maxWeightKg !== opt.val,
                          false,
                          { selected: maxWeightKg === opt.val, role: "radio" },
                        )}
                      </View>
                    ))}
                    {[
                      { label: "Mọi màn hình", val: "all" as const },
                      { label: "Gọn ≤ 14.5\"", val: "compact" as const },
                      { label: "Rộng ≥ 15\"", val: "standard" as const },
                    ].map((opt) => (
                      <View key={opt.label}>
                        {button(
                          opt.label,
                          () => setScreenBand(opt.val),
                          screenBand !== opt.val,
                          false,
                          { selected: screenBand === opt.val, role: "radio" },
                        )}
                      </View>
                    ))}
                  </ScrollView>

                  <View style={styles.row}>
                    {button(
                      sortCycleLabel,
                      () =>
                        setSort((cur) =>
                          cur === "fit"
                            ? "price"
                            : cur === "price"
                              ? "total"
                              : cur === "total"
                                ? "name"
                                : "fit",
                        ),
                      true,
                    )}
                    {button(
                      showExcluded ? VI.hideExcluded : VI.showExcluded,
                      () => setShowExcluded(!showExcluded),
                      true,
                    )}
                    {upgrades.length > 0 &&
                      button(
                        showCompromises
                          ? "Ẩn gợi ý +5tr"
                          : `Tham khảo +5tr (${upgrades.length})`,
                        () => setShowCompromises(!showCompromises),
                        true,
                      )}
                  </View>

                  {showCompromises &&
                    upgrades.length > 0 &&
                    card(
                      <>
                        <Text
                          style={{ ...EXPRESSIVE_TYPE.section, color: c.text }}
                        >
                          Phương án sát trần (+tối đa 5.000.000 ₫)
                        </Text>
                        {txt(
                          "Chỉ hiển thị khi bạn chủ động mở — không tự nới trần ngân sách của bạn.",
                          true,
                        )}
                        {upgrades.map((u) => (
                          <View key={u.listing.id} style={{ gap: 6 }}>
                            {txt(
                              `• ${u.listing.name} (${retailerDisplayName(u.listing.source)}) — ${money(u.listing.advertisedPrice)} (vượt +${money(u.extraVnd)})`,
                            )}
                            {button(
                              "Xem cấu hình này",
                              () => open(u.listing),
                              true,
                            )}
                          </View>
                        ))}
                      </>,
                    )}

                  {txt(
                    `Đang hiển thị ${Math.min(visibleCount, visible.length)} / ${visible.length} cấu hình phù hợp · ${rows.filter((x) => x.assessment.state === "excluded").length} vượt điều kiện đã đặt`,
                    true,
                  )}

                  {!visible.length &&
                    card(
                      <>
                        {txt(
                          query
                            ? "Không tìm thấy tin khớp từ khóa."
                            : source || maxWeightKg !== null || screenBand !== "all"
                              ? "Bộ lọc hiện tại không có cấu hình đáp ứng."
                              : "Không có tin đáp ứng các tiêu chí đã đặt. Hệ thống giữ nguyên ngân sách của bạn.",
                        )}
                        {!query && !source && rows.length > 0 && (
                          <>
                            {txt(
                              `Nguyên nhân loại: ${rows.filter((x) => x.assessment.failed.some((f) => f.includes("ngân sách"))).length} vượt ngân sách · ${rows.filter((x) => x.assessment.failed.some((f) => f.includes("RAM"))).length} thiếu RAM · ${rows.filter((x) => x.assessment.failed.some((f) => f.includes("Ổ"))).length} thiếu ổ lưu trữ.`,
                              true,
                            )}
                            {upgrades.length > 0 &&
                              txt(
                                `Tham khảo (+5.000.000 ₫): có ${upgrades.length} mẫu chỉ vượt nhẹ trần hiện tại, ví dụ ${upgrades[0].listing.name} (+${money(upgrades[0].extraVnd)} · ${specification(upgrades[0].listing)}).`,
                                true,
                              )}
                          </>
                        )}
                        {query ||
                        source ||
                        maxWeightKg !== null ||
                        screenBand !== "all"
                          ? button("Xóa tìm kiếm & bộ lọc", () => {
                              setQuery("");
                              setSource("");
                              setMaxWeightKg(null);
                              setScreenBand("all");
                            })
                          : button("Chỉnh nhu cầu", () => edit())}
                      </>,
                    )}
                </>
              )}

              {tab === "compare" && (
                <>
                  {txt(
                    `Đối chiếu cấu hình song song · tối đa ${MAX_COMPARE_ITEMS} máy`,
                  )}
                  {selected.length === 0 &&
                    txt("Chọn “So sánh” trên 2–4 thẻ máy để đặt lên bàn cân.")}
                  <ComparisonView
                    items={selected
                      .map((id) =>
                        state.catalog.listings.find((v) => v.id === id),
                      )
                      .filter((v): v is Listing => !!v)}
                    catalog={state.catalog}
                    requirements={state.requirements}
                    expanded={expanded}
                    colors={c}
                    reduceMotion={reduceMotion}
                    onRemove={(id) =>
                      setSelected((ids) => ids.filter((x) => x !== id))
                    }
                    onSwap={(oldId, newId) =>
                      setSelected((ids) =>
                        swapComparisonColumn(ids, oldId, newId),
                      )
                    }
                    onOpen={(v) => open(v)}
                    onBrowse={() => setTab("explore")}
                  />
                  {selected.length > 0 &&
                    input(
                      saveGroupName,
                      setSaveGroupName,
                      "Tên nhóm bản lưu (không bắt buộc, ví dụ: Laptop CNTT)",
                    )}
                  {button(
                    VI.saveComparisonDecision,
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
                  {txt("Quyết định đã lưu · đối chiếu biến động giá so với hiện tại")}
                  {state.saved.length >= 900 &&
                    txt(
                      `Cảnh báo dung lượng: đã lưu ${state.saved.length}/1.000 bản quyết định. Nên xuất hoặc dọn bớt bản cũ.`,
                      true,
                    )}
                  {state.saved.length > 0 &&
                    input(
                      savedQuery,
                      setSavedQuery,
                      VI.savedSearchPlaceholder,
                    )}
                  {state.saved.length > 0 && (
                    <View style={styles.row}>
                      {button(
                        "Chia sẻ tóm tắt dễ đọc",
                        () =>
                          void Share.share({
                            message: formatSavedShareBrief(filteredSaved),
                          }),
                        true,
                      )}
                    </View>
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
                      {txt("Kết nối dịch vụ & AI trực tuyến")}
                      {txt(
                        "Đồng bộ chung giữa màn hình chính và Device Advisor. Hỗ trợ Hybrid AI (LangGraph + ChatGPT khi trực tuyến, tự chuyển về Gemini Nano & quy tắc khi ngoại tuyến).",
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
                        "Mã truy cập dịch vụ (Bearer token)",
                        false,
                        true,
                      )}
                      <View style={styles.row}>
                        {button("Lưu kết nối", () => {
                          refreshAbort.current?.abort();
                          cancel();
                          const trimmed = endpoint.trim();
                          void saveSharedSettings(trimmed, token);
                          void persist((s) => ({
                            ...s,
                            endpoint: trimmed,
                            token,
                          }));
                          setNotice("Đã lưu cấu hình kết nối dùng chung.");
                        })}
                        {button(
                          "Ngắt kết nối",
                          () => {
                            cancel();
                            refreshAbort.current?.abort();
                            setEndpoint("");
                            setToken("");
                            setConnection(
                              "Chế độ ngoại tuyến · đang dùng dữ liệu đóng gói",
                            );
                            void saveSharedSettings("", "");
                            void persist((s) => ({
                              ...s,
                              endpoint: "",
                              token: "",
                            }));
                          },
                          true,
                        )}
                      </View>
                    </>,
                  )}
                  {card(
                    <>
                      {txt("Dữ liệu & quyền riêng tư")}
                      {txt(
                        "Khi ngoại tuyến, Gemini Nano chạy qua Android AICore cùng bộ quy tắc tất định trên máy. Khi trực tuyến, LangGraph kiểm chứng mọi gợi ý với catalog thực trước khi hiển thị. Mọi thay đổi nhu cầu đều cần bạn xác nhận.",
                        true,
                      )}
                      {txt(
                        "Phiên bản catalog: " +
                          state.catalog.revision.slice(0, 16),
                        true,
                      )}
                      <View style={styles.row}>
                        {button(
                          "Chia sẻ tóm tắt đã lưu",
                          () =>
                            void Share.share({
                              message: formatSavedShareBrief(state.saved),
                            }),
                          true,
                        )}
                        {button(
                          "Sao lưu JSON gốc",
                          () =>
                            void Share.share({
                              message: JSON.stringify(state.saved, null, 2),
                            }),
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
                      </View>
                    </>,
                  )}
                </>
              )}
            </ExpressiveSurface>
          }
        />
      )}

      {!deviceAdvisorOpen && (
        <ProactiveCopilotBar
          catalog={state.catalog}
          requirements={state.requirements}
          currentListing={detail}
          recentListingIds={recentListingIds}
          compareIds={selected}
          endpoint={state.endpoint}
          token={state.token}
          colors={c}
          reduceMotion={reduceMotion}
          onCompareIds={(ids) => {
            setSelected(ids.slice(0, MAX_COMPARE_ITEMS));
            setDetail(null);
            setTab("compare");
          }}
          onOpenListing={(v) => open(v)}
        />
      )}

      {!deviceAdvisorOpen && selected.length > 0 && tab !== "compare" && (
        <View style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: c.container }}>
          <ExpressiveSurface
            key={selected.join(":")}
            reduceMotion={reduceMotion}
          >
            {button(
              `So sánh ${selected.length}/${MAX_COMPARE_ITEMS} cấu hình đã chọn`,
              () => setTab("compare"),
            )}
          </ExpressiveSurface>
        </View>
      )}

      {/* Icon-Only Bottom Navigation Bar (UI-15) — preserves 5 accessible tabs & host-feature contract */}
      <View
        accessibilityRole="tablist"
        style={{
          flexDirection: "row",
          paddingVertical: EXPRESSIVE_SPACE.sm,
          paddingHorizontal: EXPRESSIVE_SPACE.md,
          gap: EXPRESSIVE_SPACE.sm,
          borderTopWidth: 1,
          borderColor: c.line,
          backgroundColor: c.bg,
        }}
      >
        {(
          [
            ["advisor", VI.tabs.advisor],
            ["explore", VI.tabs.explore],
            [
              "compare",
              selected.length > 0
                ? `${VI.tabs.compare} ${selected.length}`
                : VI.tabs.compare,
            ],
            ["saved", VI.tabs.saved],
            ["settings", VI.tabs.settings],
          ] as const
        ).map(([id, a11yLabel]) => {
          const isSelected = tab === id && !deviceAdvisorOpen;
          return (
            <Pressable
              key={id}
              accessibilityRole="tab"
              accessibilityLabel={a11yLabel}
              accessibilityState={{ selected: isSelected }}
              aria-selected={isSelected}
              onPress={() => {
                cancel();
                setDeviceAdvisorOpen(false);
                setTab(id);
              }}
              style={{
                flex: 1,
                minHeight: 56,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: EXPRESSIVE_SHAPE.selected,
                backgroundColor: isSelected ? c.accent : c.bg,
              }}
            >
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <NavigationIcon
                  name={id}
                  color={isSelected ? c.onAccent : c.text}
                />
                {id === "compare" && selected.length > 0 && (
                  <View
                    accessible={false}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -12,
                      minWidth: 18,
                      height: 18,
                      paddingHorizontal: 4,
                      borderRadius: 9,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected ? c.onAccent : c.accent,
                    }}
                  >
                    <Text
                      accessible={false}
                      style={{
                        fontSize: 11,
                        lineHeight: 14,
                        fontWeight: "800",
                        color: isSelected ? c.accent : c.onAccent,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {selected.length}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Hybrid Conversational AI Copilot Sheet (STT 2.0) */}
      {modal(
        copilotOpen,
        VI.copilotAction,
        () => setCopilotOpen(false),
        <CopilotSheet
          catalog={state.catalog}
          requirements={state.requirements}
          endpoint={state.endpoint}
          token={state.token}
          localBridge={localBridge}
          aiStatus={aiStatus}
          selectedCompareIds={selected}
          colors={c}
          reduceMotion={reduceMotion}
          onApplyRequirements={(nextReq) => {
            void applyConfirmedRequirements(nextReq);
          }}
          onOpenListing={(v) => {
            setCopilotOpen(false);
            open(v);
          }}
          onToggleCompare={handleToggleCompare}
        />,
      )}

      {/* Delete Confirmation Modal */}
      {modal(
        !!deletion,
        VI.deleteConfirmTitle,
        () => {
          if (!pending) setDeletion(null);
        },
        <>
          {txt(deletion?.label ?? "")}
          <View style={styles.row}>
            {button(VI.cancel, () => setDeletion(null), true, pending)}
            {button(
              pending ? VI.deleteWorking : VI.deleteConfirmAction,
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
          </View>
        </>,
      )}

      {/* Needs Modal (UI-06 dot grouping, UI-07 OS textbox removed, UI-08 concise task label) */}
      {modal(
        form,
        VI.needsModalTitle,
        () => setForm(false),
        <>
          {input(
            budget,
            (v) => {
              setFieldError("");
              setBudget(formatVndDigits(v));
            },
            "Ngân sách tối đa (VND)",
            true,
            false,
            "Ví dụ: 25.000.000",
          )}
          {txt("Yêu cầu bắt buộc về RAM")}
          <View style={styles.row}>
            {[0, 8, 16, 32, 64].map((n) => (
              <View key={n}>
                {button(
                  n === 0 ? "Không giới hạn" : `${n} GB`,
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
                  n === 0 ? "Không giới hạn" : `${n} GB`,
                  () => setDraft({ ...draft, minStorage: n }),
                  draft.minStorage !== n,
                  false,
                  { selected: draft.minStorage === n, role: "radio" },
                )}
              </View>
            ))}
          </View>
          {draft.os ? (
            <View style={styles.row}>
              {txt(`Đang giữ lọc HĐH lịch sử: ${draft.os}`, true)}
              {button(
                "Bỏ lọc HĐH",
                () => setDraft({ ...draft, os: "" }),
                true,
              )}
            </View>
          ) : null}
          {txt("Tác vụ cần làm")}
          <View style={styles.row}>
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
          </View>
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

      {/* External Quotation Modal (UI-06 live dot grouping) */}
      {modal(
        quoteModal,
        VI.quoteModalTitle,
        () => setQuoteModal(false),
        <>
          {txt(
            "Nhập thông tin báo giá hoặc liên kết HTTPS từ nhà bán được hỗ trợ (FPT Shop, Thế Giới Di Động, Điện Máy Xanh, CellphoneS, GearVN, Phong Vũ, HACOM, LaptopAZ). Giá tự phân cách hàng nghìn (ví dụ: 22.990.000).",
            true,
          )}
          {input(quoteName, setQuoteName, "Tên máy / cấu hình trong báo giá")}
          {input(
            quoteUrl,
            setQuoteUrl,
            "Liên kết HTTPS (để trống nếu là báo giá tại cửa hàng)",
          )}
          {input(
            quotePrice,
            (v) => setQuotePrice(formatVndDigits(v)),
            "Giá niêm yết (VND)",
            true,
            false,
            "Ví dụ: 22.990.000",
          )}
          {input(
            quoteShipping,
            (v) => setQuoteShipping(formatVndDigits(v)),
            "Phí giao hàng bắt buộc (VND, để trống nếu chưa rõ)",
            true,
          )}
          {input(
            quoteFees,
            (v) => setQuoteFees(formatVndDigits(v)),
            "Phí bắt buộc khác (VND, để trống nếu chưa rõ)",
            true,
          )}
          {input(
            quoteRam,
            (v) => setQuoteRam(parseVndDigits(v)),
            "RAM (GB, để trống nếu chưa rõ)",
            true,
          )}
          {input(
            quoteStorage,
            (v) => setQuoteStorage(parseVndDigits(v)),
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
                ? `Đã nhận diện nhà bán ${retailerDisplayName(parsed.listing.source)} và đối chiếu với nhu cầu.`
                : "Đã nạp báo giá thủ công để đối chiếu với nhu cầu.",
            );
          })}
        </>,
      )}

      {/* Rich Product Detail + "Mua ngay" Buying Options Sheet (UI-03, UI-14, UI-16, STT 4, 6, 8) */}
      {modal(
        !!detail,
        detail?.name ?? "",
        () => {
          cancel();
          setDetail(null);
        },
        detail && (
          <>
            {historical &&
              card(
                txt(
                  "BẢN LƯU LỊCH SỬ · Giữ nguyên giá và nhu cầu tại thời điểm lưu.",
                ),
              )}

            {/* Hero Summary & "Mua ngay" Primary CTA */}
            {card(
              <>
                <View style={styles.cardTopRow}>
                  <RetailerBadge source={detail.source} colors={c} />
                  <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.muted }}>
                    {observationAgeLabel(detail.observedAt)}
                  </Text>
                </View>

                {SafeImage && detail.thumbnail && safeLink(detail.thumbnail) ? (
                  <SafeImage
                    source={{ uri: detail.thumbnail }}
                    accessibilityIgnoresInvertColors
                    resizeMode="contain"
                    style={styles.detailHeroImage}
                  />
                ) : null}

                <Text
                  style={{
                    fontSize: 30,
                    lineHeight: 38,
                    fontWeight: "800",
                    color: c.accent,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {money(detail.advertisedPrice)}
                </Text>

                {detail.priceOriginal &&
                detail.priceOriginal > (detail.advertisedPrice ?? 0) ? (
                  <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.muted }}>
                    Giá gốc: {money(detail.priceOriginal)}
                    {detail.discountPercent ? ` (-${detail.discountPercent}%)` : ""}
                    {detail.installment ? ` · ${detail.installment}` : ""}
                  </Text>
                ) : detail.installment ? (
                  <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.muted }}>
                    {detail.installment}
                  </Text>
                ) : null}

                <View style={styles.specGrid}>
                  {(
                    [
                      ["CPU", specChips(detail).cpu],
                      ["GPU", specChips(detail).gpu],
                      ["RAM", specChips(detail).ram],
                      ["SSD", specChips(detail).ssd],
                    ] as const
                  ).map(([k, v]) => (
                    <View
                      key={k}
                      style={[
                        styles.specChip,
                        { backgroundColor: c.container, borderColor: c.line },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "800",
                          color: c.muted,
                        }}
                      >
                        {k}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: c.onContainer,
                        }}
                      >
                        {v}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.row}>
                  {button(
                    `${VI.buyNow} (${buyingOptions.length} lựa chọn)`,
                    () => setBuyingOptionsOpen((o) => !o),
                  )}
                  {!historical &&
                    button(
                      selected.includes(detail.id)
                        ? VI.removeCompareAction
                        : VI.compareAction,
                      () => handleToggleCompare(detail.id),
                      true,
                    )}
                  {button(
                    "Chia sẻ",
                    () => void Share.share({ message: summary(detail) }),
                    true,
                  )}
                </View>
              </>,
            )}

            {/* Multi-Retailer & Configuration Buying Options Panel (UI-14, UI-16, STT 6.0, STT 8.0) */}
            {buyingOptionsOpen &&
              card(
                <>
                  <View style={styles.cardTopRow}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                      <Icon name="store" size={18} color={c.accent} />
                      <Text
                        accessibilityRole="header"
                        style={{ ...EXPRESSIVE_TYPE.section, color: c.text }}
                      >
                        {VI.buyingOptionsTitle}
                      </Text>
                    </View>
                  </View>
                  {txt(
                    "Đối chiếu trực tiếp cấu hình phần cứng, giá ghi nhận và ưu đãi giữa các phiên bản / nhà bán trước khi chuyển sang website cửa hàng.",
                    true,
                  )}
                  {buyingOptions.map((opt) => {
                    const optChips = specChips(opt);
                    const diffs =
                      opt.id === detail.id
                        ? []
                        : variantHardwareDiff(detail, opt);
                    const optAssess = assess(opt, state.requirements);
                    const isCurrent = opt.id === detail.id;
                    return (
                      <View
                        key={opt.id}
                        style={{
                          padding: EXPRESSIVE_SPACE.md,
                          borderRadius: EXPRESSIVE_SHAPE.selected,
                          borderWidth: isCurrent ? 2 : 1,
                          borderColor: isCurrent ? c.accent : c.line,
                          backgroundColor: isCurrent ? c.container : c.bg,
                          gap: 8,
                        }}
                      >
                        <View style={styles.cardTopRow}>
                          <RetailerBadge source={opt.source} colors={c} compact />
                          <Text
                            style={{
                              fontSize: 20,
                              lineHeight: 26,
                              fontWeight: "800",
                              color: c.accent,
                              fontVariant: ["tabular-nums"],
                            }}
                          >
                            {money(opt.advertisedPrice)}
                          </Text>
                        </View>
                        <Text
                          style={{
                            ...EXPRESSIVE_TYPE.label,
                            color: c.text,
                          }}
                        >
                          {opt.name}
                        </Text>
                        <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.text }}>
                          {`CPU: ${optChips.cpu} · GPU: ${optChips.gpu} · RAM: ${optChips.ram} · SSD: ${optChips.ssd}`}
                          {opt.screen ? ` · Màn: ${opt.screen.split(",")[0]}` : ""}
                        </Text>
                        {diffs.length > 0 && (
                          <Text
                            style={{
                              ...EXPRESSIVE_TYPE.caption,
                              color: c.accent,
                              fontWeight: "700",
                            }}
                          >
                            Khác biệt phần cứng: {diffs.join(" · ")}
                          </Text>
                        )}
                        <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.muted }}>
                          {optAssess.total !== null
                            ? `Tổng thanh toán đã biết: ${money(optAssess.total)}`
                            : "Phí giao hàng / phụ phí: kiểm tra tại giỏ hàng nhà bán"}
                          {opt.installment ? ` · ${opt.installment}` : ""}
                          {` · ${observationAgeLabel(opt.observedAt)}`}
                        </Text>
                        <View style={styles.row}>
                          {button(VI.visitRetailer, () => {
                            if (safeLink(opt.url)) {
                              void Linking.openURL(opt.url).catch(() =>
                                setNotice("Không mở được liên kết cửa hàng."),
                              );
                            }
                          })}
                          {!isCurrent &&
                            button(
                              "Xem cấu hình này",
                              () => open(opt),
                              true,
                            )}
                        </View>
                      </View>
                    );
                  })}
                </>,
              )}

            {/* Segmented Detail Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 8 }}
            >
              {(
                [
                  ["overview", "Tổng quan"],
                  ["specs", "Thông số chi tiết"],
                  ["reviews", "Đánh giá & đo kiểm"],
                  ["report", "Nguồn & báo sai"],
                ] as const
              ).map(([secId, secLabel]) => (
                <View key={secId}>
                  {button(
                    secLabel,
                    () => setDetailSection(secId),
                    detailSection !== secId,
                    false,
                    { selected: detailSection === secId, role: "radio" },
                  )}
                </View>
              ))}
            </ScrollView>

            {detailSection === "overview" &&
              card(
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
                </>,
              )}

            {detailSection === "specs" &&
              card(
                <>
                  <Text style={{ ...EXPRESSIVE_TYPE.section, color: c.text }}>
                    Bảng thông số kỹ thuật
                  </Text>
                  {[
                    ["Thương hiệu", detail.brand ?? "Chưa rõ"],
                    ["Dòng / Model", detail.model ?? "Chưa rõ"],
                    ["Vi xử lý (CPU)", detail.cpu ?? specChips(detail).cpu],
                    ["Đồ họa (GPU)", detail.gpu ?? specChips(detail).gpu],
                    ["Bộ nhớ RAM", specChips(detail).ram],
                    ["Lưu trữ", specChips(detail).ssd],
                    ["Màn hình", detail.screen ?? "Chưa rõ"],
                    ["Pin", detail.battery ?? "Chưa rõ"],
                    ["Khối lượng", detail.weight ?? "Chưa rõ"],
                    ["Hệ điều hành", detail.os ?? "Chưa rõ"],
                    [
                      "Tình trạng",
                      detail.condition === "used" ? "Đã qua sử dụng" : "Máy mới",
                    ],
                  ].map(([k, val]) => (
                    <View
                      key={k}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        gap: 12,
                        paddingVertical: 6,
                        borderBottomWidth: 1,
                        borderColor: c.line,
                      }}
                    >
                      <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.muted, flex: 1 }}>
                        {k}
                      </Text>
                      <Text
                        style={{
                          ...EXPRESSIVE_TYPE.body,
                          color: c.text,
                          flex: 2,
                          textAlign: "right",
                        }}
                      >
                        {val}
                      </Text>
                    </View>
                  ))}
                </>,
              )}

            {detailSection === "reviews" &&
              card(
                <>
                  <Text style={{ ...EXPRESSIVE_TYPE.section, color: c.text }}>
                    Tổng hợp đánh giá & hiệu năng thực tế
                  </Text>
                  {reviewBusy ? (
                    <ExpressiveLoading
                      label="Đang đối chiếu dữ liệu đánh giá theo đúng SKU…"
                      color={c.text}
                      reduceMotion={reduceMotion}
                    />
                  ) : reviewData ? (
                    <View style={{ gap: EXPRESSIVE_SPACE.sm }}>
                      {[
                        ["Hiệu năng thực tế", reviewData.performance],
                        ["Nhiệt độ & tiếng quạt", reviewData.thermals_noise],
                        ["Thời lượng pin", reviewData.battery_real],
                        ["Lưu ý / nhược điểm", reviewData.quirks_cons],
                      ].map(([bucket, content]) => (
                        <View
                          key={bucket}
                          style={{
                            padding: EXPRESSIVE_SPACE.md,
                            borderRadius: EXPRESSIVE_SHAPE.selected,
                            backgroundColor: c.container,
                            gap: 4,
                          }}
                        >
                          <Text
                            style={{
                              ...EXPRESSIVE_TYPE.label,
                              color: c.onContainer,
                            }}
                          >
                            {bucket}
                          </Text>
                          <Text style={{ ...EXPRESSIVE_TYPE.body, color: c.text }}>
                            {content}
                          </Text>
                        </View>
                      ))}
                      {txt(
                        `Nguồn trích dẫn: ${reviewData.sourceName} · Kiểm tra: ${new Date(reviewData.checkedAt).toLocaleDateString("vi-VN")}`,
                        true,
                      )}
                    </View>
                  ) : null}
                </>,
              )}

            {detailSection === "report" &&
              card(
                <>
                  <Text style={{ ...EXPRESSIVE_TYPE.section, color: c.text }}>
                    Nguồn dữ liệu & báo sai lệch
                  </Text>
                  <Text selectable style={{ ...EXPRESSIVE_TYPE.caption, color: c.muted }}>
                    Liên kết gốc: {detail.url}
                  </Text>
                  {!historical && (
                    <>
                      <View style={styles.row}>
                        {(
                          [
                            ["spec", "Sai cấu hình"],
                            ["price", "Sai giá"],
                            ["stock", "Hết hàng"],
                            ["link", "Hỏng liên kết"],
                          ] as const
                        ).map(([catId, catLabel]) => (
                          <View key={catId}>
                            {button(
                              catLabel,
                              () => setReportCategory(catId),
                              reportCategory !== catId,
                              false,
                              {
                                selected: reportCategory === catId,
                                role: "radio",
                              },
                            )}
                          </View>
                        ))}
                      </View>
                      {input(
                        reportNote,
                        setReportNote,
                        "Ghi chú chi tiết điểm sai lệch (không bắt buộc)",
                      )}
                      {button(
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
                              category: reportCategory,
                              note:
                                reportNote.trim() ||
                                `Báo kiểm tra ${reportCategory} cho ${detail.name}`,
                            },
                            ctrl.signal,
                          )
                            .then((rep) => {
                              setReportNote("");
                              setNotice(
                                `Đã gửi báo cáo kiểm duyệt (${rep.id}). Bộ phận dữ liệu sẽ đối chiếu nguồn gốc.`,
                              );
                            })
                            .catch((err) =>
                              setNotice(
                                err instanceof Error &&
                                  err.message === "SERVICE_UNAVAILABLE"
                                  ? "Máy chủ tạm bận. Vui lòng thử gửi lại sau."
                                  : "Đã gửi báo cáo gần đây hoặc máy chủ chưa phản hồi. Cảnh báo trên máy được giữ nguyên.",
                              ),
                            );
                        },
                        true,
                      )}
                    </>
                  )}
                </>,
              )}

            {!historical &&
              card(
                <>
                  {input(
                    saveGroupName,
                    setSaveGroupName,
                    "Nhóm lưu trữ (không bắt buộc, ví dụ: Máy văn phòng)",
                  )}
                  {button(
                    VI.saveDecision,
                    () => void save([detail]),
                    false,
                    boot !== "ready",
                    undefined,
                    pending,
                  )}
                </>,
              )}

            {/* Grounded Per-Listing AI Assistant (Hybrid On-Device Gemini Nano + FastAPI) */}
            {!historical &&
              card(
                <>
                  {txt(
                    localBridge && aiStatus === "available"
                      ? "Trợ lý AI · Gemini Nano trên thiết bị"
                      : state.endpoint
                        ? "Trợ lý AI · FastAPI & LangGraph kiểm chứng"
                        : "Trợ lý AI trên thiết bị",
                  )}
                  {txt(
                    "Trạng thái: " +
                      (localBridge && aiStatus === "available"
                        ? "Gemini Nano sẵn sàng"
                        : state.endpoint
                          ? `Đã kết nối máy chủ (${state.endpoint})`
                          : localBridge
                            ? {
                                available: "Sẵn sàng",
                                downloadable: "Có thể tải mô hình Gemini Nano",
                                downloading: "Đang tải mô hình…",
                                unavailable:
                                  "AICore chưa sẵn sàng — kết nối máy chủ trong Cài đặt để hỏi trực tuyến",
                              }[aiStatus]
                            : "Chưa kết nối máy chủ tư vấn"),
                    true,
                  )}
                  {localBridge &&
                    aiStatus !== "available" &&
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
                  {input(
                    question,
                    setQuestion,
                    "Câu hỏi về cấu hình đang xem",
                  )}
                  <View style={styles.row}>
                    {button(
                      busy ? `Đang hỏi AI (${aiElapsedSec}s)…` : "Hỏi AI",
                      () => void ask(),
                      false,
                      busy ||
                        boot !== "ready" ||
                        (!state.endpoint && aiStatus !== "available") ||
                        !question.trim(),
                      undefined,
                      busy,
                    )}
                    {busy && button("Hủy yêu cầu", cancel, true)}
                  </View>
                  {answer ? txt(answer) : null}
                  {proposal && (
                    <>
                      {txt(
                        `Đề xuất điều chỉnh: ${money(proposal.budget)} · RAM ${proposal.minRam} GB · ổ ${proposal.minStorage} GB · ${proposal.tasks.join(", ")}`,
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

      {/* Historical Snapshot Modal */}
      {modal(
        !!history && !detail,
        history?.groupName
          ? `${VI.historyModalTitle}: ${history.groupName}`
          : VI.historyModalTitle,
        () => setHistory(null),
        history && (
          <>
            {txt("Lưu lúc: " + new Date(history.savedAt).toLocaleString("vi-VN"))}
            {txt(
              "Giá quan sát lịch sử được giữ nguyên. Đối chiếu bên dưới cho biết biến động so với catalog hiện tại.",
            )}
            {history.listings.map((v) => {
              const live = state.catalog.listings.find((x) => x.id === v.id);
              return card(
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
                  {live && live.advertisedPrice !== v.advertisedPrice && (
                    <Text
                      style={{
                        ...EXPRESSIVE_TYPE.caption,
                        color: c.accent,
                        fontWeight: "700",
                      }}
                    >
                      Giá hiện tại trong kho: {money(live.advertisedPrice)} (khi lưu:{" "}
                      {money(v.advertisedPrice)})
                    </Text>
                  )}
                  {!live && (
                    <Text
                      style={{
                        ...EXPRESSIVE_TYPE.caption,
                        color: c.error,
                        fontWeight: "700",
                      }}
                    >
                      Tin đăng này không còn trong catalog hiện tại.
                    </Text>
                  )}
                  <View style={styles.row}>
                    {button(
                      "Xem bản lưu lịch sử",
                      () => open(v, true),
                      true,
                    )}
                    {live &&
                      button("Mở bản hiện tại", () => {
                        setHistory(null);
                        open(live, false);
                      })}
                  </View>
                </>,
                v.id,
              );
            })}
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
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  badgeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  titleMediaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardThumb: {
    width: 68,
    height: 52,
    borderRadius: 10,
  },
  detailHeroImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
  },
  priceFocalBlock: {
    gap: 4,
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specChip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: "47%",
    flexGrow: 1,
    gap: 2,
  },
  specTable: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  specTableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
});
