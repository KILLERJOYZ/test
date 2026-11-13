import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  AppState,
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  PRODUCTS,
  OFFERS,
  TASKS,
  PRIORITIES,
  OBSERVED_AT,
  bestOffer,
  fit,
  money,
  total,
} from "./domain";
import type { Product, Offer } from "./domain";
import {
  DATA_VERSION,
  POLICY_VERSION,
  EMPTY_FILTERS,
  EMPTY_NEEDS,
  INITIAL_STORE,
  evaluate,
  restore,
  SCREEN,
  taskChecks,
  updateTasks,
  validateNeeds,
  validOffers,
} from "./picker";
import type { Needs, Filters, Snapshot, Store } from "./picker";
import { createPersistence, createDecisionIds, cloneDraft, confirmNeeds, toggleComparison, filterDraft, requestIsCurrent, reopenDecision, pickerBack, chatOrigin, recoveryBytes } from "./decision-state";
import { explain, interpret, localExplanation, makeAiContext, aiContextCurrent, proposeNeeds } from "./ai";
import type { NeedsPatch } from "./ai";

import { LIGHT, DARK, SHAPE, MOTION } from "./design-tokens";
const Theme = createContext({ c: LIGHT, reduce: false, fontScale: 1 });
const useTheme = () => useContext(Theme);
const KEY = "lua-android-v2";
function Label({ children, style, ...props }: any) {
  const { c, fontScale } = useTheme();
  const resolved = StyleSheet.flatten([
    { color: c.text, fontSize: 15, lineHeight: 23 },
    style,
  ]);
  const size = resolved.fontSize || 15;
  // Apply the OS setting explicitly so Fabric remeasures when it changes at runtime.
  // Native scaling is disabled only to prevent applying the same multiplier twice.
  return (
    <Text
      {...props}
      allowFontScaling={false}
      style={{
        ...resolved,
        fontSize: size * fontScale,
        lineHeight:
          Math.max(resolved.lineHeight || 23, size * 1.25) * fontScale,
      }}
    >
      {children}
    </Text>
  );
}
function Title({ children, small = false }: any) {
  return (
    <Label
      accessibilityRole="header"
      style={{
        fontSize: small ? 22 : 32,
        lineHeight: small ? 29 : 38,
        fontWeight: "800",
        letterSpacing: -0.8,
      }}
    >
      {children}
    </Label>
  );
}
function Caption({ children }: any) {
  const { c } = useTheme();
  return (
    <Label style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
      {children}
    </Label>
  );
}
function Button({
  children,
  onPress,
  secondary = false,
  disabled = false,
  testID,
}: any) {
  const { c, reduce } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (v: number) => {
    if (!reduce)
      Animated.spring(scale, {
        toValue: v,
        useNativeDriver: true,
        ...MOTION,
      }).start();
  };
  return (
    <Animated.View style={{ transform: [{ scale }], alignSelf: "stretch" }}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => animate(0.97)}
        onPressOut={() => animate(1)}
        style={({ pressed }) => ({
          minHeight: 52,
          paddingHorizontal: 22,
          paddingVertical: 13,
          borderRadius: SHAPE.button,
          backgroundColor: secondary ? c.container : c.primary,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <Label
          style={{
            color: secondary ? c.text : c.onPrimary,
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          {children}
        </Label>
      </Pressable>
    </Animated.View>
  );
}
function Chip({
  children,
  selected = false,
  onPress,
  accessibilityLabel,
}: any) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        borderRadius: selected ? SHAPE.selectedChip : SHAPE.chip,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: selected ? c.primary : c.container,
        opacity: pressed ? 0.75 : 1,
        justifyContent: "center",
      })}
    >
      <Label
        style={{
          fontWeight: "600",
          fontSize: 13,
          color: selected ? c.onPrimary : c.text,
        }}
      >
        {selected ? "✓  " : ""}
        {children}
      </Label>
    </Pressable>
  );
}
function Card({ children, tint = false }: any) {
  const { c } = useTheme();
  return (
    <View
      style={{
        backgroundColor: tint ? c.container : c.surface,
        borderRadius: SHAPE.card,
        padding: 20,
        gap: 12,
      }}
    >
      {children}
    </View>
  );
}
function Row({ children }: any) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {children}
    </View>
  );
}
function Field({
  label,
  value,
  onChangeText,
  numeric = false,
  placeholder = "",
  testID,
}: any) {
  const { c, fontScale } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Label style={{ fontWeight: "600" }}>{label}</Label>
      <TextInput
        allowFontScaling={false}
        testID={testID}
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        keyboardType={numeric ? "number-pad" : "default"}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        autoCapitalize="none"
        style={{
          minHeight: 56,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: c.line,
          paddingHorizontal: 16,
          color: c.text,
          fontSize: 16 * fontScale,
          backgroundColor: c.surface,
        }}
      />
    </View>
  );
}
function Art({ p }: { p: Product }) {
  const { c } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`Minh họa cấu hình giả lập ${p.name}`}
      style={{
        height: 132,
        backgroundColor: c.container,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          right: 12,
          top: -20,
          width: 120,
          height: 120,
          borderRadius: 40,
          backgroundColor: c.secondary,
          transform: [{ rotate: "25deg" }],
        }}
      />
      <View
        style={{
          width: 156,
          height: 90,
          borderWidth: 5,
          borderColor: c.primary,
          borderRadius: 10,
          backgroundColor: c.bg,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ rotate: "-5deg" }],
        }}
      >
        <Label style={{ fontSize: 26, fontWeight: "900", color: c.primary }}>
          lựa.
        </Label>
      </View>
      <View
        style={{
          width: 184,
          height: 9,
          borderRadius: 8,
          backgroundColor: c.primary,
          marginTop: 4,
        }}
      />
    </View>
  );
}
function Sheet({ visible, onClose, onBack, title, children }: any) {
  const { c } = useTheme();
  return (
    <Modal
      visible={visible}
      onRequestClose={onBack || onClose}
      animationType="none"
      transparent
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#00000088",
          justifyContent: "flex-end",
        }}
      >
        <View
          accessibilityViewIsModal
          style={{
            maxHeight: "94%",
            backgroundColor: c.bg,
            borderTopLeftRadius: SHAPE.sheet,
            borderTopRightRadius: SHAPE.sheet,
            padding: 20,
            gap: 12,
          }}
        >
          <Row>
            <View style={{ flex: 1 }}>
              <Title small>{title}</Title>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đóng"
              onPress={onClose}
              style={{
                minWidth: 48,
                minHeight: 48,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Label style={{ fontSize: 26 }}>×</Label>
            </Pressable>
          </Row>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 16, paddingBottom: 28 }}
          >
            {children}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function AndroidApp() {
  return (
    <SafeAreaProvider>
      <Demo />
    </SafeAreaProvider>
  );
}
function Demo() {
  const [store, setStore] = useState<Store>(INITIAL_STORE);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [notice, setNotice] = useState("");
  const [rawRecovery, setRawRecovery] = useState("");
  const [tab, setTab] = useState<
    "home" | "search" | "compare" | "saved" | "settings"
  >("home");
  const [sheet, setSheet] = useState<
    "picker" | "detail" | "filters" | "chat" | "sample" | null
  >(null);
  const [draft, setDraft] = useState<Needs>(EMPTY_NEEDS);
  const [step, setStep] = useState(0);
  const [budgetText, setBudgetText] = useState("22000000");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<string[]>([]);
  const [productId, setProductId] = useState("p1");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [explore, setExplore] = useState(false);
  const [sampleOffer, setSampleOffer] = useState<Offer | null>(null);
  const [history, setHistory] = useState<Snapshot | null>(null);
  const [reduce, setReduce] = useState(false);
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [patch, setPatch] = useState<NeedsPatch | null>(null);
  const [aiMode, setAiMode] = useState(
    "Ràng buộc xác định · không có AI trực tiếp",
  );
  const [serviceDraft, setServiceDraft] = useState("");
  const [fault, setFault] = useState<
    "none" | "storage" | "timeout" | "invalid"
  >("none");
  const [editOffer, setEditOffer] = useState("o1");
  const [editPrice, setEditPrice] = useState("18700000");
  const [policyReport, setPolicyReport] = useState("");
  const chatReturn = useRef(chatOrigin(null, "p1", "home"));
  const decisionIds = useRef(createDecisionIds(Date.now));
  const revision = useRef(0);
  const requestId = useRef(0);
  const aiAbort = useRef<AbortController | null>(null);
  useEffect(() => () => aiAbort.current?.abort(), []);
  const persistence = useRef<ReturnType<typeof createPersistence> | null>(null);
  const faultRef = useRef(fault);
  faultRef.current = fault;
  if (!persistence.current) persistence.current = createPersistence(INITIAL_STORE, async next => {
    if (faultRef.current === "storage") throw Error("Mô phỏng lỗi ghi");
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  }, setStore);
  const { width, fontScale } = useWindowDimensions();
  const wide = width >= 700;
  const c = store.dark ? DARK : LIGHT;
  const notify = (s: string) => {
    setNotice(s);
    AccessibilityInfo.announceForAccessibility(s);
  };
  useEffect(() => {
    let active = true;
    AsyncStorage.multiGet([KEY, "lua-demo-v1"])
      .then(async (rows) => {
        const raw = rows[0][1] || rows[1][1];
        if (raw) {
          try {
            const result = restore(raw);
            if (result.warnings.length || JSON.parse(raw).version === 1)
              await AsyncStorage.setItem(`${KEY}-recovery`, raw);
            if (active) {
              persistence.current!.hydrate(result.store, "ready");
              setStore(result.store);
              setServiceDraft(result.store.serviceUrl);
              revision.current = result.store.needs.revision;
              setNotice(result.warnings.join("\n"));
            }
          } catch (e) {
            if (active) {
              persistence.current!.hydrate(INITIAL_STORE, "recovery_required");
              setRawRecovery(raw);
              setStorageError(String(e));
            }
          }
        } else if (active) persistence.current!.hydrate(INITIAL_STORE, "ready");
      })
      .catch((e) => { if (active) { persistence.current!.hydrate(INITIAL_STORE, "read_failed"); setStorageError(String(e)); } })
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduce,
    );
    return () => sub.remove();
  }, []);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (sheet) {
        setSheet(null);
        requestId.current++;
        aiAbort.current?.abort();
        setAiBusy(false);
        return true;
      }
      if (tab !== "home") {
        setTab("home");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [sheet, tab]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") {
        requestId.current++;
        aiAbort.current?.abort();
        setAiBusy(false);
      }
    });
    return () => sub.remove();
  }, []);
  const persist = async (update: (latest: Store) => Store, actionId?: string) => {
    const success = await persistence.current!.mutate(update, actionId);
    if (success) setStorageError("");
    else { setStorageError("Không ghi được dữ liệu hoặc dữ liệu chưa sẵn sàng. Bản trước được giữ."); notify("Lưu thất bại. Vui lòng thử lại hoặc phục hồi dữ liệu."); }
    return success;
  };
  const openPicker = () => {
    setDraft(cloneDraft(store.needs));
    setBudgetText(String(store.needs.budget));
    setStep(0);
    setSheet("picker");
  };
  const applyNeeds = async (p: Needs) => {
    const next = {
      ...p,
      useOrderConfirmed: true,
      revision: revision.current + 1,
    };
    const errors = validateNeeds(next);
    if (errors.length) {
      notify(errors.join("\n"));
      return false;
    }
    if (await persist(latest => confirmNeeds(latest, p), "confirm-" + JSON.stringify(p))) {
      revision.current = persistence.current!.current().needs.revision;
      requestId.current++;
        aiAbort.current?.abort();
      setAiBusy(false);
      setFilters(EMPTY_FILTERS);
      setExpanded(false);
      setExplore(false);
      setHistory(null);
      setTab("home");
      return true;
    }
    return false;
  };
  const results = useMemo(
    () => evaluate(store.needs, filters, store.offers),
    [store.needs, filters, store.offers],
  );
  const product = PRODUCTS.find((p) => p.id === productId)!;
  const detail = (id: string) => {
    setProductId(id);
    setSheet("detail");
  };
  const compareToggle = (id:string) => setSelected(prev => {
    const result=toggleComparison(prev,id);
    if(result.rejected)notify("Bỏ một máy trước khi chọn máy khác.");
    return result.ids;
  });
  const save = async (ids: string[]) => {
    if (validateNeeds(store.needs).length || ids.length < 1 || ids.length > 2 || new Set(ids).size !== ids.length || ids.some(id => !PRODUCTS.some(p => p.id === id))) {
      notify("Xác nhận hồ sơ nhu cầu trước khi lưu quyết định.");
      return;
    }
    const snapshot: Snapshot = {
      id: decisionIds.current(persistence.current!.current().saved.map(d => d.id)),
      name: `Phương án ${store.saved.length + 1}`,
      needs: JSON.parse(JSON.stringify(store.needs)),
      productIds: ids,
      savedAt: new Date().toISOString(),
      datasetVersion: DATA_VERSION,
      policyVersion: POLICY_VERSION,
      observations: ids.map((id) => {
        const o = bestOffer(id, store.offers);
        return {
          productId: id,
          total: o ? total(o) : null,
          seller: o?.seller || null,
        };
      }),
    };
    if (await persist(latest => ({ ...latest, saved: [snapshot, ...latest.saved] }), "save-" + JSON.stringify([ids, store.needs.revision])))
      notify("Đã lưu quyết định trên thiết bị.");
  };
  const share = async (d: Snapshot) => {
    const body = `LỰA · DỮ LIỆU GIẢ LẬP\n${d.name}\n${d.needs.primaryUseOrder.map((id) => TASKS.find((t) => t.id === id)?.name).join(" → ")}\nTrần ${money(d.needs.budget)}\n${d.productIds.map((id) => PRODUCTS.find((p) => p.id === id)?.name).join(" / ")}\n${d.observations.map((o) => `${o.seller}: ${o.total === null ? "Chưa đủ chi phí" : money(o.total)}`).join("\n")}\nLưu ${d.savedAt}; quan sát mẫu ${OBSERVED_AT}. Giá giả, không phải báo giá hiện tại. Giới hạn: ${d.productIds.map((id) => PRODUCTS.find((p) => p.id === id)?.limitation).join(" ")}\n${d.datasetVersion} · ${d.policyVersion}`;
    try {
      await Share.share({ message: body });
    } catch {
      notify("Không chia sẻ được. Vui lòng thử lại.");
    }
  };
  const ask = async (kind: "explain" | "interpret") => {
    const ticket = ++requestId.current;
    const rev = revision.current;
    aiAbort.current?.abort();
    const controller=new AbortController();aiAbort.current=controller;
    const focus=chatReturn.current.sheet==='detail'?[chatReturn.current.productId]:chatReturn.current.tab==='compare'?selected:results.visible.slice(0,2).map(p=>p.id);
    const context=makeAiContext(store.needs,store.offers,String(ticket),focus,chatReturn.current.sheet || chatReturn.current.tab,history?.id || "local-current");
    const current=()=>aiContextCurrent(context,persistence.current!.current().needs,persistence.current!.current().offers,String(requestId.current));
    const options={context,signal:controller.signal};
    setAiBusy(true);
    setPatch(null);
    setAnswer("");
    setAiMode("Đang xử lý");
    try {
      if (fault === "timeout") throw Error("Mô phỏng hết thời gian");
      if (fault === "invalid") throw Error("Mô phỏng phản hồi không hợp lệ");
      if (kind === "interpret") {
        const result = await interpret(store.serviceUrl, message, store.needs, options);
        if (current() && requestIsCurrent(ticket, requestId.current, rev, revision.current)) {
          setPatch(result);
          setAiMode("Đề xuất AI · cần xác nhận");
        }
      } else {
        const result = await explain(
          store.serviceUrl,
          message,
          store.needs,
          store.offers,
          options,
        );
        if (current() && requestIsCurrent(ticket, requestId.current, rev, revision.current)) {
          setAnswer(result.text);
          setAiMode(result.mode);
        }
      }
    } catch (e) {
      if (current() && !controller.signal.aborted) {
        setAnswer(
          localExplanation(store.needs, store.offers, context.focusVariantIds) + "\n\n" + String(e),
        );
        setAiMode("Giải thích xác định · dự phòng");
      }
    } finally {
      if (ticket === requestId.current) setAiBusy(false);
    }
  };
  const taskName = (id: string) => TASKS.find((t) => t.id === id)?.name || id;
  const openChat = () => {
    chatReturn.current = chatOrigin(sheet, productId, tab);
    setAnswer("");
    setPatch(null);
    setSheet("chat");
  };
  const CardProduct = ({
    p,
    exploratory = false,
  }: {
    p: Product;
    exploratory?: boolean;
  }) => {
    const o = bestOffer(p.id, store.offers);
    const failures = fit(p, store.needs, store.offers).reasons;
    return (
      <View style={{ width: wide ? "48%" : "100%" }}>
        <Card>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Chi tiết ${p.name}`}
            onPress={() => detail(p.id)}
          >
            <Art p={p} />
          </Pressable>
          <Row>
            <View style={{ flex: 1 }}>
              <Title small>{p.name}</Title>
              <Caption>
                {p.id.toUpperCase()} · {p.ram} GB / {p.ssd} GB
              </Caption>
            </View>
            <Label style={{ fontSize: 23 }}>↗</Label>
          </Row>
          <Label style={{ fontSize: 24, fontWeight: "800", color: c.primary }}>
            {o ? money(total(o)!) : "Chưa có tổng đủ"}
          </Label>
          <Caption>
            {p.weight} kg · {SCREEN[p.id]} inch ·{" "}
            {o?.seller || "Không có offer đủ điều kiện"}
          </Caption>
          {exploratory ? (
            <Label style={{ color: c.error, fontWeight: "600" }}>
              Đánh đổi · chưa phù hợp{"\n"}
              {failures.join("\n")}
            </Label>
          ) : store.needs.useOrderConfirmed ? (
            <View style={{ gap: 4 }}>
              {taskChecks(p, store.needs).map((t) => (
                <Caption key={t.id}>
                  {t.state === "pass" ? "✓" : t.state === "fail" ? "×" : "?"}{" "}
                  {taskName(t.id)} · {t.reason}
                </Caption>
              ))}
            </View>
          ) : (
            <Caption>Thông tin chung · chưa đánh giá nhu cầu</Caption>
          )}
          <Caption>{p.limitation}</Caption>
          <Caption>Mẫu giả · {OBSERVED_AT}</Caption>
          <Row>
            <Chip
              selected={selected.includes(p.id)}
              accessibilityLabel={`So sánh ${p.name}`}
              onPress={() => compareToggle(p.id)}
            >
              So sánh
            </Chip>
            <Chip
              accessibilityLabel={`Chi tiết ${p.name}`}
              onPress={() => detail(p.id)}
            >
              Chi tiết
            </Chip>
            <Chip
              accessibilityLabel={`Lưu ${p.name}`}
              onPress={() => save([p.id])}
            >
              Lưu
            </Chip>
          </Row>
        </Card>
      </View>
    );
  };
  if (!ready)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: LIGHT.bg,
        }}
      >
        <ActivityIndicator />
        <Text>Đang khôi phục quyết định…</Text>
      </SafeAreaView>
    );
  return (
    <Theme.Provider value={{ c, reduce, fontScale }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
        <StatusBar
          barStyle={store.dark ? "light-content" : "dark-content"}
        />
        <View
          style={{
            paddingHorizontal: 22,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Trang chủ Lựa"
            onPress={() => setTab("home")}
          >
            <Label
              style={{
                fontSize: 30,
                fontWeight: "900",
                letterSpacing: -1,
                color: c.primary,
              }}
            >
              lựa.
            </Label>
          </Pressable>
          <View
            style={{
              backgroundColor: c.secondary,
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Label
              style={{ color: c.onSecondary, fontWeight: "700", fontSize: 11 }}
            >
              DEMO · GIÁ GIẢ
            </Label>
          </View>
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 24,
            gap: 18,
            maxWidth: 1000,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {!!storageError && (
            <Card>
              <Label style={{ color: c.error }}>{storageError}</Label>
              {!!rawRecovery && (
                <Button
                  secondary
                  onPress={() => Share.share({ message: rawRecovery })}
                >
                  Xuất dữ liệu gốc để phục hồi
                </Button>
              )}
            </Card>
          )}
          {tab === "home" && (
            <>
              <View
                style={{
                  backgroundColor: c.primary,
                  borderRadius: SHAPE.hero,
                  padding: 26,
                  gap: 18,
                  overflow: "hidden",
                }}
              >
                <Label
                  style={{
                    color: c.onPrimary,
                    fontSize: 12,
                    fontWeight: "600",
                    letterSpacing: 2,
                  }}
                >
                  CHỌN CÓ CƠ SỞ
                </Label>
                <Label
                  accessibilityRole="header"
                  style={{
                    fontSize: 38,
                    lineHeight: 43,
                    fontWeight: "800",
                    letterSpacing: -1.4,
                    color: c.onPrimary,
                  }}
                >
                  Máy hợp việc.{"\n"}Giá rõ ràng.
                </Label>
                <Label style={{ color: c.onPrimary }}>
                  Từ điều bạn cần làm đến một lựa chọn bạn hiểu.
                </Label>
                <Pressable
                  accessibilityRole="button"
                  testID="start-picker"
                  onPress={openPicker}
                  style={{
                    minHeight: 56,
                    borderRadius: 22,
                    padding: 17,
                    backgroundColor: c.secondary,
                    alignSelf: "flex-start",
                  }}
                >
                  <Label style={{ fontWeight: "800", color: c.onSecondary }}>
                    Tìm máy cho tôi ↗
                  </Label>
                </Pressable>
                <Label style={{ fontSize: 12, color: c.onPrimary }}>
                  Không cần tài khoản · 12 cấu hình giả lập
                </Label>
              </View>
              {history && (
                <Card>
                  <Title small>Bản quyết định lịch sử</Title>
                  <Caption>
                    {history.savedAt} · {history.datasetVersion}
                  </Caption>
                  {history.observations.map((o) => (
                    <Label key={o.productId}>
                      {PRODUCTS.find((p) => p.id === o.productId)?.name}:{" "}
                      {o.total === null ? "Chưa đủ giá" : money(o.total)}
                    </Label>
                  ))}
                  <Label>
                    Giá khi lưu được giữ nguyên. Danh sách phía dưới được tính
                    lại từ bộ mẫu hiện tại.
                  </Label>
                </Card>
              )}
              <Row>
                <View style={{ flex: 1 }}>
                  <Title small>
                    {store.needs.useOrderConfirmed
                      ? "Dành cho việc của bạn"
                      : "Bắt đầu từ nhu cầu"}
                  </Title>
                  <Caption>
                    {store.needs.useOrderConfirmed
                      ? `${store.needs.primaryUseOrder.map(taskName).join(" → ")} · ${money(store.needs.budget)}`
                      : "Chọn mục đích, ngân sách và điều không thể thiếu."}
                  </Caption>
                </View>
                {store.needs.useOrderConfirmed && (
                  <Chip onPress={openPicker}>Sửa</Chip>
                )}
              </Row>
              {store.needs.useOrderConfirmed ? (
                <>
                  <Row>
                    <Chip
                      onPress={() => {
                        setDraftFilters({ ...filters });
                        setSheet("filters");
                      }}
                    >
                      Bộ lọc
                      {filters.maxWeight ||
                      filters.screenMin ||
                      filters.screenMax
                        ? " · đang bật"
                        : ""}
                    </Chip>
                    <Chip
                      onPress={() => {
                        setFilters(EMPTY_FILTERS);
                        setExplore(false);
                      }}
                    >
                      Xóa bộ lọc
                    </Chip>
                    <Chip onPress={openChat}>Hỏi thêm ✦</Chip>
                  </Row>
                  {results.state === "eligible" ? (
                    <>
                      <Caption>
                        {results.visible.length} cấu hình đạt điều kiện mẫu ·
                        không phải đánh giá phần cứng thực tế
                      </Caption>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 14,
                        }}
                      >
                        {results.visible
                          .slice(0, expanded ? 12 : 3)
                          .map((p) => (
                            <CardProduct key={p.id} p={p} />
                          ))}
                      </View>
                      {results.visible.length > 3 && !expanded && (
                        <Button secondary onPress={() => setExpanded(true)}>
                          Xem thêm {results.visible.length - 3} máy
                        </Button>
                      )}
                    </>
                  ) : (
                    <Card>
                      <Title small>
                        {results.state === "filterEmpty"
                          ? "Bộ lọc đang ẩn mọi kết quả"
                          : results.state === "needsClarification"
                            ? "Cần làm rõ nhu cầu"
                            : "Chưa có máy đáp ứng"}
                      </Title>
                      <Label>
                        {results.state === "filterEmpty"
                          ? "Các máy vẫn đạt nhu cầu bắt buộc. Hãy xóa bộ lọc màn hình/trọng lượng."
                          : results.errors.join("\n") ||
                            "Không cấu hình nào đạt tất cả tác vụ, tổng giá và trần đã xác nhận. Trần ngân sách vẫn được giữ nguyên."}
                      </Label>
                      <Button
                        secondary
                        onPress={
                          results.state === "filterEmpty"
                            ? () => setFilters(EMPTY_FILTERS)
                            : openPicker
                        }
                      >
                        {results.state === "filterEmpty"
                          ? "Chỉ xóa bộ lọc"
                          : "Sửa hồ sơ"}
                      </Button>
                    </Card>
                  )}
                  <Button secondary onPress={() => setExplore((v) => !v)}>
                    {explore
                      ? "Ẩn phương án đánh đổi"
                      : "Tự xem phương án đánh đổi"}
                  </Button>
                  {explore && (
                    <>
                      <Label style={{ color: c.error, fontWeight: "700" }}>
                        ĐÁNH ĐỔI · KHÔNG THUỘC SHORTLIST
                      </Label>
                      {PRODUCTS.filter(
                        (p) => !fit(p, store.needs, store.offers).eligible,
                      )
                        .slice(0, 4)
                        .map((p) => (
                          <CardProduct key={p.id} p={p} exploratory />
                        ))}
                      <Button secondary onPress={openPicker}>
                        Tôi muốn sửa yêu cầu · xem và xác nhận
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <Card>
                  <Label>
                    Bạn cũng có thể tìm tên máy và xem thông tin chung ngay.
                  </Label>
                  <Button secondary onPress={() => setTab("search")}>
                    Khám phá danh mục mẫu
                  </Button>
                </Card>
              )}
              <Caption>
                {DATA_VERSION} · {POLICY_VERSION}
                {"\n"}Dữ liệu và quy tắc năng lực đều mô phỏng. Không phải tư
                vấn mua máy thực tế.
              </Caption>
            </>
          )}
          {tab === "search" && (
            <>
              <Title>Khám phá.</Title>
              <Caption>Tra cứu trực tiếp · không bắt buộc khảo sát</Caption>
              <Field
                label="Tìm cấu hình"
                value={query}
                onChangeText={setQuery}
                placeholder="Tên máy, RAM hoặc SSD…"
              />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
                {PRODUCTS.filter((p) =>
                  `${p.name} ${p.ram} ${p.ssd}`
                    .toLocaleLowerCase("vi")
                    .includes(query.toLocaleLowerCase("vi")),
                ).map((p) => (
                  <CardProduct key={p.id} p={p} />
                ))}
              </View>
              {!PRODUCTS.some((p) =>
                `${p.name} ${p.ram} ${p.ssd}`
                  .toLocaleLowerCase("vi")
                  .includes(query.toLocaleLowerCase("vi")),
              ) && (
                <Card>
                  <Label>
                    Không có cấu hình khớp từ khóa. Từ khóa của bạn được giữ
                    lại.
                  </Label>
                </Card>
              )}
            </>
          )}
          {tab === "compare" && (
            <>
              <Title>Đặt cạnh nhau.</Title>
              <Caption>Đúng cấu hình · cùng tiêu chí · tối đa hai máy</Caption>
              {!selected.length && (
                <Card>
                  <Label>Chọn “So sánh” trên thẻ máy để bắt đầu.</Label>
                  <Button onPress={() => setTab("search")}>
                    Chọn cấu hình
                  </Button>
                </Card>
              )}
              <View style={{ flexDirection: "row", gap: 12 }}>
                {selected.map((id) => {
                  const p = PRODUCTS.find((p) => p.id === id)!;
                  const o = bestOffer(id, store.offers);
                  const f = fit(p, store.needs, store.offers);
                  return (
                    <View key={id} style={{ flex: 1 }}>
                      <Card>
                        <Title small>{p.name}</Title>
                        <Caption>
                          {p.id} · {p.ram} GB / {p.ssd} GB
                        </Caption>
                        <Label
                          style={{
                            fontSize: 19,
                            fontWeight: "800",
                            color: c.primary,
                          }}
                        >
                          {o ? money(total(o)!) : "Chưa đủ giá"}
                        </Label>
                        <Label>
                          {SCREEN[id]} inch{"\n"}
                          {p.weight} kg{"\n"}
                          {p.upgrade ? "Có nâng cấp mẫu" : "RAM cố định"}
                        </Label>
                        <Label
                          style={{
                            color: !store.needs.useOrderConfirmed
                              ? c.muted
                              : f.eligible
                                ? c.success
                                : c.error,
                          }}
                        >
                          {!store.needs.useOrderConfirmed
                            ? "Chưa có hồ sơ"
                            : f.eligible
                              ? "✓ Đạt quy tắc mẫu"
                              : f.reasons.join("\n")}
                        </Label>
                        <Caption>{p.limitation}</Caption>
                        <Button secondary onPress={() => detail(id)}>
                          Chi tiết
                        </Button>
                        <Button secondary onPress={() => compareToggle(id)}>
                          Bỏ máy này
                        </Button>
                      </Card>
                    </View>
                  );
                })}
              </View>
              {selected.length > 0 && (
                <>
                  <Button onPress={() => save(selected)}>
                    Lưu phương án so sánh
                  </Button>
                  <Button secondary onPress={() => setTab("search")}>
                    Thêm / thay cấu hình
                  </Button>
                </>
              )}
            </>
          )}
          {tab === "saved" && (
            <>
              <Title>Để dành quyết định.</Title>
              <Caption>Lưu trên thiết bị · giá có mốc thời gian</Caption>
              {!store.saved.length && (
                <Card>
                  <Label>
                    Chưa có phương án đã lưu. Hãy xác nhận nhu cầu rồi lưu một
                    cấu hình.
                  </Label>
                  <Button onPress={openPicker}>Bắt đầu chọn máy</Button>
                </Card>
              )}
              {store.saved.map((d) => (
                <Card key={d.id}>
                  <Title small>{d.name}</Title>
                  <Caption>
                    {new Date(d.savedAt).toLocaleString("vi-VN")} ·{" "}
                    {d.datasetVersion}
                  </Caption>
                  <Label>
                    {d.productIds
                      .map((id) => PRODUCTS.find((p) => p.id === id)?.name)
                      .join(" / ")}
                  </Label>
                  <Caption>
                    {d.needs.primaryUseOrder.map(taskName).join(" → ")} ·{" "}
                    {money(d.needs.budget)}
                    {!d.needs.useOrderConfirmed
                      ? " · Thứ tự cũ chưa xác nhận"
                      : ""}
                  </Caption>
                  {d.observations.map((o) => (
                    <Label key={o.productId}>
                      {o.seller || "Chưa có nơi bán"} ·{" "}
                      {o.total === null ? "Chưa đủ tổng" : money(o.total)}{" "}
                      <Caption>lúc lưu</Caption>
                    </Label>
                  ))}
                  <Row>
                    <Chip
                      onPress={async () => {
                        if (await persist(latest => reopenDecision(latest, d))) {
                          revision.current = d.needs.revision;
                          setSelected(d.productIds.slice(0, 2));
                          setFilters(EMPTY_FILTERS);
                          setHistory(d);
                          setTab("home");
                          requestId.current++;
        aiAbort.current?.abort();
                        }
                      }}
                    >
                      Mở lại
                    </Chip>
                    <Chip onPress={() => share(d)}>Chia sẻ</Chip>
                    <Chip
                      onPress={async () => {
                        if (
                          await persist(latest => ({
                            ...latest,
                            saved: latest.saved.filter((x) => x.id !== d.id),
                          }))
                        )
                          notify("Đã xóa phương án.");
                      }}
                    >
                      Xóa
                    </Chip>
                  </Row>
                </Card>
              ))}
            </>
          )}
          {tab === "settings" && (
            <>
              <Title>Theo cách của bạn.</Title>
              <Card>
                <Title small>Giao diện & dữ liệu</Title>
                <Row>
                  <Chip
                    selected={!store.dark}
                    onPress={() => persist(latest => ({ ...latest, dark: false }))}
                  >
                    Sáng
                  </Chip>
                  <Chip
                    selected={store.dark}
                    onPress={() => persist(latest => ({ ...latest, dark: true }))}
                  >
                    Tối
                  </Chip>
                </Row>
                <Caption>
                  Material 3 Expressive · hệ màu dự phòng riêng · chưa tích hợp
                  màu động theo thiết bị. Chuyển động theo cài đặt trợ năng
                  Android. Quyền thông báo/vị trí không cần cho demo.
                </Caption>
                <Button
                  secondary
                  onPress={async () => {
                    try {
                      await Share.share({
                        message: JSON.stringify(store, null, 2),
                      });
                    } catch {
                      notify("Không xuất được dữ liệu.");
                    }
                  }}
                >
                  Xuất dữ liệu cục bộ
                </Button>
                <Button
                  secondary
                  onPress={() => persist(latest => ({ ...latest, saved: [] }))}
                >
                  Xóa mọi phương án đã lưu
                </Button>
                <Button
                  secondary
                  onPress={async () => {
                    if (fault === "storage") {
                      notify("Tắt mô phỏng lỗi ghi trước khi đặt lại.");
                      return;
                    }
                    try {
                      const reset = await persistence.current!.mutate(() => INITIAL_STORE, "reset", async latest => {
                      await AsyncStorage.setItem(
                        `${KEY}-recovery`,
                        rawRecovery || JSON.stringify(latest),
                      );
                      await AsyncStorage.removeItem("lua-demo-v1");
                      await AsyncStorage.setItem(KEY, JSON.stringify(INITIAL_STORE));
                      }, true);
                      if (!reset) throw Error("Reset failed");
                      setRawRecovery("");
                      setStorageError("");
                      setStore(INITIAL_STORE);
                      setSelected([]);
                      revision.current = 0;
                      setServiceDraft("");
                      setHistory(null);
                      setFilters(EMPTY_FILTERS);
                      requestId.current++;
        aiAbort.current?.abort();
                      notify(
                        "Đã đặt lại demo. Bản trước có trong bản sao phục hồi.",
                      );
                    } catch {
                      notify("Đặt lại thất bại. Dữ liệu trước được giữ.");
                    }
                  }}
                >
                  Đặt lại kịch bản demo
                </Button>
                <Button
                  secondary
                  onPress={async () => {
                    try {
                      const backup = rawRecovery ? null : await AsyncStorage.getItem(
                        `${KEY}-recovery`,
                      );
                      const recovery = recoveryBytes(rawRecovery, backup);
                      if (recovery) await Share.share({ message: recovery });
                      else notify("Chưa có bản phục hồi.");
                    } catch {
                      notify("Không xuất được bản phục hồi.");
                    }
                  }}
                >
                  Xuất bản phục hồi
                </Button>
                <Button
                  secondary
                  onPress={async () => {
                    try {
                      const deleted = await persistence.current!.mutate(() => INITIAL_STORE, "delete-all", async () => {
                      await AsyncStorage.multiRemove([
                        KEY,
                        `${KEY}-recovery`,
                        "lua-demo-v1",
                      ]);
                      }, true);
                      if (!deleted) throw Error("Delete failed");
                      setStore(INITIAL_STORE);
                      setRawRecovery("");
                      setStorageError("");
                      setSelected([]);
                      setHistory(null);
                      revision.current = 0;
                      requestId.current++;
        aiAbort.current?.abort();
                      notify("Đã xóa dữ liệu ứng dụng, gồm bản phục hồi.");
                    } catch {
                      notify("Xóa dữ liệu chưa hoàn tất.");
                    }
                  }}
                >
                  Xóa toàn bộ dữ liệu ứng dụng
                </Button>
              </Card>
              <Card>
                <Title small>AI có giới hạn</Title>
                <Label>
                  Chỉ khi bạn nhấn gửi, hồ sơ và nội dung câu hỏi liên quan mới
                  được chuyển tới dịch vụ đã cấu hình. Khóa API luôn ở máy chủ.
                  Duyệt và tính kết quả hoạt động khi không có AI.
                </Label>
                <Field
                  label="Địa chỉ dịch vụ demo"
                  value={serviceDraft}
                  onChangeText={setServiceDraft}
                  placeholder="http://10.0.2.2:8787"
                />
                <Button
                  secondary
                  onPress={() => {
                    if (serviceDraft && !/^https?:\/\//.test(serviceDraft)) {
                      notify("Nhập URL http(s) hợp lệ.");
                      return;
                    }
                    persist(latest => ({
                      ...latest,
                      serviceUrl: serviceDraft.replace(/\/$/, ""),
                    }));
                  }}
                >
                  Lưu địa chỉ dịch vụ
                </Button>
                <Button onPress={openChat}>Mở trợ lý theo ngữ cảnh</Button>
              </Card>
              <Card>
                <Title small>Xưởng dữ liệu mẫu</Title>
                <Caption>
                  Chỉnh dữ liệu cục bộ; không phải cổng quản trị sản xuất. Tổng
                  giá và nguồn không thể bị AI thay đổi.
                </Caption>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Row>
                    {store.offers.map((o) => (
                      <Chip
                        key={o.id}
                        selected={editOffer === o.id}
                        onPress={() => {
                          setEditOffer(o.id);
                          setEditPrice(String(o.base));
                        }}
                      >
                        {o.id}
                      </Chip>
                    ))}
                  </Row>
                </ScrollView>
                <Field
                  label={`Giá gốc mẫu ${editOffer}`}
                  value={editPrice}
                  onChangeText={setEditPrice}
                  numeric
                />
                <Button
                  secondary
                  onPress={async () => {
                    const offers = store.offers.map((o) =>
                      o.id === editOffer
                        ? { ...o, base: Number(editPrice) }
                        : o,
                    );
                    if (!validOffers(offers)) {
                      notify("Giá không hợp lệ; chính sách chưa được áp dụng.");
                      return;
                    }
                    if (await persist(latest => ({ ...latest, offers })))
                      notify("Đã kiểm tra và cập nhật bộ giá mẫu.");
                  }}
                >
                  Kiểm tra & áp dụng giá
                </Button>
                <Button
                  secondary
                  onPress={() => persist(latest => ({ ...latest, offers: OFFERS }))}
                >
                  Khôi phục bộ giá đã duyệt
                </Button>
                <Button
                  secondary
                  onPress={() => {
                    const candidate = OFFERS.map((o) => ({ ...o, base: -1 }));
                    setPolicyReport(
                      validOffers(candidate)
                        ? "Lỗi: không được phát hành"
                        : "ĐÃ CHẶN · giá âm vi phạm ràng buộc. Bản đang dùng được giữ nguyên. " +
                            POLICY_VERSION,
                    );
                  }}
                >
                  Mô phỏng chính sách sai · A06/A07
                </Button>
                {!!policyReport && <Label>{policyReport}</Label>}
              </Card>
              <Card>
                <Title small>Kiểm tra lỗi & dự phòng</Title>
                <Row>
                  {(["none", "storage", "timeout", "invalid"] as const).map(
                    (f) => (
                      <Chip
                        key={f}
                        selected={fault === f}
                        onPress={() => setFault(f)}
                      >
                        {
                          {
                            none: "Bình thường",
                            storage: "Lỗi ghi",
                            timeout: "AI hết giờ",
                            invalid: "AI sai dữ liệu",
                          }[f]
                        }
                      </Chip>
                    ),
                  )}
                </Row>
                <Caption>
                  Đây là lỗi mô phỏng có nhãn. AI trực tiếp chỉ được ghi nhận
                  khi máy chủ thật trả kết quả đã kiểm tra.
                </Caption>
                <Label>
                  {DATA_VERSION}
                  {"\n"}
                  {POLICY_VERSION}
                  {"\n"}12 cấu hình · 18 offer · 3 người bán giả
                </Label>
              </Card>
            </>
          )}
        </ScrollView>
        {!!notice && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng thông báo"
            onPress={() => setNotice("")}
          >
            <View
              style={{
                padding: 14,
                borderRadius: 18,
                backgroundColor: c.container,
              }}
            >
              <Label accessibilityLiveRegion="polite">{notice} ×</Label>
            </View>
          </Pressable>
        )}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: c.container,
            paddingHorizontal: 8,
            paddingVertical: 8,
            gap: 2,
          }}
        >
          {(
            [
              { id: "home", icon: "⌂", name: "Cho bạn" },
              { id: "search", icon: "⌕", name: "Khám phá" },
              {
                id: "compare",
                icon: "⇄",
                name: `So sánh${selected.length ? " " + selected.length : ""}`,
              },
              { id: "saved", icon: "◇", name: "Đã lưu" },
              { id: "settings", icon: "☷", name: "Cài đặt" },
            ] as const
          ).map((t) => (
            <Pressable
              key={t.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === t.id }}
              onPress={() => {
                setTab(t.id);
                setNotice("");
              }}
              style={{
                flex: 1,
                minHeight: 58,
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                borderRadius: 24,
                backgroundColor: tab === t.id ? c.secondary : "transparent",
              }}
            >
              <Label
                style={{
                  fontSize: 23,
                  color: tab === t.id ? c.onSecondary : c.text,
                }}
              >
                {t.icon}
              </Label>
              <Label
                style={{
                  fontSize: 10,
                  fontWeight: tab === t.id ? "800" : "500",
                  color: tab === t.id ? c.onSecondary : c.text,
                }}
              >
                {t.name}
              </Label>
            </Pressable>
          ))}
        </View>

        <Sheet
          visible={sheet === "picker"}
          title={
            ["Việc gì quan trọng?", "Trần rõ, ưu tiên rõ.", "Đúng ý bạn chưa?"][
              step
            ]
          }
          onClose={() => setSheet(null)}
          onBack={() => { const back=pickerBack(step); back===null ? setSheet(null) : setStep(back); }}
        >
          <Caption>
            BƯỚC {step + 1}/3 · {draft.primaryUseOrder.length}/3 mục đích chính
          </Caption>
          {step === 0 && (
            <>
              <Label>
                Chạm để chọn 1–3 mục đích chính. Thứ tự ảnh hưởng xếp hạng sau
                khi mọi yêu cầu bắt buộc đã đạt.
              </Label>
              {TASKS.map((t) => {
                const index = draft.primaryUseOrder.indexOf(t.id);
                return (
                  <Card key={t.id}>
                    <Row>
                      <View style={{ flex: 1 }}>
                        <Label style={{ fontWeight: "700" }}>
                          {index >= 0 ? `${index + 1}. ` : ""}
                          {t.name}
                        </Label>
                        <Caption>{t.detail}</Caption>
                      </View>
                      <Chip
                        selected={index >= 0}
                        onPress={() => {
                          if (index < 0 && draft.primaryUseOrder.length >= 3) {
                            notify(
                              "Tối đa 3 mục đích chính; dùng tác vụ bổ sung cho mục còn lại.",
                            );
                            return;
                          }
                          setDraft(
                            updateTasks(
                              draft,
                              index >= 0
                                ? draft.primaryUseOrder.filter(
                                    (id) => id !== t.id,
                                  )
                                : [...draft.primaryUseOrder, t.id],
                              draft.additionalRequiredTaskIds.filter(
                                (id) => id !== t.id,
                              ),
                            ),
                          );
                        }}
                      >
                        {index >= 0 ? "Bỏ" : "Chọn"}
                      </Chip>
                    </Row>
                    {index >= 0 && (
                      <Row>
                        <Chip
                          onPress={() => {
                            if (index === 0) return;
                            const order = [...draft.primaryUseOrder];
                            [order[index - 1], order[index]] = [
                              order[index],
                              order[index - 1],
                            ];
                            setDraft(
                              updateTasks(
                                draft,
                                order,
                                draft.additionalRequiredTaskIds,
                              ),
                            );
                          }}
                        >
                          ↑ Sớm hơn
                        </Chip>
                        <Chip
                          onPress={() => {
                            if (index === draft.primaryUseOrder.length - 1)
                              return;
                            const order = [...draft.primaryUseOrder];
                            [order[index + 1], order[index]] = [
                              order[index],
                              order[index + 1],
                            ];
                            setDraft(
                              updateTasks(
                                draft,
                                order,
                                draft.additionalRequiredTaskIds,
                              ),
                            );
                          }}
                        >
                          ↓ Muộn hơn
                        </Chip>
                      </Row>
                    )}
                  </Card>
                );
              })}
              <Title small>Tác vụ bắt buộc bổ sung</Title>
              <Row>
                {TASKS.filter((t) => !draft.primaryUseOrder.includes(t.id)).map(
                  (t) => (
                    <Chip
                      key={t.id}
                      selected={draft.additionalRequiredTaskIds.includes(t.id)}
                      onPress={() =>
                        setDraft(
                          updateTasks(
                            draft,
                            draft.primaryUseOrder,
                            draft.additionalRequiredTaskIds.includes(t.id)
                              ? draft.additionalRequiredTaskIds.filter(
                                  (id) => id !== t.id,
                                )
                              : [...draft.additionalRequiredTaskIds, t.id],
                          ),
                        )
                      }
                    >
                      {t.name}
                    </Chip>
                  ),
                )}
              </Row>
              <Button
                disabled={!draft.primaryUseOrder.length}
                onPress={() => setStep(1)}
              >
                Tiếp tục
              </Button>
            </>
          )}
          {step === 1 && (
            <>
              <Field
                label="Tổng ngân sách tối đa · VND"
                value={budgetText}
                onChangeText={(v: string) => {
                  const digits = v.replace(/[^0-9]/g, "");
                  setBudgetText(digits);
                  setDraft({
                    ...draft,
                    budget: Number(digits),
                    useOrderConfirmed: false,
                  });
                }}
                numeric
                testID="budget-input"
              />
              <Caption>
                Bao gồm máy và phí giao bắt buộc. Không tự nâng trần khi đổi tác
                vụ.
              </Caption>
              <Row>
                {[15000000, 22000000, 30000000].map((n) => (
                  <Chip
                    key={n}
                    selected={draft.budget === n}
                    onPress={() => {
                      setDraft({
                        ...draft,
                        budget: n,
                        useOrderConfirmed: false,
                      });
                      setBudgetText(String(n));
                    }}
                  >
                    {money(n)}
                  </Chip>
                ))}
              </Row>
              {draft.tasks.includes("vm") && (
                <Card>
                  <Title small>Quy mô máy ảo?</Title>
                  <Row>
                    {(
                      [
                        { id: "one", label: "Một máy nhẹ" },
                        { id: "many", label: "Nhiều máy" },
                        { id: "unknown", label: "Chưa rõ" },
                      ] as const
                    ).map((v) => (
                      <Chip
                        key={v.id}
                        selected={draft.vm === v.id}
                        onPress={() => setDraft({ ...draft, vm: v.id })}
                      >
                        {v.label}
                      </Chip>
                    ))}
                  </Row>
                  <Caption>
                    Đây là kịch bản năng lực mô phỏng, không phải yêu cầu nhà
                    cung cấp ứng dụng.
                  </Caption>
                </Card>
              )}
              <Title small>Tối đa hai ưu tiên mềm</Title>
              <Row>
                {PRIORITIES.map((t) => (
                  <Chip
                    key={t.id}
                    selected={draft.priorities.includes(t.id)}
                    onPress={() => {
                      const next = draft.priorities.includes(t.id)
                        ? draft.priorities.filter((id) => id !== t.id)
                        : [...draft.priorities, t.id];
                      if (next.length <= 2)
                        setDraft({ ...draft, priorities: next });
                    }}
                  >
                    {t.name}
                  </Chip>
                ))}
              </Row>
              <Button onPress={() => setStep(2)}>
                Xem hồ sơ trước khi xác nhận
              </Button>
              <Button secondary onPress={() => setStep(0)}>
                Quay lại · giữ câu trả lời
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Card tint>
                <Caption>THỨ TỰ QUAN TRỌNG</Caption>
                {draft.primaryUseOrder.map((id, i) => (
                  <Label key={id} style={{ fontWeight: "700" }}>
                    {i + 1}. {taskName(id)}
                  </Label>
                ))}
                <Label>
                  Bắt buộc bổ sung:{" "}
                  {draft.additionalRequiredTaskIds.map(taskName).join(", ") ||
                    "Không có"}
                </Label>
                <Title small>
                  {Number.isSafeInteger(draft.budget)
                    ? money(draft.budget)
                    : "Ngân sách không hợp lệ"}
                </Title>
                <Caption>Trần tổng chi · máy + phí bắt buộc</Caption>
                <Label>
                  Máy ảo:{" "}
                  {draft.tasks.includes("vm")
                    ? {
                        one: "Một máy nhẹ",
                        many: "Nhiều máy",
                        unknown: "Chưa rõ",
                      }[draft.vm]
                    : "Không áp dụng"}
                </Label>
                <Caption>
                  Ưu tiên mềm:{" "}
                  {draft.priorities
                    .map((id) => PRIORITIES.find((t) => t.id === id)?.name)
                    .join(", ") || "Không có"}
                </Caption>
              </Card>
              {validateNeeds({ ...draft, useOrderConfirmed: true }).map(
                (e, i) => (
                  <Label key={i} style={{ color: c.error }}>
                    {e}
                  </Label>
                ),
              )}
              <Button
                testID="confirm-profile"
                disabled={
                  validateNeeds({ ...draft, useOrderConfirmed: true }).length >
                  0
                }
                onPress={async () => {
                  if (await applyNeeds(draft)) setSheet(null);
                }}
              >
                Xác nhận & tìm cấu hình
              </Button>
              <Button secondary onPress={() => setStep(1)}>
                Chỉnh lại thông tin
              </Button>
            </>
          )}
        </Sheet>
        <Sheet
          visible={sheet === "filters"}
          title="Tinh chỉnh kết quả"
          onClose={() => setSheet(null)}
        >
          <Caption>
            Bộ lọc không thay đổi nhu cầu hoặc xóa lựa chọn so sánh.
          </Caption>
          <Label>Màn hình tối thiểu</Label>
          <Row>
            {[null, 14, 15, 16].map((n) => (
              <Chip
                key={String(n)}
                selected={draftFilters.screenMin === n}
                onPress={() =>
                  setDraftFilters({ ...draftFilters, screenMin: n })
                }
              >
                {n === null ? "Bất kỳ" : `${n} inch`}
              </Chip>
            ))}
          </Row>
          <Label>Màn hình tối đa</Label>
          <Row>
            {[null, 14, 15, 16].map((n) => (
              <Chip
                key={String(n)}
                selected={draftFilters.screenMax === n}
                onPress={() =>
                  setDraftFilters({ ...draftFilters, screenMax: n })
                }
              >
                {n === null ? "Bất kỳ" : `${n} inch`}
              </Chip>
            ))}
          </Row>
          <Label>Trọng lượng tối đa</Label>
          <Row>
            {[null, 1, 1.4, 1.6, 2].map((n) => (
              <Chip
                key={String(n)}
                selected={draftFilters.maxWeight === n}
                onPress={() =>
                  setDraftFilters({ ...draftFilters, maxWeight: n })
                }
              >
                {n === null ? "Bất kỳ" : `${n} kg`}
              </Chip>
            ))}
          </Row>
          <Label>Sắp xếp</Label>
          <Row>
            {(["fit", "price", "weight"] as const).map((s) => (
              <Chip
                key={s}
                selected={draftFilters.sort === s}
                onPress={() => setDraftFilters({ ...draftFilters, sort: s })}
              >
                {
                  {
                    fit: "Theo ưu tiên",
                    price: "Tổng giá",
                    weight: "Nhẹ trước",
                  }[s]
                }
              </Chip>
            ))}
          </Row>
          <Button
            onPress={() => {
              setFilters(draftFilters);
              setSheet(null);
            }}
          >
            Áp dụng bộ lọc
          </Button>
          <Button secondary onPress={() => setSheet(null)}>
            Hủy · bỏ thay đổi nháp
          </Button>
        </Sheet>
        <Sheet
          visible={sheet === "detail"}
          title={product.name}
          onClose={() => setSheet(null)}
        >
          <Art p={product} />
          <Row>
            {PRODUCTS.filter(
              (p) =>
                p.id === product.id ||
                ((p.id === "p1" || p.id === "p4") &&
                  (product.id === "p1" || product.id === "p4")),
            ).map((p) => (
              <Chip
                key={p.id}
                selected={p.id === product.id}
                onPress={() => setProductId(p.id)}
              >
                {p.ram} GB / {p.ssd} GB
              </Chip>
            ))}
          </Row>
          <Card>
            <Title small>Cấu hình {product.id.toUpperCase()}</Title>
            <Label>
              {product.ram} GB RAM · {product.ssd} GB SSD{"\n"}
              {SCREEN[product.id]} inch · {product.weight} kg
            </Label>
            <Label>{product.subtitle}</Label>
            <Label style={{ color: c.muted }}>{product.limitation}</Label>
            {store.needs.useOrderConfirmed ? (
              taskChecks(product, store.needs).map((t) => (
                <View key={t.id}>
                  <Label
                    style={{ color: t.state === "pass" ? c.success : c.error }}
                  >
                    {t.state === "pass" ? "✓" : t.state === "fail" ? "×" : "?"}{" "}
                    {taskName(t.id)} · {t.reason}
                  </Label>
                  <Caption>Nguồn mô phỏng: {t.factId}</Caption>
                </View>
              ))
            ) : (
              <Caption>Chưa có hồ sơ · chỉ hiển thị thông tin chung.</Caption>
            )}
          </Card>
          <Card>
            <Title small>Nguồn & giới hạn</Title>
            <Label>
              {DATA_VERSION} · {OBSERVED_AT}
            </Label>
            <Caption>
              Tất cả tên, cấu hình, giá, người bán và quy tắc tác vụ là dữ liệu
              giả lập. Không có số đo hiệu năng thực tế. Mức đáp ứng không phải
              cam kết cho ứng dụng thực.
            </Caption>
          </Card>
          <Title small>Nơi mua · đề nghị mẫu</Title>
          {store.offers
            .filter((o) => o.productId === product.id)
            .map((o) => (
              <Card key={o.id}>
                <Row>
                  <View style={{ flex: 1 }}>
                    <Label style={{ fontWeight: "800" }}>{o.seller}</Label>
                    <Caption>
                      {o.id} ·{" "}
                      {o.status === "current"
                        ? "Còn hiệu lực theo đồng hồ mẫu"
                        : o.status === "expired"
                          ? "Đã hết hạn"
                          : "Hết hàng"}
                    </Caption>
                  </View>
                  <Label
                    style={{
                      fontWeight: "800",
                      fontSize: 19,
                      color: c.primary,
                    }}
                  >
                    {total(o) === null ? "Chưa đủ tổng" : money(total(o)!)}
                  </Label>
                </Row>
                <Label>
                  Giá máy: {money(o.base)}
                  {"\n"}Giao hàng:{" "}
                  {o.shipping === null ? "Chưa rõ" : money(o.shipping)}
                  {"\n"}Phí bắt buộc: {money(o.fee)}
                </Label>
                {o.coupon > 0 && (
                  <Label style={{ color: c.error }}>
                    Ưu đãi có điều kiện: {money(o.coupon)} ·{" "}
                    {o.eligible
                      ? "đã xác nhận trong dữ liệu mẫu"
                      : "chưa được trừ khỏi tổng"}
                  </Label>
                )}
                <Caption>
                  Không có chính sách bảo hành/đổi trả thật. Giá quan sát:{" "}
                  {OBSERVED_AT}. Tổng chưa đủ không được gắn nhãn rẻ nhất.
                </Caption>
                <Button
                  secondary
                  disabled={o.status !== "current"}
                  onPress={() => {
                    setSampleOffer(o);
                    setSheet("sample");
                  }}
                >
                  Xem tóm tắt offer mẫu
                </Button>
              </Card>
            ))}
          <Row>
            <Chip
              selected={selected.includes(product.id)}
              onPress={() => compareToggle(product.id)}
            >
              So sánh
            </Chip>
            <Chip onPress={() => save([product.id])}>Lưu quyết định</Chip>
          </Row>
          <Button onPress={openChat}>Giải thích theo nhu cầu của tôi</Button>
        </Sheet>
        <Sheet
          visible={sheet === "sample"}
          title="Đề nghị mô phỏng"
          onClose={() => setSheet("detail")}
        >
          <Card tint>
            <Title small>Đây không phải trang thanh toán.</Title>
            <Label>
              {sampleOffer?.seller} ·{" "}
              {PRODUCTS.find((p) => p.id === sampleOffer?.productId)?.name}
            </Label>
            <Label>
              {sampleOffer && total(sampleOffer) !== null
                ? money(total(sampleOffer)!)
                : "Chưa có tổng chi phí đầy đủ"}
            </Label>
            <Caption>
              Giá và cửa hàng là giả lập. Không mở nơi bán thật, không ghi nhận
              đơn hàng hoặc giao dịch.
            </Caption>
          </Card>
          <Button onPress={() => setSheet("detail")}>
            Quay lại đúng cấu hình
          </Button>
        </Sheet>
        <Sheet
          visible={sheet === "chat"}
          title="Cùng làm rõ lựa chọn ✦"
          onClose={() => {
            requestId.current++;
        aiAbort.current?.abort();
            setAiBusy(false);
            setProductId(chatReturn.current.productId);
            setSheet(chatReturn.current.sheet);
          }}
        >
          <Caption>{aiMode}</Caption>
          <Label>
            Trần hiện tại: {money(store.needs.budget)}. AI chỉ đề xuất; bạn xác
            nhận mọi thay đổi.
          </Label>
          <Field
            label="Câu hỏi hoặc nhu cầu"
            value={message}
            onChangeText={setMessage}
            placeholder="Tôi cần lập trình và chạy hai máy ảo…"
          />
          <Caption>
            Nhấn gửi đồng nghĩa chuyển nội dung này và hồ sơ liên quan tới dịch
            vụ đã cấu hình. Không có dịch vụ: dùng giải thích xác định.
          </Caption>
          <Button disabled={aiBusy} onPress={() => ask("explain")}>
            Giải thích phương án
          </Button>
          <Button
            secondary
            disabled={aiBusy || !message.trim()}
            onPress={() => ask("interpret")}
          >
            Đề xuất thay đổi nhu cầu
          </Button>
          {aiBusy && (
            <>
              <ActivityIndicator color={c.primary} />
              <Button
                secondary
                onPress={() => {
                  requestId.current++;
        aiAbort.current?.abort();
                  setAiBusy(false);
                  setAiMode("Đã hủy yêu cầu");
                }}
              >
                Hủy yêu cầu
              </Button>
            </>
          )}
          {!!answer && (
            <Card>
              <Label>{answer}</Label>
            </Card>
          )}
          {patch && (
            <Card tint>
              <Title small>Đề xuất · chưa áp dụng</Title>
              <Label>{patch.reason}</Label>
              <Label>
                {patch.primaryUseOrder.map(taskName).join(" → ")}
                {"\n"}Ngân sách đề xuất: {money(patch.budget)}
                {"\n"}Máy ảo: {patch.vm}
              </Label>
              <Button
                onPress={() => {
                  setDraft(proposeNeeds(store.needs,patch));
                  setBudgetText(String(patch.budget));
                  setStep(2);
                  setSheet("picker");
                  setPatch(null);
                }}
              >
                Xem lại & xác nhận thay đổi
              </Button>
              <Button secondary onPress={() => setPatch(null)}>
                Bỏ đề xuất · giữ hồ sơ
              </Button>
            </Card>
          )}
        </Sheet>
      </SafeAreaView>
    </Theme.Provider>
  );
}
