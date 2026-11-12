import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Icon } from "./icons";
import {
  PRODUCTS,
  OFFERS,
  TASKS,
  PRIORITIES,
  SAMPLE_PROFILE,
  DATASET_VERSION,
  OBSERVED_AT,
  money,
  total,
  bestOffer,
  fit,
  recommend,
} from "./domain";
import type { Profile, Product, Offer, Decision } from "./domain";

const theme = (name: string, fallback: string) =>
  Platform.OS === "web" ? `var(--${name}, ${fallback})` : fallback;
const C = {
  text: theme("foreground", "#22342d"),
  muted: theme("muted-foreground", "#78847b"),
  surface: theme("card", "#ffffff"),
  line: theme("border", "#e3e8df"),
  soft: theme("secondary", "#f2f4ef"),
  brand: theme("foreground", "#214c40"),
  action: "#214c40",
  artInk: "#214c40",
  lime: "#deefb0",
  green: theme("secondary", "#eaf2e8"),
  warning: "#9a6627",
};
type Storage = { read: () => string | null; write: (v: string) => void };
type Props = { storage?: Storage };
type SavedState = {
  version: 1;
  profile: Profile;
  saved: Decision[];
  offers: Offer[];
};
type Sheet =
  | "wizard"
  | "detail"
  | "adviser"
  | "info"
  | "settings"
  | "offer"
  | null;
const text = (children: React.ReactNode, style?: any) => (
  <Text style={[S.text, style]}>{children}</Text>
);
function Button({
  children,
  onPress,
  icon,
  secondary = false,
  small = false,
  disabled = false,
  testID,
}: {
  children: React.ReactNode;
  onPress: () => void;
  icon?: string;
  secondary?: boolean;
  small?: boolean;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        S.button,
        secondary ? S.secondary : S.primary,
        small && { paddingHorizontal: 14, minHeight: 38 },
        disabled && { opacity: 0.4 },
      ]}
    >
      {text(children, {
        fontWeight: "600",
        color: secondary ? C.text : "#fff",
        fontSize: small ? 12 : 14,
      })}
      {icon && (
        <Icon name={icon} size={16} color={secondary ? C.text : "#fff"} />
      )}
    </Pressable>
  );
}
function Tag({
  label,
  icon,
  onPress,
  active = false,
}: {
  label: string;
  icon?: string;
  onPress?: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      style={[
        S.tag,
        onPress && { minHeight: 44 },
        active && { backgroundColor: C.green, borderColor: "#aac5a1" },
      ]}
    >
      {icon && (
        <Icon name={icon} size={14} color={active ? C.brand : C.muted} />
      )}
      {text(label, {
        fontSize: 12,
        color: active ? C.brand : C.text,
        flexShrink: 1,
      })}
    </Pressable>
  );
}
function IconButton({
  name,
  label,
  onPress,
  active = false,
  color = C.text,
}: {
  name: string;
  label: string;
  onPress: () => void;
  active?: boolean;
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[S.iconButton, active && { backgroundColor: C.green }]}
    >
      <Icon name={name} size={19} color={active ? C.brand : color} />
    </Pressable>
  );
}
function Laptop({ p, large = false }: { p: Product; large?: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel={`Minh họa mẫu giả lập ${p.name}`}
      style={{
        alignItems: "center",
        justifyContent: "center",
        height: large ? 235 : 166,
        width: "100%",
      }}
    >
      <View
        style={{
          width: large ? 255 : 181,
          height: large ? 163 : 116,
          backgroundColor: p.color,
          borderRadius: 9,
          padding: 6,
          transform: [{ rotate: "-7deg" }],
          boxShadow: "0px 12px 20px rgba(23,46,35,0.13)",
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#1b3e37",
            borderRadius: 4,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              position: "absolute",
              width: 190,
              height: 190,
              borderRadius: 110,
              backgroundColor: "#a6bd9b",
              top: 20,
              left: 80,
              transform: [{ rotate: "30deg" }],
            }}
          />
          <View
            style={{
              position: "absolute",
              width: 155,
              height: 155,
              borderRadius: 100,
              backgroundColor: "#dce8bd",
              top: -105,
              left: -45,
            }}
          />
          <View
            style={{
              position: "absolute",
              width: 150,
              height: 150,
              borderRadius: 100,
              backgroundColor: "#729d88",
              top: 45,
              left: -65,
            }}
          />
          {text("l u a", {
            color: "#fff",
            fontSize: large ? 26 : 19,
            fontWeight: "300",
            letterSpacing: 5,
          })}
        </View>
        <View
          style={{
            position: "absolute",
            height: 6,
            bottom: -5,
            left: -13,
            right: -13,
            backgroundColor: p.color,
            borderRadius: 3,
          }}
        />
      </View>
      <View
        style={{
          width: large ? 145 : 115,
          height: 9,
          backgroundColor: "#243d2d12",
          borderRadius: 50,
          marginTop: 20,
          transform: [{ scaleX: 1.5 }],
        }}
      />
    </View>
  );
}

export default function App({ storage }: Props) {
  const { width } = useWindowDimensions();
  const desktop = width >= 1050,
    compact = width < 650;
  const [profile, setProfile] = useState<Profile>(SAMPLE_PROFILE),
    [saved, setSaved] = useState<Decision[]>([]),
    [offers, setOffers] = useState<Offer[]>(OFFERS),
    [loaded, setLoaded] = useState(false),
    [storageBlocked, setStorageBlocked] = useState(false),
    [saveError, setSaveError] = useState("");
  const [route, setRoute] = useState("discover"),
    [query, setQuery] = useState(""),
    [all, setAll] = useState(false),
    [showMore, setShowMore] = useState(false),
    [compare, setCompare] = useState<string[]>([]);
  const [sheet, setSheet] = useState<Sheet>(null),
    [selected, setSelected] = useState("p1"),
    [selectedOffer, setSelectedOffer] = useState("o1"),
    [toast, setToast] = useState("");
  const [draft, setDraft] = useState<Profile>(SAMPLE_PROFILE),
    [step, setStep] = useState(0),
    [budgetInput, setBudgetInput] = useState("22000000");
  const [ask, setAsk] = useState(""),
    [answer, setAnswer] = useState(""),
    [busy, setBusy] = useState(false),
    [assistantOffline, setAssistantOffline] = useState(false),
    [studioId, setStudioId] = useState("o1"),
    [studioPrice, setStudioPrice] = useState("18700000");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    focusReturn = useRef<HTMLElement | null>(null);
  const navigate = (next: string) => {
    setRoute(next);
    setSheet(null);
    if (typeof window !== "undefined")
      window.scrollTo?.({ top: 0, behavior: "smooth" });
  };
  const notify = (s: string) => setToast(s);
  useEffect(() => {
    try {
      const raw = storage?.read();
      if (raw) {
        const d = JSON.parse(raw) as SavedState;
        if (d.version !== 1) throw Error("Phiên bản dữ liệu chưa được hỗ trợ.");
        if (
          !validProfile(d.profile) ||
          !Array.isArray(d.saved) ||
          !Array.isArray(d.offers)
        )
          throw Error("Dữ liệu lưu chưa hợp lệ.");
        if (
          d.offers.length === 18 &&
          new Set(d.offers.map((o) => o.id)).size === 18 &&
          d.offers.every(validOffer)
        ) {
          setOffers(d.offers);
          setProfile(d.profile);
          const healthy = d.saved.filter(validDecision);
          setSaved(healthy);
          if (healthy.length !== d.saved.length) {
            setStorageBlocked(true);
            setSaveError(
              "Một số phương án lưu chưa đọc được. Đang hiện các mục hợp lệ; dữ liệu gốc được giữ nguyên đến khi bạn đặt lại.",
            );
          }
        } else throw Error("Đề nghị bán lưu chưa hợp lệ.");
      }
    } catch {
      setStorageBlocked(true);
      setSaveError(
        "Không đọc được dữ liệu lưu. Đang dùng bộ mẫu; bạn có thể đặt lại dữ liệu trong Cài đặt.",
      );
    }
    setLoaded(true);
  }, [storage]);
  useEffect(() => {
    if (!loaded || storageBlocked) return;
    try {
      storage?.write(JSON.stringify({ version: 1, profile, saved, offers }));
    } catch {
      setSaveError(
        "Không thể ghi trên trình duyệt này. Những thay đổi hiện tại chỉ có trong phiên đang mở.",
      );
    }
  }, [profile, saved, offers, loaded, storage, storageBlocked]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3300);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (typeof document === "undefined" || !sheet) return;
    focusReturn.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSheet(null);
        return;
      }
      if (e.key === "Tab") {
        const dialog = document.querySelector('[data-testid="sheet-content"]');
        const nodes = dialog?.querySelectorAll<HTMLElement>(
          'button,[role="button"],input,textarea,[tabindex="0"]',
        );
        if (!nodes?.length) return;
        const a = Array.from(nodes).filter(
          (el) =>
            el.getAttribute("aria-disabled") !== "true" &&
            el.offsetParent !== null,
        );
        const first = a[0],
          last = a[a.length - 1];
        if (!first) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(
      () =>
        document
          .querySelector<HTMLElement>('[data-testid="sheet-close"]')
          ?.focus(),
      60,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      focusReturn.current?.focus?.();
    };
  }, [sheet]);
  const eligible = useMemo(() => recommend(profile, offers), [profile, offers]);
  const pool = all ? PRODUCTS : eligible;
  const filtered = pool.filter((p) =>
    (p.name + " " + p.ram + "GB " + p.ssd)
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const visible = showMore || query || all ? filtered : filtered.slice(0, 3);
  const p = PRODUCTS.find((p) => p.id === selected) || PRODUCTS[0];
  const po = bestOffer(p.id, offers);
  const price = po ? total(po) : null;
  const cp = compare
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as Product[];
  const cheapest = eligible
    .slice()
    .sort(
      (a, b) =>
        total(bestOffer(a.id, offers)!)! - total(bestOffer(b.id, offers)!)!,
    )[0]?.id;
  const isSaved = (id: string) => saved.some((s) => s.productIds.includes(id));
  const openWizard = () => {
    setDraft({
      ...profile,
      tasks: [...profile.tasks],
      priorities: [...profile.priorities],
    });
    setBudgetInput(String(profile.budget));
    setStep(0);
    setSheet("wizard");
  };
  const toggleCompare = (id: string) =>
    setCompare((c) =>
      c.includes(id)
        ? c.filter((x) => x !== id)
        : c.length < 2
          ? [...c, id]
          : (notify(
              "Bạn đang so sánh 2 máy. Hãy bỏ một lựa chọn để thay máy khác.",
            ),
            c),
    );
  const commitSaved = (next: Decision[], label: string) => {
    try {
      if (storageBlocked) throw Error("Storage suspended");
      storage?.write(
        JSON.stringify({ version: 1, profile, saved: next, offers }),
      );
      setSaved(next);
      notify(storage ? label : "Đã giữ phương án trong phiên hiện tại.");
    } catch {
      setSaved(next);
      setStorageBlocked(true);
      setSaveError(
        "Chưa thể lưu lâu dài. Phương án chỉ còn trong phiên này; dữ liệu lưu trước đó được giữ nguyên.",
      );
      notify("Đã giữ tạm trong phiên — chưa lưu trên thiết bị.");
    }
  };
  const saveDecision = (ids: string[]) => {
    const names = ids
      .map((id) => PRODUCTS.find((p) => p.id === id)?.name)
      .join(" & ");
    const next: Decision[] = [
      {
        id: `d-${Date.now()}`,
        name: names,
        profile: {
          ...profile,
          tasks: [...profile.tasks],
          priorities: [...profile.priorities],
        },
        productIds: ids,
        savedAt: new Date().toISOString(),
        datasetVersion: DATASET_VERSION,
        observations: ids.map((id) => {
          const o = bestOffer(id, offers);
          const result = fit(
            PRODUCTS.find((p) => p.id === id)!,
            profile,
            offers,
          );
          return {
            productId: id,
            total: o ? total(o) : null,
            seller: o?.seller ?? null,
            observedAt: OBSERVED_AT,
            assessment: result.eligible
              ? "Đạt điều kiện hồ sơ mẫu tại lúc lưu."
              : result.reasons.join(" "),
          };
        }),
      },
      ...saved.filter((x) => x.productIds.join() !== ids.join()),
    ];
    commitSaved(next, "Đã lưu phương án trên thiết bị này.");
  };
  const openDetail = (id: string) => {
    setSelected(id);
    setSheet("detail");
  };
  const submitAsk = (q = ask) => {
    if (!q.trim()) return;
    setAsk(q);
    setAnswer("");
    setBusy(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const target = PRODUCTS.find((v) => v.id === selected)!;
      const result = fit(target, profile, offers);
      const offer = bestOffer(target.id, offers);
      let out = assistantOffline
        ? "Trợ lý mô phỏng đang tắt. Đây là phần đối chiếu theo quy tắc, không gọi AI. "
        : "";
      out += result.eligible
        ? `${target.name} đáp ứng các điều kiện trong hồ sơ mẫu hiện tại. `
        : `${target.name} chưa đáp ứng: ${result.reasons.join(" ")} `;
      if (/rẻ|giá|chi phí|ngân sách/i.test(q)) {
        const low = eligible
          .slice()
          .sort(
            (a, b) =>
              total(bestOffer(a.id, offers)!)! -
              total(bestOffer(b.id, offers)!)!,
          )[0];
        out += low
          ? `Trong các mẫu đủ điều kiện đã kiểm tra, ${low.name} có tổng giá thấp nhất: ${money(total(bestOffer(low.id, offers)!)!)}. `
          : "Chưa có mẫu đạt điều kiện để so giá. ";
      } else
        out += `${target.ram} GB RAM, SSD ${target.ssd} GB và khối lượng ${target.weight.toLocaleString("vi-VN")} kg là thông số giả lập. ${target.limitation} `;
      out += offer
        ? `Tổng giá mẫu đầy đủ hiện tại: ${money(total(offer)!)}. `
        : "Chưa có tổng giá mẫu đầy đủ còn hiệu lực. ";
      out +=
        "Đây là giải thích theo dữ liệu và quy tắc demo; không phải đánh giá máy thật.";
      setAnswer(out);
      setBusy(false);
    }, 450);
  };
  const changeTask = (id: string) =>
    setDraft((d) => ({
      ...d,
      tasks: d.tasks.includes(id)
        ? d.tasks.filter((x) => x !== id)
        : [...d.tasks, id],
      vm: id === "vm" && d.tasks.includes(id) ? "unknown" : d.vm,
    }));
  const applyWizard = () => {
    const n = Number(budgetInput.replace(/[^0-9]/g, ""));
    if (!Number.isSafeInteger(n) || n < 1000000 || n > 200000000) {
      notify("Nhập trần ngân sách từ 1 đến 200 triệu đồng cho bộ mẫu.");
      return;
    }
    setProfile({ ...draft, budget: n });
    setAll(false);
    setShowMore(false);
    setQuery("");
    setSheet(null);
    setRoute("discover");
    notify("Đã cập nhật nhu cầu. Các lựa chọn đã được đối chiếu lại.");
  };
  const taskLabel = profile.tasks
    .map((id) => TASKS.find((t) => t.id === id)?.name)
    .join(" · ");
  const heading =
    route === "compare"
      ? "Đặt cạnh nhau. Chọn rõ hơn."
      : route === "saved"
        ? "Những lựa chọn bạn muốn giữ."
        : route === "studio"
          ? "Một phòng thử, dữ liệu minh bạch."
          : "Chọn đúng máy.\nNhẹ đầu hơn.";
  const renderCard = (item: Product, index: number) => {
    const offer = bestOffer(item.id, offers),
      amount = offer ? total(offer) : null,
      ok = fit(item, profile, offers);
    const badge =
      item.id === eligible[0]?.id
        ? "PHÙ HỢP NHẤT"
        : item.id === cheapest
          ? "TIẾT KIỆM HƠN"
          : item.ram >= 32
            ? "THÊM DƯ ĐỊA"
            : "CẤU HÌNH MẪU";
    return (
      <View
        key={item.id}
        testID="product-card"
        style={[
          S.card,
          {
            width: compact ? "100%" : width < 900 ? "48.5%" : "31.9%",
            minWidth: compact ? 0 : 200,
          },
        ]}
      >
        <View style={[S.art, { backgroundColor: item.tone }]}>
          <View style={S.artTop}>
            {text(badge, {
              fontSize: 9,
              letterSpacing: 1.2,
              fontWeight: "700",
              color: C.artInk,
            })}
            <IconButton
              name="bookmark"
              color={C.artInk}
              label={`Lưu ${item.name}`}
              active={isSaved(item.id)}
              onPress={() => saveDecision([item.id])}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Xem ${item.name}`}
            onPress={() => openDetail(item.id)}
          >
            <Laptop p={item} />
          </Pressable>
          <View style={S.artBottom}>
            {text("LAPTOP MẪU", {
              fontSize: 9,
              letterSpacing: 1.2,
              color: "#718478",
            })}
            {text(String(index + 1).padStart(2, "0"), {
              fontSize: 10,
              color: "#718478",
            })}
          </View>
        </View>
        <View style={{ padding: 20, gap: 12 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => openDetail(item.id)}
          >
            {text(item.name, {
              fontSize: 21,
              fontWeight: "650",
              letterSpacing: -0.5,
            })}
            {text(item.subtitle, {
              fontSize: 12,
              color: C.muted,
              marginTop: 5,
              lineHeight: 19,
            })}
          </Pressable>
          <View style={[S.row, { gap: 7, flexWrap: "wrap" }]}>
            {text(`${item.ram} GB RAM`, S.spec)}
            {text(
              `${item.ssd >= 1024 ? "1 TB" : item.ssd + " GB"} SSD`,
              S.spec,
            )}
            {text(`${item.weight.toLocaleString("vi-VN")} kg`, S.spec)}
          </View>
          <View style={{ gap: 7, minHeight: 43 }}>
            <View style={S.row}>
              <Icon
                name={ok.eligible ? "circlecheck" : "alert"}
                size={14}
                color={ok.eligible ? "#66855b" : C.warning}
              />
              {text(
                ok.eligible
                  ? item.weight < 1.5
                    ? "Dễ mang theo mỗi ngày"
                    : item.ram >= 32
                      ? "Dư địa cho nhiều tác vụ"
                      : "Đủ việc, chi phí hợp lý"
                  : "Cần xem lại điều kiện",
                { fontSize: 11, color: C.muted, flex: 1 },
              )}
            </View>
            {text(
              item.upgrade
                ? "Có thể nâng cấp RAM trong kịch bản mẫu"
                : "RAM cố định · cân nhắc nhu cầu dài hạn",
              { fontSize: 10, color: C.muted },
            )}
          </View>
          <View style={S.divider} />
          <View style={[S.row, { justifyContent: "space-between" }]}>
            <View>
              {text(amount !== null ? money(amount) : "Chưa đủ giá", {
                fontSize: 21,
                fontWeight: "650",
                letterSpacing: -0.6,
              })}
              {text("Tổng giá mẫu · gồm phí đã biết", {
                fontSize: 9,
                color: C.muted,
                marginTop: 4,
              })}
            </View>
            <IconButton
              name="up"
              label={`Chi tiết ${item.name}`}
              onPress={() => openDetail(item.id)}
            />
          </View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: compare.includes(item.id) }}
            accessibilityLabel={`So sánh ${item.name}`}
            onPress={() => toggleCompare(item.id)}
            style={[
              S.compareButton,
              compare.includes(item.id) && {
                backgroundColor: C.green,
                borderColor: "#a6bea0",
              },
            ]}
          >
            <Icon
              name={compare.includes(item.id) ? "check" : "plus"}
              size={14}
              color={C.brand}
            />
            {text(
              compare.includes(item.id)
                ? "Đã chọn so sánh"
                : "Thêm vào so sánh",
              { fontSize: 12, color: C.brand, fontWeight: "500" },
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View
      testID="app-shell"
      style={{
        flexDirection: "row",
        minHeight: 940,
        backgroundColor: "transparent",
      }}
    >
      {desktop && (
        <View testID="sidebar" style={S.sidebar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigate("discover")}
            style={[S.row, { gap: 12, marginBottom: 45 }]}
          >
            <View style={S.brandMark}>
              {text("l", {
                fontSize: 34,
                color: C.artInk,
                fontWeight: "300",
                lineHeight: 40,
                marginTop: -6,
              })}
              {text("•", {
                fontSize: 21,
                color: C.artInk,
                position: "absolute",
                top: -2,
                right: 5,
              })}
            </View>
            <View>
              {text("lựa", {
                fontSize: 32,
                fontWeight: "650",
                letterSpacing: -1.7,
              })}
              {text("CHỌN ĐÚNG, DÙNG LÂU", {
                fontSize: 8,
                color: C.muted,
                letterSpacing: 1,
              })}
            </View>
          </Pressable>
          {text("KHÔNG GIAN CỦA BẠN", S.eyebrow)}
          <View style={{ gap: 7, marginTop: 18 }}>
            {[
              ["discover", "compass", "Khám phá"],
              ["compare", "compare", "So sánh"],
              ["saved", "bookmark", "Đã lưu"],
            ].map(([id, icon, label]) => (
              <Pressable
                key={id}
                testID={`nav-${id}`}
                accessibilityRole="button"
                accessibilityState={{ selected: route === id }}
                onPress={() => navigate(id)}
                style={[S.navItem, route === id && S.navActive]}
              >
                <Icon
                  name={icon}
                  size={19}
                  color={route === id ? C.brand : C.muted}
                />
                {text(label, {
                  fontSize: 13,
                  fontWeight: route === id ? "650" : "400",
                  flex: 1,
                  color: route === id ? C.brand : C.muted,
                })}
                {id === "compare" &&
                  compare.length > 0 &&
                  text(compare.length, S.navCount)}
                {id === "saved" &&
                  saved.length > 0 &&
                  text(saved.length, S.navCount)}
              </Pressable>
            ))}
          </View>
          <View
            style={{
              marginTop: 40,
              padding: 16,
              borderRadius: 12,
              backgroundColor: C.green,
              gap: 10,
            }}
          >
            <View style={S.row}>
              <Icon name="layers" size={16} color={C.brand} />
              {text("Một nhu cầu, nhiều góc nhìn", {
                fontSize: 11,
                fontWeight: "600",
                color: C.brand,
                flex: 1,
              })}
            </View>
            {text(
              "Giá hợp lý chỉ có ý nghĩa khi chiếc máy hợp với việc bạn làm.",
              { fontSize: 11, lineHeight: 19, color: "#617564" },
            )}
            <Pressable
              accessibilityRole="button"
              onPress={openWizard}
              style={S.row}
            >
              {text("Xác định nhu cầu", {
                fontSize: 11,
                fontWeight: "650",
                color: C.brand,
              })}
              <Icon name="right" size={14} color={C.brand} />
            </Pressable>
          </View>
          <View style={{ flex: 1, minHeight: 80 }} />
          <Pressable
            accessibilityRole="button"
            onPress={() => navigate("studio")}
            style={[S.navItem, route === "studio" && S.navActive]}
          >
            <Icon name="settings" size={17} color={C.muted} />
            {text("Xưởng dữ liệu mẫu", { fontSize: 11, color: C.muted })}
          </Pressable>
          <View style={[S.divider, { marginVertical: 16 }]} />
          <Pressable
            accessibilityRole="button"
            onPress={() => setSheet("settings")}
            style={S.row}
          >
            <View style={S.avatar}>
              {text("K", { fontWeight: "600", color: C.brand })}
            </View>
            <View style={{ flex: 1 }}>
              {text("Bạn đang là khách", { fontSize: 12, fontWeight: "600" })}
              {text("Lưu trên thiết bị này", {
                fontSize: 10,
                color: C.muted,
                marginTop: 4,
              })}
            </View>
            <Icon name="more" size={18} color={C.muted} />
          </Pressable>
        </View>
      )}
      <View
        style={{
          flex: 1,
          minWidth: 0,
          paddingHorizontal: desktop ? 38 : compact ? 18 : 26,
          paddingBottom: compact ? 95 : 30,
        }}
      >
        <View
          style={[S.header, { paddingVertical: compact ? 18 : 24, gap: 12 }]}
        >
          {!desktop && (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigate("discover")}
            >
              <View style={S.row}>
                <View
                  style={[
                    S.brandMark,
                    { width: 30, height: 30, borderRadius: 9 },
                  ]}
                >
                  {text("l", {
                    fontSize: 26,
                    color: C.artInk,
                    fontWeight: "400",
                  })}
                </View>
                {text("lựa", {
                  fontSize: 25,
                  fontWeight: "650",
                  letterSpacing: -1,
                })}
              </View>
            </Pressable>
          )}
          <View
            style={[S.search, { maxWidth: desktop ? 430 : undefined, flex: 1 }]}
          >
            <Icon name="search" size={17} color={C.muted} />
            <TextInput
              testID="catalog-search"
              accessibilityLabel="Tìm trong danh mục mẫu"
              placeholder={
                compact ? "Tìm laptop mẫu..." : "Bạn đang tìm chiếc máy nào?"
              }
              value={query}
              onChangeText={(q) => {
                setQuery(q);
                setAll(!!q);
                setRoute("discover");
              }}
              style={S.searchInput}
            />
            {query && (
              <IconButton
                name="x"
                label="Xóa tìm kiếm"
                onPress={() => {
                  setQuery("");
                  setAll(false);
                }}
              />
            )}
          </View>
          {!compact && (
            <View style={[S.row, { marginLeft: "auto", gap: 18 }]}>
              <View style={S.row}>
                <Icon name="pin" size={14} color={C.muted} />
                {text("Việt Nam", { fontSize: 11, color: C.muted })}
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSheet("info")}
                style={S.demoPill}
              >
                <View style={S.dot} />
                {text("Bản demo", {
                  fontSize: 10,
                  fontWeight: "600",
                  color: C.artInk,
                })}
              </Pressable>
            </View>
          )}
          {compact && (
            <IconButton
              name="info"
              label="Thông tin bản demo"
              onPress={() => setSheet("info")}
            />
          )}
        </View>
        {saveError && (
          <View accessibilityRole="alert" style={S.warning}>
            {text(saveError, { fontSize: 12, color: C.warning, flex: 1 })}
            <Pressable onPress={() => setSheet("settings")}>
              {text("Cài đặt", {
                fontSize: 12,
                color: C.warning,
                fontWeight: "600",
              })}
            </Pressable>
          </View>
        )}
        <View
          style={[
            S.row,
            {
              marginTop: desktop ? 28 : 20,
              marginBottom: 20,
              justifyContent: "space-between",
            },
          ]}
        >
          {text(
            route === "discover"
              ? "MỘT QUYẾT ĐỊNH, RÕ RÀNG HƠN"
              : route === "studio"
                ? "KHÔNG GIAN THỬ NGHIỆM"
                : "KHÔNG GIAN CỦA BẠN",
            S.eyebrow,
          )}
          {!compact &&
            text("Tư vấn có lý do. Lựa chọn của bạn.", {
              fontSize: 10,
              color: C.muted,
            })}
        </View>
        <View
          style={[
            S.row,
            {
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: 28,
            },
          ]}
        >
          <View style={{ flex: 1, minWidth: 240 }}>
            {text(heading, {
              fontSize: compact ? 37 : desktop ? 47 : 42,
              fontWeight: "550",
              letterSpacing: -1.8,
              lineHeight: compact ? 44 : 54,
            })}
            {text(
              route === "discover"
                ? "Từ công việc bạn làm đến khoản tiền bạn muốn chi.\nLựa giúp bạn hiểu từng lựa chọn, trước khi quyết định."
                : route === "compare"
                  ? "Nhìn vào khác biệt thực sự quan trọng với bạn."
                  : route === "saved"
                    ? "Giữ lại cả lý do lựa chọn, không chỉ tên một chiếc máy."
                    : "Chỉnh một đề nghị bán và xem dữ liệu mẫu thay đổi ra sao.",
              { fontSize: 13, lineHeight: 22, color: C.muted, marginTop: 15 },
            )}
          </View>
          {route === "discover" && (
            <Button testID="start-advice" onPress={openWizard} icon="up">
              Tìm máy cho tôi
            </Button>
          )}
        </View>
        {route === "discover" && (
          <>
            <View
              style={[
                S.profileBar,
                {
                  flexDirection: compact ? "column" : "row",
                  alignItems: compact ? "flex-start" : "center",
                },
              ]}
            >
              <View style={[S.row, { flex: 1, flexWrap: "wrap", gap: 8 }]}>
                <View style={[S.row, { marginRight: 6 }]}>
                  <View style={S.smallDot} />
                  {text("Hồ sơ mẫu", {
                    fontSize: 11,
                    fontWeight: "600",
                    color: C.brand,
                  })}
                </View>
                <Tag
                  label={taskLabel || "Chưa chọn tác vụ"}
                  icon="code"
                  onPress={openWizard}
                />
                <Tag
                  label={`Tối đa ${money(profile.budget)}`}
                  icon="wallet"
                  onPress={openWizard}
                />
                <Tag
                  label={
                    profile.priorities.includes("portable")
                      ? "Ưu tiên gọn nhẹ"
                      : profile.priorities.includes("power")
                        ? "Ưu tiên cấu hình"
                        : "Ưu tiên chi phí"
                  }
                  icon="feather"
                  onPress={openWizard}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={openWizard}
                style={S.row}
              >
                {text("Điều chỉnh", {
                  fontSize: 11,
                  fontWeight: "600",
                  color: C.brand,
                })}
                <Icon name="filter" size={15} color={C.brand} />
              </Pressable>
            </View>
            <View
              style={[
                S.row,
                {
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  marginTop: 29,
                  marginBottom: 20,
                  gap: 15,
                },
              ]}
            >
              <View style={[S.row, { gap: 21 }]}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setAll(false);
                    setShowMore(false);
                    setQuery("");
                  }}
                  style={[S.tab, !all && S.activeTab]}
                >
                  {text("Gợi ý cho bạn", {
                    fontSize: 14,
                    fontWeight: !all ? "650" : "400",
                    color: !all ? C.text : C.muted,
                  })}
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setAll(true);
                    setShowMore(true);
                  }}
                  style={[S.tab, all && S.activeTab]}
                >
                  {text("Tất cả mẫu", {
                    fontSize: 14,
                    fontWeight: all ? "650" : "400",
                    color: all ? C.text : C.muted,
                  })}
                </Pressable>
              </View>
              <View style={S.row}>
                {text(
                  `${filtered.length} cấu hình ${all ? "trong bộ mẫu" : "đạt điều kiện mẫu"}`,
                  { fontSize: 10, color: C.muted },
                )}
                <Icon name="down" size={13} color={C.muted} />
              </View>
            </View>
            <View style={[S.row, { alignItems: "flex-start", gap: 25 }]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View
                  testID="results"
                  accessibilityLiveRegion="polite"
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: compact ? 18 : 14,
                  }}
                >
                  {visible.map(renderCard)}
                </View>
                {visible.length === 0 && (
                  <View testID="no-fit" style={S.empty}>
                    <Icon name="search" size={32} color={C.muted} />
                    {text(
                      query
                        ? "Chưa tìm thấy tên máy này."
                        : "Chưa có mẫu đáp ứng đủ điều kiện.",
                      { fontSize: 22, fontWeight: "600", textAlign: "center" },
                    )}
                    {text(
                      profile.tasks.includes("vm") && profile.vm === "unknown"
                        ? "Hãy xác nhận số máy ảo. Lựa sẽ không tự đoán yêu cầu."
                        : "Thử xem lại tác vụ hoặc ngân sách. Các yêu cầu của bạn vẫn được giữ nguyên.",
                      {
                        fontSize: 13,
                        color: C.muted,
                        textAlign: "center",
                        lineHeight: 22,
                      },
                    )}
                    <Button secondary onPress={openWizard}>
                      Xem lại nhu cầu
                    </Button>
                  </View>
                )}
                {!all && !query && filtered.length > 3 && !showMore && (
                  <Pressable
                    testID="more-results"
                    accessibilityRole="button"
                    onPress={() => setShowMore(true)}
                    style={[S.row, { justifyContent: "center", padding: 21 }]}
                  >
                    {text(`Xem thêm ${filtered.length - 3} lựa chọn`, {
                      fontSize: 12,
                      fontWeight: "500",
                      color: C.muted,
                    })}
                    <Icon name="down" size={14} color={C.muted} />
                  </Pressable>
                )}
              </View>
              {width >= 1380 && (
                <View style={S.aside}>
                  {text("MỘT CHÚT RÕ RÀNG", S.eyebrow)}
                  <View style={{ marginVertical: 20 }}>
                    <Icon name="shield" size={30} color={C.brand} />
                  </View>
                  {text("Phù hợp trước.\nGiá tốt sau.", {
                    fontSize: 25,
                    lineHeight: 33,
                    fontWeight: "550",
                    letterSpacing: -0.6,
                  })}
                  {text(
                    "Một chiếc máy tiết kiệm là chiếc máy đủ cho việc bạn làm — và không bắt bạn trả thêm cho những thứ không cần.",
                    {
                      fontSize: 12,
                      color: C.muted,
                      lineHeight: 22,
                      marginTop: 15,
                    },
                  )}
                  <View style={[S.divider, { marginVertical: 23 }]} />
                  {text("Chúng tôi đối chiếu", {
                    fontSize: 11,
                    fontWeight: "600",
                    marginBottom: 13,
                  })}
                  {[
                    "Đúng cấu hình",
                    "Trong trần ngân sách",
                    "Phí và điều kiện giá",
                    "Điểm còn chưa rõ",
                  ].map((v) => (
                    <View key={v} style={[S.row, { marginBottom: 11 }]}>
                      <Icon name="check" size={13} color={C.brand} />
                      {text(v, { fontSize: 11, color: C.muted })}
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View
              style={[
                S.insight,
                { marginTop: 20, flexDirection: compact ? "column" : "row" },
              ]}
            >
              <View style={S.row}>
                <View style={S.insightIcon}>
                  <Icon name="layers" size={20} color={C.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  {text(
                    "Thông số là khởi đầu. Cách bạn dùng mới là điều quan trọng.",
                    { fontSize: 13, fontWeight: "600", lineHeight: 21 },
                  )}
                  {text(
                    "Chưa biết chọn gì? Bắt đầu từ nhu cầu, Lựa sẽ cùng bạn đối chiếu.",
                    {
                      fontSize: 11,
                      color: C.muted,
                      marginTop: 5,
                      lineHeight: 19,
                    },
                  )}
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={openWizard}
                style={[
                  S.row,
                  { marginLeft: compact ? 0 : "auto", flexShrink: 0 },
                ]}
              >
                {text("Bắt đầu tư vấn", {
                  fontSize: 12,
                  fontWeight: "600",
                  color: C.brand,
                })}
                <Icon name="right" size={17} color={C.brand} />
              </Pressable>
            </View>
          </>
        )}
        {route === "compare" && (
          <View>
            {cp.length < 2 ? (
              <View style={S.empty}>
                <Icon name="compare" size={32} />
                {text("Hai lựa chọn, một góc nhìn rõ hơn.", {
                  fontSize: 23,
                  fontWeight: "600",
                  textAlign: "center",
                })}
                {text(
                  `Bạn đã chọn ${cp.length}/2 máy. Thêm một lựa chọn từ Khám phá.`,
                  { color: C.muted, fontSize: 13 },
                )}
                {cp.map((p) => (
                  <View key={p.id} style={S.row}>
                    {text(p.name)}
                    <IconButton
                      name="x"
                      label={`Bỏ ${p.name}`}
                      onPress={() => toggleCompare(p.id)}
                    />
                  </View>
                ))}
                <Button onPress={() => navigate("discover")}>
                  Chọn máy để so sánh
                </Button>
              </View>
            ) : (
              <View>
                <View style={[S.row, { alignItems: "stretch", gap: 12 }]}>
                  {cp.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        S.card,
                        { flex: 1, minWidth: 0, padding: compact ? 12 : 23 },
                      ]}
                    >
                      <View
                        style={[S.row, { justifyContent: "space-between" }]}
                      >
                        {text("LỰA CHỌN CỦA BẠN", S.eyebrow)}
                        <IconButton
                          name="x"
                          label={`Bỏ ${item.name}`}
                          onPress={() => toggleCompare(item.id)}
                        />
                      </View>
                      <View
                        style={{
                          backgroundColor: item.tone,
                          borderRadius: 12,
                          marginVertical: 10,
                        }}
                      >
                        <Laptop p={item} />
                      </View>
                      {text(item.name, {
                        fontSize: compact ? 19 : 26,
                        fontWeight: "600",
                        letterSpacing: -0.5,
                      })}
                      {text(
                        bestOffer(item.id, offers)
                          ? money(total(bestOffer(item.id, offers)!)!)
                          : "Chưa đủ tổng giá",
                        {
                          fontSize: compact ? 17 : 23,
                          fontWeight: "600",
                          marginTop: 10,
                        },
                      )}
                      <View
                        style={[
                          S.warning,
                          {
                            marginTop: 14,
                            backgroundColor: fit(item, profile, offers).eligible
                              ? C.green
                              : undefined,
                          },
                        ]}
                      >
                        {text(
                          fit(item, profile, offers).eligible
                            ? "Đạt điều kiện hồ sơ mẫu"
                            : fit(item, profile, offers).reasons.join(" "),
                          {
                            fontSize: 11,
                            color: fit(item, profile, offers).eligible
                              ? C.brand
                              : C.warning,
                            flex: 1,
                            lineHeight: 18,
                          },
                        )}
                      </View>
                    </View>
                  ))}
                </View>
                {[
                  ["Bộ nhớ RAM", ...cp.map((p) => `${p.ram} GB`)],
                  ["Lưu trữ", ...cp.map((p) => `${p.ssd} GB SSD`)],
                  [
                    "Khối lượng",
                    ...cp.map((p) => `${p.weight.toLocaleString("vi-VN")} kg`),
                  ],
                  ["Màn hình", ...cp.map((p) => p.screen)],
                  ["Cần cân nhắc", ...cp.map((p) => p.limitation)],
                ].map(([label, a, b]) => (
                  <View
                    key={label}
                    style={{
                      paddingVertical: 18,
                      borderBottomWidth: 1,
                      borderColor: C.line,
                    }}
                  >
                    {text(label, {
                      fontSize: 11,
                      color: C.muted,
                      marginBottom: 10,
                    })}
                    <View
                      style={[S.row, { alignItems: "flex-start", gap: 22 }]}
                    >
                      {text(a, {
                        flex: 1,
                        fontSize: 13,
                        lineHeight: 21,
                        fontWeight: label === "Bộ nhớ RAM" ? "600" : "400",
                      })}
                      {text(b, {
                        flex: 1,
                        fontSize: 13,
                        lineHeight: 21,
                        fontWeight: label === "Bộ nhớ RAM" ? "600" : "400",
                      })}
                    </View>
                  </View>
                ))}
                <View style={[S.row, { flexWrap: "wrap", marginTop: 22 }]}>
                  <Button onPress={() => saveDecision(compare)} icon="bookmark">
                    Lưu phương án so sánh
                  </Button>
                  <Button
                    secondary
                    onPress={() => {
                      setSelected(compare[0]);
                      setAnswer("");
                      setAsk("");
                      setSheet("adviser");
                    }}
                    icon="layers"
                  >
                    Giải thích khác biệt
                  </Button>
                </View>
              </View>
            )}
          </View>
        )}
        {route === "saved" && (
          <View style={{ gap: 14 }}>
            {saved.length === 0 ? (
              <View style={S.empty}>
                <Icon name="bookmark" size={34} />
                {text("Chưa có lựa chọn nào được lưu.", {
                  fontSize: 24,
                  fontWeight: "600",
                  textAlign: "center",
                })}
                {text(
                  "Lưu một chiếc máy hoặc cả phương án so sánh để xem lại sau.",
                  {
                    fontSize: 13,
                    color: C.muted,
                    textAlign: "center",
                    lineHeight: 22,
                  },
                )}
                <Button onPress={() => navigate("discover")}>
                  Khám phá lựa chọn
                </Button>
              </View>
            ) : (
              saved.map((d) => (
                <View key={d.id} style={[S.card, { padding: 22, gap: 14 }]}>
                  <View
                    style={[
                      S.row,
                      {
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      {text("PHƯƠNG ÁN ĐÃ LƯU", S.eyebrow)}
                      {text(d.name, {
                        fontSize: 23,
                        fontWeight: "600",
                        marginTop: 9,
                      })}
                      {text(
                        `Lưu ${new Date(d.savedAt).toLocaleDateString("vi-VN")} · dữ liệu mẫu ${d.datasetVersion}`,
                        { fontSize: 11, color: C.muted, marginTop: 7 },
                      )}
                    </View>
                    <IconButton
                      name="trash"
                      label={`Xóa ${d.name}`}
                      onPress={() => {
                        commitSaved(
                          saved.filter((x) => x.id !== d.id),
                          "Đã xóa phương án khỏi thiết bị này.",
                        );
                      }}
                    />
                  </View>
                  <View style={[S.row, { flexWrap: "wrap" }]}>
                    <Tag
                      label={`Trần ${money(d.profile.budget)}`}
                      icon="wallet"
                    />
                    <Tag
                      label={`${d.productIds.length} cấu hình mẫu`}
                      icon="layers"
                    />
                  </View>
                  {d.observations?.map((o) => (
                    <View key={o.productId} style={{ gap: 5 }}>
                      {text(
                        `${PRODUCTS.find((p) => p.id === o.productId)?.name} · ${o.total === null ? "Chưa đủ tổng giá" : money(o.total)}`,
                        { fontSize: 13, fontWeight: "600" },
                      )}
                      {text(`Giá mẫu tại lúc lưu · ${o.observedAt}`, {
                        fontSize: 10,
                        color: C.muted,
                      })}
                    </View>
                  ))}
                  {text(
                    "Giá trong bộ mẫu không phải báo giá thật. Mở lại sẽ đối chiếu với bộ dữ liệu mẫu hiện tại.",
                    { fontSize: 11, color: C.muted, lineHeight: 20 },
                  )}
                  <View style={[S.row, { flexWrap: "wrap" }]}>
                    <Button
                      small
                      onPress={() => {
                        setProfile(d.profile);
                        setCompare(d.productIds.slice(0, 2));
                        if (d.productIds.length > 1) navigate("compare");
                        else {
                          setSelected(d.productIds[0]);
                          setSheet("detail");
                        }
                      }}
                      icon="right"
                    >
                      Mở phương án
                    </Button>
                    <Button
                      small
                      secondary
                      onPress={() => shareDecision(d, notify)}
                      icon="download"
                    >
                      Xuất tóm tắt
                    </Button>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        {route === "studio" && (
          <View style={{ gap: 20 }}>
            <View style={S.warning}>
              <Icon name="info" size={18} color={C.warning} />
              {text(
                "Xưởng demo cục bộ. Không có tài khoản admin, nguồn giá thật hay thao tác xuất bản lên máy chủ.",
                { fontSize: 12, color: C.warning, lineHeight: 21, flex: 1 },
              )}
            </View>
            <View style={[S.row, { gap: 14, flexWrap: "wrap" }]}>
              {[
                [PRODUCTS.length, "Cấu hình giả lập"],
                [offers.length, "Đề nghị bán mẫu"],
                [3, "Cửa hàng giả lập"],
              ].map(([n, label]) => (
                <View
                  key={label}
                  style={[S.card, { padding: 22, flex: 1, minWidth: 140 }]}
                >
                  {text(n, { fontSize: 35, fontWeight: "500" })}
                  {text(label, { fontSize: 12, color: C.muted, marginTop: 7 })}
                </View>
              ))}
            </View>
            <View style={[S.card, { padding: 24, gap: 15 }]}>
              {text("Chỉnh giá mẫu, xem kết quả cập nhật", {
                fontSize: 21,
                fontWeight: "600",
              })}
              {text(
                "Chọn một đề nghị bán. Giá mới được kiểm tra trước khi áp dụng vào danh mục và shortlist.",
                { fontSize: 12, color: C.muted, lineHeight: 21 },
              )}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={S.row}>
                  {offers.slice(0, 8).map((o) => (
                    <Tag
                      key={o.id}
                      label={`${o.id.toUpperCase()} · ${o.seller}`}
                      active={studioId === o.id}
                      onPress={() => {
                        setStudioId(o.id);
                        setStudioPrice(String(o.base));
                      }}
                    />
                  ))}
                </View>
              </ScrollView>
              {text(
                PRODUCTS.find(
                  (p) =>
                    p.id === offers.find((o) => o.id === studioId)?.productId,
                )?.name,
                { fontSize: 17, fontWeight: "600" },
              )}
              <View style={[S.row, { flexWrap: "wrap" }]}>
                <TextInput
                  testID="studio-price"
                  accessibilityLabel="Giá máy mẫu"
                  value={studioPrice}
                  onChangeText={setStudioPrice}
                  keyboardType="numeric"
                  style={[S.input, { flex: 1, minWidth: 180 }]}
                />
                <Button
                  onPress={() => {
                    const n = Number(studioPrice);
                    if (!Number.isSafeInteger(n) || n <= 0 || n > 200000000) {
                      notify(
                        "Giá phải là số nguyên dương không quá 200 triệu.",
                      );
                      return;
                    }
                    setOffers((s) =>
                      s.map((o) => (o.id === studioId ? { ...o, base: n } : o)),
                    );
                    notify("Đã kiểm tra và áp dụng giá vào bộ mẫu cục bộ.");
                  }}
                  icon="check"
                >
                  Kiểm tra & áp dụng
                </Button>
              </View>
            </View>
            <View style={[S.card, { padding: 24, gap: 15 }]}>
              {text("Kịch bản cần thử", { fontSize: 20, fontWeight: "600" })}
              <View style={[S.row, { flexWrap: "wrap" }]}>
                <Button
                  secondary
                  small
                  onPress={() => {
                    setProfile({ ...profile, budget: 1000000 });
                    navigate("discover");
                    notify("Đã bật kịch bản không có mẫu đạt trần giá.");
                  }}
                >
                  Không có kết quả phù hợp
                </Button>
                <Button
                  secondary
                  small
                  onPress={() => {
                    setProfile({
                      ...profile,
                      tasks: ["code", "vm"],
                      vm: "unknown",
                    });
                    navigate("discover");
                  }}
                >
                  Thiếu yêu cầu quan trọng
                </Button>
                <Button
                  secondary
                  small
                  onPress={() => {
                    setAssistantOffline((v) => !v);
                    notify(
                      assistantOffline
                        ? "Đã bật lại trợ lý mô phỏng."
                        : "Đã tắt trợ lý mô phỏng; đối chiếu theo quy tắc vẫn hoạt động.",
                    );
                  }}
                >
                  {assistantOffline
                    ? "Bật trợ lý mô phỏng"
                    : "Thử tắt trợ lý mô phỏng"}
                </Button>
              </View>
            </View>
          </View>
        )}
        <View
          style={[
            S.row,
            {
              marginTop: 35,
              paddingTop: 20,
              borderTopWidth: 1,
              borderColor: C.line,
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            },
          ]}
        >
          {text(
            "Dữ liệu và giá đều là giả lập · Không mua bán trong bản demo",
            { fontSize: 10, color: C.muted },
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => setSheet("info")}
            style={S.row}
          >
            {text("Về bản demo", { fontSize: 10, color: C.muted })}
            <Icon name="up" size={12} color={C.muted} />
          </Pressable>
        </View>
      </View>
      {!desktop && (
        <View testID="mobile-nav" style={S.mobileNav}>
          {[
            ["discover", "compass", "Khám phá"],
            [
              "compare",
              "compare",
              `So sánh${compare.length ? " · " + compare.length : ""}`,
            ],
            [
              "saved",
              "bookmark",
              `Đã lưu${saved.length ? " · " + saved.length : ""}`,
            ],
          ].map(([id, icon, label]) => (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityState={{ selected: route === id }}
              onPress={() => navigate(id)}
              style={[
                S.mobileNavItem,
                route === id && { backgroundColor: C.green },
              ]}
            >
              <Icon
                name={icon}
                size={19}
                color={route === id ? C.brand : C.muted}
              />
              {text(label, {
                fontSize: 10,
                fontWeight: route === id ? "600" : "400",
                color: route === id ? C.brand : C.muted,
              })}
            </Pressable>
          ))}
          <IconButton
            name="settings"
            label="Cài đặt và dữ liệu"
            onPress={() => setSheet("settings")}
          />
        </View>
      )}
      {compare.length > 0 && route === "discover" && desktop && (
        <View style={S.compareFloat}>
          <View style={S.row}>
            <Icon name="compare" size={18} color="#fff" />
            {text(`${compare.length}/2 lựa chọn`, {
              color: "#fff",
              fontSize: 12,
            })}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigate("compare")}
            style={S.row}
          >
            {text("So sánh ngay", {
              color: C.lime,
              fontWeight: "600",
              fontSize: 12,
            })}
            <Icon name="right" size={15} color={C.lime} />
          </Pressable>
        </View>
      )}
      {toast && (
        <View
          testID="toast"
          accessibilityLiveRegion="polite"
          style={[S.toast, { bottom: desktop ? 28 : 90 }]}
        >
          <Icon name="circlecheck" size={18} color={C.lime} />
          {text(toast, {
            color: "#fff",
            fontSize: 12,
            lineHeight: 20,
            flex: 1,
          })}
        </View>
      )}
      <Modal
        visible={sheet !== null}
        transparent
        animationType="none"
        onRequestClose={() => setSheet(null)}
      >
        <View style={S.overlay}>
          <Pressable
            accessibilityLabel="Đóng hộp thoại"
            onPress={() => setSheet(null)}
            style={S.backdrop}
          />
          <View
            testID="sheet-content"
            accessibilityViewIsModal
            style={[
              S.sheet,
              {
                width: compact ? "96%" : sheet === "detail" ? 760 : 580,
                maxHeight: compact ? "94%" : "90%",
              },
            ]}
          >
            <View
              style={[
                S.row,
                {
                  paddingHorizontal: compact ? 20 : 30,
                  paddingTop: 22,
                  paddingBottom: 17,
                  justifyContent: "space-between",
                  borderBottomWidth: 1,
                  borderColor: C.line,
                },
              ]}
            >
              {text(
                sheet === "wizard"
                  ? "BẮT ĐẦU TỪ NHU CẦU"
                  : sheet === "detail"
                    ? "HIỂU RÕ LỰA CHỌN"
                    : sheet === "adviser"
                      ? "MỘT GÓC NHÌN THÊM"
                      : sheet === "settings"
                        ? "THIẾT BỊ & DỮ LIỆU"
                        : sheet === "offer"
                          ? "ĐỀ NGHỊ BÁN GIẢ LẬP"
                          : "VỀ BẢN DEMO",
                S.eyebrow,
              )}
              <Pressable
                testID="sheet-close"
                accessibilityRole="button"
                accessibilityLabel="Đóng"
                onPress={() => setSheet(null)}
                style={S.iconButton}
              >
                <Icon name="x" size={19} />
              </Pressable>
            </View>
            <ScrollView
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ padding: compact ? 20 : 30, gap: 18 }}
              keyboardShouldPersistTaps="handled"
            >
              {sheet === "wizard" && (
                <>
                  <View style={[S.row, { gap: 6 }]}>
                    {[0, 1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 3,
                          backgroundColor: i <= step ? C.brand : C.line,
                        }}
                      />
                    ))}
                  </View>
                  {text(
                    [
                      "Bạn sẽ dùng máy để làm gì?",
                      "Khoản chi nào thoải mái với bạn?",
                      "Bạn ưu tiên điều gì hơn?",
                      "Một lần xem lại, trước khi chọn.",
                    ][step],
                    {
                      fontSize: 29,
                      fontWeight: "550",
                      letterSpacing: -0.7,
                      lineHeight: 37,
                    },
                  )}
                  {step === 0 && (
                    <>
                      {text(
                        "Chọn tất cả tác vụ thường làm. Các quy tắc dưới đây chỉ dùng trong bộ demo.",
                        { fontSize: 13, color: C.muted, lineHeight: 22 },
                      )}
                      {TASKS.map((t) => (
                        <Pressable
                          key={t.id}
                          testID={`task-${t.id}`}
                          accessibilityRole="checkbox"
                          accessibilityState={{
                            checked: draft.tasks.includes(t.id),
                          }}
                          onPress={() => changeTask(t.id)}
                          style={[
                            S.choice,
                            draft.tasks.includes(t.id) && S.choiceSelected,
                          ]}
                        >
                          <View style={S.choiceIcon}>
                            <Icon name={t.icon} size={22} color={C.brand} />
                          </View>
                          <View style={{ flex: 1 }}>
                            {text(t.name, { fontSize: 14, fontWeight: "600" })}
                            {text(t.detail, {
                              fontSize: 11,
                              color: C.muted,
                              marginTop: 4,
                            })}
                          </View>
                          <View
                            style={[
                              S.checkbox,
                              draft.tasks.includes(t.id) && {
                                backgroundColor: C.action,
                                borderColor: C.action,
                              },
                            ]}
                          >
                            {draft.tasks.includes(t.id) && (
                              <Icon name="check" size={12} color="#fff" />
                            )}
                          </View>
                        </Pressable>
                      ))}
                      {draft.tasks.includes("vm") && (
                        <View style={{ gap: 10 }}>
                          {text("Bạn chạy bao nhiêu máy ảo đồng thời?", {
                            fontSize: 13,
                            fontWeight: "600",
                          })}
                          <View style={[S.row, { flexWrap: "wrap" }]}>
                            {[
                              ["one", "Một máy"],
                              ["many", "Từ hai máy"],
                              ["unknown", "Chưa rõ"],
                            ].map(([id, label]) => (
                              <Tag
                                key={id}
                                label={label}
                                active={draft.vm === id}
                                onPress={() =>
                                  setDraft((d) => ({
                                    ...d,
                                    vm: id as Profile["vm"],
                                  }))
                                }
                              />
                            ))}
                          </View>
                        </View>
                      )}
                    </>
                  )}
                  {step === 1 && (
                    <>
                      {text(
                        "Trần tổng ngân sách gồm máy và các chi phí bắt buộc đã biết. Đây là mức tối đa, không phải mục tiêu phải tiêu hết.",
                        { fontSize: 13, color: C.muted, lineHeight: 22 },
                      )}
                      <View
                        style={{
                          padding: 22,
                          borderRadius: 16,
                          backgroundColor: C.green,
                          gap: 12,
                        }}
                      >
                        {text("TỔNG NGÂN SÁCH TỐI ĐA", {
                          fontSize: 10,
                          letterSpacing: 1,
                          color: C.brand,
                        })}
                        <TextInput
                          testID="budget-input"
                          accessibilityLabel="Trần tổng ngân sách bằng đồng"
                          value={budgetInput}
                          onChangeText={(s) =>
                            setBudgetInput(s.replace(/[^0-9]/g, ""))
                          }
                          keyboardType="numeric"
                          style={[
                            S.input,
                            {
                              fontSize: 30,
                              fontWeight: "500",
                              backgroundColor: C.surface,
                            },
                          ]}
                        />
                        {text(
                          Number(budgetInput) > 0
                            ? money(Number(budgetInput))
                            : "Nhập một số tiền hợp lệ",
                          { fontSize: 13, color: C.brand },
                        )}
                      </View>
                      <View style={[S.row, { flexWrap: "wrap" }]}>
                        {[12000000, 18000000, 22000000, 25000000, 30000000].map(
                          (n) => (
                            <Tag
                              key={n}
                              label={`${n / 1000000} triệu`}
                              active={Number(budgetInput) === n}
                              onPress={() => setBudgetInput(String(n))}
                            />
                          ),
                        )}
                      </View>
                      {text(
                        "Không cần cung cấp thu nhập hoặc thông tin ngân hàng.",
                        { fontSize: 11, color: C.muted },
                      )}
                    </>
                  )}
                  {step === 2 && (
                    <>
                      {text(
                        "Chọn tối đa hai ưu tiên mềm. Các yêu cầu bắt buộc vẫn được giữ nguyên.",
                        { fontSize: 13, color: C.muted, lineHeight: 22 },
                      )}
                      {PRIORITIES.map((t) => (
                        <Pressable
                          key={t.id}
                          accessibilityRole="checkbox"
                          accessibilityState={{
                            checked: draft.priorities.includes(t.id),
                          }}
                          onPress={() =>
                            setDraft((d) => ({
                              ...d,
                              priorities: d.priorities.includes(t.id)
                                ? d.priorities.filter((x) => x !== t.id)
                                : d.priorities.length < 2
                                  ? [...d.priorities, t.id]
                                  : d.priorities,
                            }))
                          }
                          style={[
                            S.choice,
                            draft.priorities.includes(t.id) && S.choiceSelected,
                          ]}
                        >
                          <Icon name={t.icon} size={24} color={C.brand} />
                          {text(t.name, {
                            fontSize: 15,
                            fontWeight: "500",
                            flex: 1,
                          })}
                          {draft.priorities.includes(t.id) && (
                            <Icon name="check" size={19} color={C.brand} />
                          )}
                        </Pressable>
                      ))}
                      <Pressable
                        onPress={() =>
                          setDraft((d) => ({ ...d, priorities: [] }))
                        }
                      >
                        {text(
                          draft.priorities.length
                            ? "Không có ưu tiên đặc biệt"
                            : "✓ Không có ưu tiên đặc biệt",
                          { fontSize: 12, color: C.muted },
                        )}
                      </Pressable>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <View style={[S.card, { padding: 22, gap: 15 }]}>
                        {[
                          ["Loại thiết bị", "Laptop mới · dữ liệu giả lập"],
                          [
                            "Tác vụ",
                            draft.tasks
                              .map((id) => TASKS.find((t) => t.id === id)?.name)
                              .join(", "),
                          ],
                          ["Trần tổng giá", money(Number(budgetInput) || 0)],
                          [
                            "Ưu tiên",
                            draft.priorities
                              .map(
                                (id) =>
                                  PRIORITIES.find((t) => t.id === id)?.name,
                              )
                              .join(", ") || "Không có ưu tiên đặc biệt",
                          ],
                          ...(draft.tasks.includes("vm")
                            ? [
                                [
                                  "Máy ảo",
                                  draft.vm === "unknown"
                                    ? "Chưa rõ — cần làm rõ để xác nhận phù hợp"
                                    : draft.vm === "many"
                                      ? "Từ hai máy đồng thời"
                                      : "Một máy đồng thời",
                                ],
                              ]
                            : []),
                        ].map(([a, b]) => (
                          <View key={a} style={{ gap: 5 }}>
                            {text(a, { fontSize: 11, color: C.muted })}
                            {text(b, {
                              fontSize: 14,
                              fontWeight: "500",
                              lineHeight: 22,
                            })}
                          </View>
                        ))}
                      </View>
                      {text(
                        "Bạn có thể chỉnh lại bất cứ lúc nào. Kết quả chỉ dùng cấu hình và giả định của bản demo.",
                        { fontSize: 12, color: C.muted, lineHeight: 21 },
                      )}
                    </>
                  )}
                  <View
                    style={[
                      S.row,
                      { justifyContent: "space-between", marginTop: 10 },
                    ]}
                  >
                    <Button
                      secondary
                      onPress={() =>
                        step ? setStep((s) => s - 1) : setSheet(null)
                      }
                      icon="left"
                    >
                      {step ? "Quay lại" : "Để sau"}
                    </Button>
                    <Button
                      testID="wizard-next"
                      disabled={
                        (step === 0 && !draft.tasks.length) ||
                        (step === 1 &&
                          (!Number.isSafeInteger(Number(budgetInput)) ||
                            Number(budgetInput) < 1000000 ||
                            Number(budgetInput) > 200000000))
                      }
                      onPress={() =>
                        step === 3 ? applyWizard() : setStep((s) => s + 1)
                      }
                      icon="right"
                    >
                      {step === 3 ? "Xem lựa chọn" : "Tiếp tục"}
                    </Button>
                  </View>
                </>
              )}
              {sheet === "detail" && (
                <>
                  <View style={{ backgroundColor: p.tone, borderRadius: 15 }}>
                    <Laptop p={p} large />
                  </View>
                  <View>
                    <View
                      style={[
                        S.row,
                        {
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        {text(p.name, {
                          fontSize: 33,
                          fontWeight: "600",
                          letterSpacing: -1,
                        })}
                        {text(p.subtitle, {
                          fontSize: 13,
                          color: C.muted,
                          marginTop: 6,
                        })}
                      </View>
                      <IconButton
                        name="bookmark"
                        label={`Lưu ${p.name}`}
                        active={isSaved(p.id)}
                        onPress={() => saveDecision([p.id])}
                      />
                    </View>
                    <View style={[S.row, { flexWrap: "wrap", marginTop: 18 }]}>
                      <Tag label={`${p.ram} GB RAM`} />
                      <Tag label={`${p.ssd} GB SSD`} />
                      <Tag label={p.screen} />
                      <Tag label={`${p.weight.toLocaleString("vi-VN")} kg`} />
                    </View>
                  </View>
                  <View
                    style={[
                      S.warning,
                      {
                        backgroundColor: fit(p, profile, offers).eligible
                          ? C.green
                          : undefined,
                      },
                    ]}
                  >
                    <Icon
                      name={
                        fit(p, profile, offers).eligible ? "shield" : "alert"
                      }
                      size={19}
                      color={C.brand}
                    />
                    {text(
                      fit(p, profile, offers).eligible
                        ? "Đạt điều kiện của hồ sơ mẫu hiện tại."
                        : fit(p, profile, offers).reasons.join(" "),
                      {
                        fontSize: 12,
                        color: fit(p, profile, offers).eligible
                          ? C.brand
                          : C.warning,
                        lineHeight: 21,
                        flex: 1,
                      },
                    )}
                  </View>
                  <View style={{ gap: 10 }}>
                    {text("Điều đáng cân nhắc", {
                      fontSize: 17,
                      fontWeight: "600",
                    })}
                    <View style={S.row}>
                      <Icon name="plus" size={15} color={C.brand} />
                      {text(
                        p.weight < 1.5
                          ? "Khối lượng gọn nhẹ trong kịch bản di chuyển."
                          : p.ram >= 32
                            ? "32 GB RAM cho nhánh máy ảo nhiều phiên."
                            : "Cấu hình đủ cho nhánh học tập/lập trình mẫu.",
                        { fontSize: 13, lineHeight: 22, flex: 1 },
                      )}
                    </View>
                    <View style={S.row}>
                      <Icon name="info" size={15} color={C.warning} />
                      {text(p.limitation, {
                        fontSize: 13,
                        color: C.muted,
                        lineHeight: 22,
                        flex: 1,
                      })}
                    </View>
                    {text(
                      "Nguồn: synthetic-v1 · Thông số và đánh giá giả lập, không có kết quả benchmark máy thật.",
                      { fontSize: 10, color: C.muted, lineHeight: 18 },
                    )}
                  </View>
                  <Button
                    secondary
                    onPress={() => {
                      setAnswer("");
                      setAsk("");
                      setSheet("adviser");
                    }}
                    icon="layers"
                  >
                    Giải thích lựa chọn này
                  </Button>
                  <View style={S.divider} />
                  <View style={[S.row, { justifyContent: "space-between" }]}>
                    {text("Các đề nghị bán mẫu", {
                      fontSize: 20,
                      fontWeight: "600",
                    })}
                    {text("GIẢ LẬP", S.eyebrow)}
                  </View>
                  {offers
                    .filter((o) => o.productId === p.id)
                    .map((o) => (
                      <View
                        key={o.id}
                        style={[
                          S.card,
                          {
                            padding: 18,
                            gap: 9,
                            opacity: o.status === "current" ? 1 : 0.65,
                          },
                        ]}
                      >
                        <View
                          style={[S.row, { justifyContent: "space-between" }]}
                        >
                          {text(o.seller, { fontSize: 14, fontWeight: "600" })}
                          {text(
                            total(o) !== null
                              ? money(total(o)!)
                              : `${money(o.base + o.fee)} + phí chưa rõ`,
                            { fontSize: 17, fontWeight: "600" },
                          )}
                        </View>
                        {text(
                          o.status === "expired"
                            ? "Ưu đãi đã hết hạn"
                            : o.status === "unavailable"
                              ? "Tạm hết hàng"
                              : o.shipping === null
                                ? "Chưa biết phí giao hàng — không phải tổng giá đầy đủ"
                                : `Giá máy ${money(o.base)} · giao hàng ${money(o.shipping)}${o.fee ? " · phí khác " + money(o.fee) : ""}`,
                          { fontSize: 11, color: C.muted, lineHeight: 19 },
                        )}
                        {o.coupon > 0 &&
                          text(
                            `Có giảm ${money(o.coupon)} nếu đủ điều kiện. ${o.eligible ? "Đã tính trong tổng." : "Chưa xác nhận, chưa trừ vào tổng."}`,
                            { fontSize: 11, color: C.warning, lineHeight: 19 },
                          )}
                        <View
                          style={[
                            S.row,
                            {
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                            },
                          ]}
                        >
                          {text(OBSERVED_AT + " · thời điểm mẫu", {
                            fontSize: 9,
                            color: C.muted,
                          })}
                          <Button
                            small
                            secondary
                            disabled={o.status !== "current"}
                            onPress={() => {
                              setSelectedOffer(o.id);
                              setSheet("offer");
                            }}
                            icon="right"
                          >
                            Xem đề nghị
                          </Button>
                        </View>
                      </View>
                    ))}
                  <View style={[S.row, { flexWrap: "wrap" }]}>
                    <Button
                      onPress={() => {
                        toggleCompare(p.id);
                      }}
                      icon={compare.includes(p.id) ? "check" : "plus"}
                    >
                      {compare.includes(p.id)
                        ? "Đã chọn so sánh"
                        : "Thêm vào so sánh"}
                    </Button>
                    {compare.length > 0 && (
                      <Button
                        secondary
                        onPress={() => navigate("compare")}
                        icon="compare"
                      >
                        Mở so sánh ({compare.length}/2)
                      </Button>
                    )}
                  </View>
                </>
              )}
              {sheet === "offer" &&
                (() => {
                  const o = offers.find((o) => o.id === selectedOffer);
                  if (!o) return null;
                  const v = PRODUCTS.find((p) => p.id === o.productId)!;
                  return (
                    <>
                      {text("Một bước rõ ràng, trước khi mua.", {
                        fontSize: 30,
                        fontWeight: "550",
                        lineHeight: 38,
                        letterSpacing: -0.8,
                      })}
                      {text(`${v.name} · ${v.ram} GB RAM · ${v.ssd} GB SSD`, {
                        fontSize: 14,
                      })}
                      {[
                        ["Cửa hàng giả lập", o.seller],
                        ["Giá máy", money(o.base)],
                        [
                          "Giao hàng",
                          o.shipping === null ? "Chưa rõ" : money(o.shipping),
                        ],
                        ["Chi phí bắt buộc khác", money(o.fee)],
                        [
                          "Tổng mẫu",
                          total(o) === null
                            ? "Chưa có tổng đầy đủ"
                            : money(total(o)!),
                        ],
                      ].map(([a, b]) => (
                        <View
                          key={a}
                          style={[
                            S.row,
                            {
                              justifyContent: "space-between",
                              borderBottomWidth: 1,
                              borderColor: C.line,
                              paddingBottom: 12,
                              gap: 20,
                            },
                          ]}
                        >
                          {text(a, { fontSize: 13, color: C.muted, flex: 1 })}
                          {text(b, {
                            fontSize: 14,
                            fontWeight: "600",
                            textAlign: "right",
                            flex: 1,
                          })}
                        </View>
                      ))}
                      {o.coupon > 0 &&
                        text(
                          `Mã giảm ${money(o.coupon)} ${o.eligible ? "đã được xác nhận trong kịch bản mẫu." : "chưa đủ điều kiện, không trừ vào tổng."}`,
                          { fontSize: 12, color: C.warning, lineHeight: 21 },
                        )}
                      <View style={S.warning}>
                        <Icon name="info" size={20} color={C.warning} />
                        {text(
                          "Đây là dữ liệu mô phỏng. Không có cửa hàng thật, giao dịch, thanh toán hay chính sách bảo hành đã xác minh.",
                          {
                            fontSize: 12,
                            color: C.warning,
                            lineHeight: 22,
                            flex: 1,
                          },
                        )}
                      </View>
                      <Button
                        onPress={() => saveDecision([v.id])}
                        icon="bookmark"
                      >
                        Lưu để xem lại
                      </Button>
                      <Button
                        secondary
                        onPress={() => setSheet("detail")}
                        icon="left"
                      >
                        Quay lại chi tiết
                      </Button>
                    </>
                  );
                })()}
              {sheet === "adviser" && (
                <>
                  {text("Hiểu thêm, rồi hãy chọn.", {
                    fontSize: 30,
                    fontWeight: "550",
                    letterSpacing: -0.7,
                  })}
                  <View style={S.row}>
                    <Tag label={p.name} icon="layers" />
                    {text("Theo hồ sơ hiện tại", {
                      fontSize: 11,
                      color: C.muted,
                    })}
                  </View>
                  <View style={[S.warning, { backgroundColor: C.green }]}>
                    <Icon name="info" size={17} color={C.brand} />
                    {text(
                      "Trợ lý mô phỏng · Giải thích theo quy tắc, không kết nối mô hình AI.",
                      { fontSize: 11, color: C.brand, lineHeight: 19, flex: 1 },
                    )}
                  </View>
                  <View style={{ gap: 9 }}>
                    {[
                      "Máy này có hợp với tôi không?",
                      "Có lựa chọn nào rẻ hơn?",
                      "RAM này có đủ cho máy ảo không?",
                    ].map((q) => (
                      <Pressable
                        key={q}
                        accessibilityRole="button"
                        onPress={() => submitAsk(q)}
                        style={S.question}
                      >
                        {text(q, { fontSize: 13, flex: 1 })}
                        <Icon name="up" size={15} color={C.muted} />
                      </Pressable>
                    ))}
                  </View>
                  {(busy || answer) && (
                    <View
                      accessibilityLiveRegion="polite"
                      style={{
                        padding: 20,
                        borderRadius: 15,
                        backgroundColor: C.soft,
                        gap: 10,
                      }}
                    >
                      <View style={S.row}>
                        <View style={S.smallDot} />
                        {text(
                          busy
                            ? "Đang đối chiếu bộ mẫu..."
                            : assistantOffline
                              ? "Đối chiếu dự phòng"
                              : "Giải thích theo quy tắc",
                          { fontSize: 11, color: C.brand, fontWeight: "600" },
                        )}
                      </View>
                      {answer && text(answer, { fontSize: 13, lineHeight: 24 })}
                    </View>
                  )}
                  <View style={[S.row, { alignItems: "center" }]}>
                    <TextInput
                      testID="adviser-input"
                      accessibilityLabel="Câu hỏi cho trợ lý mô phỏng"
                      value={ask}
                      onChangeText={setAsk}
                      onSubmitEditing={() => submitAsk()}
                      placeholder="Hỏi thêm về lựa chọn này..."
                      style={[S.input, { flex: 1 }]}
                    />
                    <Button
                      onPress={() => submitAsk()}
                      disabled={busy || !ask.trim()}
                      icon="send"
                    >
                      Gửi
                    </Button>
                  </View>
                </>
              )}
              {sheet === "info" && (
                <>
                  {text("Chọn đúng, dùng lâu.", {
                    fontSize: 32,
                    fontWeight: "550",
                    letterSpacing: -1,
                  })}
                  {text(
                    "Lựa là bản demo trải nghiệm chọn laptop theo nhu cầu, từ hồ sơ đến so sánh và lưu quyết định.",
                    { fontSize: 14, color: C.muted, lineHeight: 25 },
                  )}
                  {[
                    [
                      "Dữ liệu minh bạch",
                      "12 cấu hình, 18 đề nghị bán và 3 cửa hàng đều được tạo cho bản demo. Không phải giá hay đánh giá máy thật.",
                    ],
                    [
                      "Lựa chọn có lý do",
                      "Ngân sách và yêu cầu bắt buộc được kiểm tra bằng quy tắc. Chưa rõ thông tin không có nghĩa là đã đáp ứng.",
                    ],
                    [
                      "Thông tin trong tầm tay",
                      "Các quyết định và giá sửa trong xưởng được lưu trên trình duyệt khi tính năng lưu được cho phép. Không có tài khoản hay đồng bộ.",
                    ],
                    [
                      "AI vẫn là bước tiếp theo",
                      "Trợ lý hiện giải thích theo quy tắc mô phỏng; chưa gọi một mô hình AI thực.",
                    ],
                  ].map(([a, b]) => (
                    <View key={a} style={{ gap: 7 }}>
                      {text(a, { fontSize: 15, fontWeight: "600" })}
                      {text(b, {
                        fontSize: 12,
                        color: C.muted,
                        lineHeight: 22,
                      })}
                    </View>
                  ))}
                  <Button onPress={() => setSheet(null)} icon="check">
                    Đã hiểu, tiếp tục khám phá
                  </Button>
                </>
              )}
              {sheet === "settings" && (
                <>
                  {text("Quyết định của bạn,\ntrên thiết bị của bạn.", {
                    fontSize: 29,
                    fontWeight: "550",
                    lineHeight: 37,
                    letterSpacing: -0.8,
                  })}
                  {text(
                    `Đang lưu ${saved.length} phương án · Bộ mẫu ${DATASET_VERSION}`,
                    { fontSize: 13, color: C.muted },
                  )}
                  <Button
                    secondary
                    onPress={() => navigate("studio")}
                    icon="settings"
                  >
                    Mở xưởng dữ liệu mẫu
                  </Button>
                  <Button
                    secondary
                    onPress={() => {
                      setProfile(SAMPLE_PROFILE);
                      setAll(false);
                      notify(
                        "Đã khôi phục hồ sơ mẫu, giữ các phương án đã lưu.",
                      );
                      setSheet(null);
                    }}
                    icon="reset"
                  >
                    Khôi phục hồ sơ mặc định
                  </Button>
                  <Button
                    secondary
                    onPress={() => {
                      setSaved([]);
                      notify(
                        "Đã xóa tất cả phương án đã lưu trên thiết bị này.",
                      );
                    }}
                    icon="trash"
                  >
                    Xóa các phương án đã lưu
                  </Button>
                  <Button
                    secondary
                    onPress={() => {
                      setOffers(OFFERS);
                      setProfile(SAMPLE_PROFILE);
                      setCompare([]);
                      setSaved([]);
                      setSaveError("");
                      setStorageBlocked(false);
                      setAssistantOffline(false);
                      setQuery("");
                      setAll(false);
                      setShowMore(false);
                      setRoute("discover");
                      setSheet(null);
                      notify("Đã đặt lại toàn bộ kịch bản mẫu.");
                    }}
                    icon="reset"
                  >
                    Đặt lại toàn bộ demo
                  </Button>
                  {text(
                    "Xóa và đặt lại chỉ áp dụng cho dữ liệu của bản demo trên trình duyệt này. Không có dữ liệu tài khoản trên máy chủ.",
                    { fontSize: 11, color: C.muted, lineHeight: 21 },
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function validProfile(p: Profile) {
  return (
    !!p &&
    Number.isSafeInteger(p.budget) &&
    p.budget >= 1000000 &&
    p.budget <= 200000000 &&
    Array.isArray(p.tasks) &&
    p.tasks.length > 0 &&
    p.tasks.every((t) => TASKS.some((x) => x.id === t)) &&
    Array.isArray(p.priorities) &&
    p.priorities.length <= 2 &&
    p.priorities.every((t) => PRIORITIES.some((x) => x.id === t)) &&
    ["one", "many", "unknown"].includes(p.vm)
  );
}
function validOffer(o: Offer) {
  return (
    !!o &&
    OFFERS.some(
      (x) =>
        x.id === o.id && x.productId === o.productId && x.seller === o.seller,
    ) &&
    Number.isSafeInteger(o.base) &&
    o.base > 0 &&
    o.base <= 200000000 &&
    (o.shipping === null ||
      (Number.isSafeInteger(o.shipping) && o.shipping >= 0)) &&
    Number.isSafeInteger(o.fee) &&
    o.fee >= 0 &&
    o.fee <= 200000000 &&
    Number.isSafeInteger(o.coupon) &&
    o.coupon >= 0 &&
    o.coupon <= o.base &&
    typeof o.eligible === "boolean" &&
    ["current", "expired", "unavailable"].includes(o.status)
  );
}
function validDecision(d: Decision) {
  return (
    !!d &&
    typeof d.id === "string" &&
    typeof d.name === "string" &&
    validProfile(d.profile) &&
    Array.isArray(d.productIds) &&
    d.productIds.length > 0 &&
    d.productIds.length <= 2 &&
    d.productIds.every((id) => PRODUCTS.some((p) => p.id === id)) &&
    Number.isFinite(Date.parse(d.savedAt)) &&
    d.datasetVersion === DATASET_VERSION &&
    (d.observations === undefined ||
      (Array.isArray(d.observations) &&
        d.observations.every(
          (o) =>
            d.productIds.includes(o.productId) &&
            (o.total === null ||
              (Number.isSafeInteger(o.total) && o.total > 0)) &&
            typeof o.observedAt === "string" &&
            typeof o.assessment === "string" &&
            (o.seller === null || typeof o.seller === "string"),
        )))
  );
}
function shareDecision(d: Decision, notify: (s: string) => void) {
  if (typeof document === "undefined") return;
  const content = `LỰA · PHƯƠNG ÁN MẪU\n${d.name}\nTrần ngân sách: ${money(d.profile.budget)}\nTác vụ: ${d.profile.tasks.map((t) => TASKS.find((x) => x.id === t)?.name).join(", ")}\nLưu lúc: ${d.savedAt}\nCấu hình: ${d.productIds
    .map((id) => {
      const p = PRODUCTS.find((x) => x.id === id)!;
      const o = d.observations?.find((o) => o.productId === id);
      return `${p.name} — ${p.ram} GB RAM, ${p.ssd} GB SSD\n${o ? `Tổng giá mẫu lúc lưu: ${o.total === null ? "Chưa đầy đủ" : money(o.total)} · ${o.seller || "Chưa rõ cửa hàng"}\nThời điểm quan sát mẫu: ${o.observedAt}\nĐối chiếu nhu cầu: ${o.assessment}` : "Chưa có ảnh chụp giá khi lưu."}\nCần cân nhắc: ${p.limitation}`;
    })
    .join(
      "\n",
    )}\n\nToàn bộ cấu hình, giá và nhận xét trong demo là giả lập. Tệp không phải báo giá hoặc đánh giá thiết bị thật.`;
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "lua-phuong-an-mau.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify("Đã xuất bản tóm tắt có nhãn dữ liệu mẫu.");
}

const S: Record<string, any> = {
  text: {
    fontFamily:
      Platform.OS === "web" ? "Segoe UI, Arial, sans-serif" : "System",
    color: C.text,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 9 },
  sidebar: {
    width: 220,
    padding: 25,
    paddingTop: 29,
    borderRightWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surface,
  },
  brandMark: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: C.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.4,
    color: C.muted,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: 9,
  },
  navActive: { backgroundColor: C.green },
  navCount: {
    fontSize: 10,
    color: C.artInk,
    backgroundColor: "#d9e8ce",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  avatar: {
    width: 33,
    height: 33,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.green,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  search: { flexDirection: "row", alignItems: "center", gap: 12 },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: C.text,
    paddingVertical: 8,
    minWidth: 0,
    outlineStyle: "none",
  },
  demoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#dbe7ce",
    borderRadius: 6,
    backgroundColor: "#f2f6e9",
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#819e4d" },
  smallDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: "#83a469",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    minHeight: 46,
    paddingHorizontal: 19,
    borderRadius: 9,
    borderWidth: 1,
  },
  primary: { backgroundColor: C.action, borderColor: C.action },
  secondary: { backgroundColor: C.surface, borderColor: C.line },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    minHeight: 34,
    maxWidth: "100%",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 7,
    backgroundColor: C.surface,
  },
  profileBar: {
    padding: 15,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    gap: 13,
    backgroundColor: C.surface,
  },
  tab: { paddingBottom: 10, borderBottomWidth: 2, borderColor: "transparent" },
  activeTab: { borderColor: C.brand },
  card: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 15,
    backgroundColor: C.surface,
    overflow: "hidden",
  },
  art: { padding: 14, borderRadius: 11, margin: 7, marginBottom: 0 },
  artTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  artBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  spec: {
    fontSize: 10,
    color: C.muted,
    paddingRight: 7,
    borderRightWidth: 1,
    borderColor: C.line,
  },
  divider: { height: 1, backgroundColor: C.line },
  compareButton: {
    minHeight: 36,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  aside: {
    width: 205,
    padding: 23,
    paddingRight: 0,
    borderLeftWidth: 1,
    borderColor: C.line,
  },
  insight: {
    padding: 21,
    borderRadius: 12,
    backgroundColor: C.soft,
    gap: 18,
    alignItems: "center",
    justifyContent: "space-between",
  },
  insightIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    padding: 35,
    paddingVertical: 60,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: C.line,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    backgroundColor: C.surface,
  },
  warning: {
    backgroundColor: "#faf2e5",
    padding: 14,
    borderRadius: 9,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  mobileNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: 10,
    paddingBottom: 14,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderColor: C.line,
    boxShadow: "0 -4px 15px rgba(30,48,38,.04)",
  },
  mobileNavItem: {
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  compareFloat: {
    position: "fixed",
    bottom: 24,
    right: 33,
    zIndex: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
    paddingHorizontal: 20,
    paddingVertical: 17,
    borderRadius: 12,
    backgroundColor: C.action,
    boxShadow: "0 6px 30px rgba(25,60,40,.15)",
  },
  toast: {
    position: "fixed",
    left: "50%",
    transform: [{ translateX: "-50%" }],
    zIndex: 100,
    backgroundColor: C.action,
    padding: 16,
    borderRadius: 11,
    maxWidth: 500,
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 6px 20px rgba(20,50,30,.2)",
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(16,34,26,.43)",
  },
  sheet: {
    backgroundColor: C.surface,
    borderRadius: 20,
    boxShadow: "0 20px 90px rgba(15,30,20,.15)",
    overflow: "hidden",
    flexShrink: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 9,
    padding: 14,
    fontSize: 14,
    color: C.text,
    backgroundColor: C.surface,
  },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 16,
    minHeight: 76,
  },
  choiceSelected: { backgroundColor: C.green, borderColor: "#9db994" },
  choiceIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2ebdd",
    borderRadius: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  question: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
  },
};
