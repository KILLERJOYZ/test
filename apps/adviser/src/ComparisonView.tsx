import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  assess,
  budgetUpgradeCandidates,
  INITIAL_REQUIREMENTS,
  MAX_COMPARE_ITEMS,
  taskGuidance,
} from "./catalog";
import type { Catalog, Listing, Requirements } from "./catalog";
import { listingEvidence } from "./listing-evidence";
import type { ExpressiveColors } from "./expressive-theme";
import { EXPRESSIVE_SHAPE, EXPRESSIVE_SPACE } from "./expressive-theme";
import { ExpressiveButton } from "./ExpressiveButton";
import { ExpressiveSurface } from "./ExpressiveSurface";
import { RetailerBadge, retailerDisplayName } from "./RetailerBadge";
import { formatVnd } from "./i18n";

const STICKY_LABEL_WIDTH = 108;
const MOBILE_COLUMN_WIDTH = 188;
const ROW_MIN_HEIGHT = 76;

export function ComparisonView({
  items,
  catalog,
  requirements = INITIAL_REQUIREMENTS,
  expanded,
  colors: c,
  reduceMotion,
  onRemove,
  onSwap,
  onOpen,
  onBrowse,
}: {
  items: Listing[];
  catalog?: Catalog;
  requirements?: Requirements;
  expanded: boolean;
  colors: ExpressiveColors;
  reduceMotion: boolean;
  onRemove: (id: string) => void;
  onSwap?: (oldId: string, newId: string) => void;
  onOpen: (v: Listing) => void;
  onBrowse: () => void;
}) {
  const [swappingId, setSwappingId] = useState<string | null>(null);
  const [upgradeDelta, setUpgradeDelta] = useState<number | null>(null);

  const fields: readonly [string, (v: Listing) => string][] = [
    [
      "Giá quan sát",
      (v) => formatVnd(v.advertisedPrice),
    ],
    [
      "Niêm yết / Ưu đãi",
      (v) =>
        v.priceOriginal
          ? `${formatVnd(v.priceOriginal)}${v.discountPercent ? ` (-${v.discountPercent}%)` : ""}${v.installment ? ` · ${v.installment}` : ""}`
          : "Chưa rõ",
    ],
    [
      "Tổng chi phí",
      (v) => {
        const t = assess(v, requirements).total;
        return t === null ? "Chưa đủ phí bắt buộc" : formatVnd(t);
      },
    ],
    ["CPU", (v) => v.cpu ?? "Chưa rõ"],
    ["Card đồ họa", (v) => v.gpu ?? "Chưa rõ"],
    [
      "RAM",
      (v) => {
        const n = listingEvidence(v).ram;
        return n === null ? "Chưa xác minh" : `${n} GB`;
      },
    ],
    [
      "Ổ lưu trữ",
      (v) => {
        const n = listingEvidence(v).storage;
        return n === null ? "Chưa xác minh" : `${n} GB`;
      },
    ],
    ["Màn hình", (v) => v.screen ?? "Chưa rõ"],
    ["Khối lượng", (v) => v.weight ?? "Chưa rõ"],
    ["Pin", (v) => v.battery ?? "Chưa rõ"],
    ["Thương hiệu", (v) => v.brand ?? "Chưa rõ"],
    [
      "Theo nhu cầu",
      (v) => {
        const a = assess(v, requirements);
        const g = taskGuidance(v, requirements);
        if (a.failed.length) return "Không đạt: " + a.failed.join("; ");
        return (
          [...g.strengths, ...g.caveats].slice(0, 2).join(" · ") ||
          "Đạt tiêu chí cứng đã biết"
        );
      },
    ],
    ["Nhà bán", (v) => retailerDisplayName(v.source)],
    [
      "Ngày quan sát",
      (v) => new Date(v.observedAt).toLocaleDateString("vi-VN"),
    ],
  ];

  const swapPool = catalog
    ? catalog.listings
        .filter(
          (x) =>
            !items.some((cur) => cur.id === x.id) &&
            assess(x, requirements).state !== "excluded",
        )
        .slice(0, 8)
    : [];

  const upgradeCandidates =
    catalog && upgradeDelta
      ? budgetUpgradeCandidates(catalog, requirements, upgradeDelta, 3)
      : [];

  return (
    <ExpressiveSurface
      key={items.map((v) => v.id).join(":")}
      reduceMotion={reduceMotion}
    >
      <Text
        accessibilityRole="header"
        style={{ fontSize: 26, lineHeight: 34, fontWeight: "800", color: c.text }}
      >
        Đặt cạnh nhau (tối đa {MAX_COMPARE_ITEMS} cấu hình)
      </Text>
      {items.length === 0 && (
        <Text style={{ color: c.muted, lineHeight: 22 }}>
          Chọn từ 2 đến {MAX_COMPARE_ITEMS} cấu hình trong danh sách để đối chiếu song song.
        </Text>
      )}
      {items.length === 1 && (
        <Text style={{ color: c.muted, lineHeight: 22 }}>
          Đã chọn 1 cấu hình. Chọn thêm ít nhất 1 cấu hình nữa (tối đa {MAX_COMPARE_ITEMS}) để thấy điểm khác biệt.
        </Text>
      )}

      {swappingId && swapPool.length > 0 && onSwap && (
        <View
          style={{
            padding: EXPRESSIVE_SPACE.md,
            borderRadius: EXPRESSIVE_SHAPE.card,
            backgroundColor: c.container,
            borderWidth: 1,
            borderColor: c.line,
            gap: EXPRESSIVE_SPACE.sm,
          }}
        >
          <Text style={{ fontWeight: "700", color: c.onContainer }}>
            Chọn cấu hình thay thế cho cột đang chọn:
          </Text>
          {swapPool.map((cand) => (
            <Pressable
              key={cand.id}
              accessibilityRole="button"
              accessibilityLabel={`Đổi sang ${cand.name}`}
              onPress={() => {
                onSwap(swappingId, cand.id);
                setSwappingId(null);
              }}
              style={{
                minHeight: 48,
                padding: 12,
                borderRadius: 14,
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.line,
                justifyContent: "center",
              }}
            >
              <Text style={{ fontWeight: "700", color: c.text }} numberOfLines={1}>
                {cand.name}
              </Text>
              <Text style={{ fontSize: 13, color: c.muted }}>
                {retailerDisplayName(cand.source)} · {formatVnd(cand.advertisedPrice)}
              </Text>
            </Pressable>
          ))}
          <ExpressiveButton
            label="Đóng chọn thay thế"
            secondary
            onPress={() => setSwappingId(null)}
            colors={c}
            reduceMotion={reduceMotion}
          />
        </View>
      )}

      {items.length > 0 && expanded && (
        <View
          style={{
            borderRadius: EXPRESSIVE_SHAPE.card,
            borderWidth: 1,
            borderColor: c.line,
            backgroundColor: c.card,
            overflow: "hidden",
          }}
        >
          {/* Header Row on Expanded (>= 840dp): 1 label column + up to 4 product columns */}
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderColor: c.line,
              backgroundColor: c.container,
            }}
          >
            <View
              style={{
                width: 148,
                padding: 14,
                justifyContent: "center",
                borderRightWidth: 1,
                borderColor: c.line,
              }}
            >
              <Text style={{ fontWeight: "800", color: c.onContainer }}>
                Thuộc tính ({items.length}/{MAX_COMPARE_ITEMS})
              </Text>
            </View>
            {items.map((v) => (
              <View
                key={v.id}
                style={{
                  flex: 1,
                  padding: 14,
                  gap: 8,
                  borderRightWidth: 1,
                  borderColor: c.line,
                }}
              >
                <RetailerBadge source={v.source} colors={c} compact />
                <Text
                  accessibilityRole="header"
                  numberOfLines={2}
                  style={{ fontSize: 16, lineHeight: 22, fontWeight: "700", color: c.text }}
                >
                  {v.name}
                </Text>
                {listingEvidence(v).conflicts.map((x) => (
                  <Text key={x} accessibilityRole="alert" style={{ fontSize: 12, color: c.error }}>
                    {x}
                  </Text>
                ))}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                  <ExpressiveButton
                    label="Chi tiết"
                    onPress={() => onOpen(v)}
                    colors={c}
                    reduceMotion={reduceMotion}
                  />
                  {onSwap && swapPool.length > 0 && (
                    <ExpressiveButton
                      label="Đổi máy"
                      secondary
                      onPress={() => setSwappingId(swappingId === v.id ? null : v.id)}
                      colors={c}
                      reduceMotion={reduceMotion}
                    />
                  )}
                  <ExpressiveButton
                    label="Bỏ"
                    secondary
                    onPress={() => onRemove(v.id)}
                    colors={c}
                    reduceMotion={reduceMotion}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Attribute Rows on Expanded */}
          {fields.map(([label, get]) => {
            const values = items.map((v) => get(v));
            const differs = items.length > 1 && new Set(values).size > 1;
            return (
              <View
                key={label}
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderColor: c.line,
                  backgroundColor: differs ? c.container : c.card,
                }}
              >
                <View
                  style={{
                    width: 148,
                    padding: 12,
                    justifyContent: "center",
                    borderRightWidth: 1,
                    borderColor: c.line,
                  }}
                >
                  <Text style={{ fontWeight: "700", fontSize: 14, color: differs ? c.onContainer : c.muted }}>
                    {label}
                  </Text>
                </View>
                {items.map((v, i) => {
                  const val = values[i];
                  return (
                    <View
                      key={v.id}
                      accessible
                      accessibilityLabel={`Máy ${i + 1} (${v.name}), ${label}: ${val}`}
                      style={{
                        flex: 1,
                        padding: 12,
                        justifyContent: "center",
                        borderRightWidth: 1,
                        borderColor: c.line,
                      }}
                    >
                      <Text
                        selectable
                        style={{
                          color: c.text,
                          fontSize: 14,
                          lineHeight: 20,
                          fontWeight: differs ? "700" : "400",
                          fontVariant: ["tabular-nums"],
                        }}
                      >
                        {val}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      )}

      {items.length > 0 && !expanded && (
        <View
          style={{
            flexDirection: "row",
            borderRadius: EXPRESSIVE_SHAPE.card,
            borderWidth: 1,
            borderColor: c.line,
            backgroundColor: c.card,
            overflow: "hidden",
          }}
        >
          {/* Sticky Left Attribute Column (< 840dp) */}
          <View
            style={{
              width: STICKY_LABEL_WIDTH,
              borderRightWidth: 1,
              borderColor: c.line,
              backgroundColor: c.container,
            }}
          >
            <View
              style={{
                height: 212,
                padding: 10,
                justifyContent: "center",
                borderBottomWidth: 1,
                borderColor: c.line,
              }}
            >
              <Text style={{ fontWeight: "800", fontSize: 13, color: c.onContainer }}>
                Cấu hình ({items.length}/{MAX_COMPARE_ITEMS})
              </Text>
              <Text style={{ fontSize: 12, color: c.muted, marginTop: 4 }}>
                Vuốt ngang để xem thêm →
              </Text>
            </View>
            {fields.map(([label, get]) => {
              const values = items.map((v) => get(v));
              const differs = items.length > 1 && new Set(values).size > 1;
              return (
                <View
                  key={label}
                  style={{
                    height: ROW_MIN_HEIGHT,
                    paddingHorizontal: 10,
                    justifyContent: "center",
                    borderBottomWidth: 1,
                    borderColor: c.line,
                  }}
                >
                  <Text
                    numberOfLines={2}
                    style={{
                      fontWeight: "700",
                      fontSize: 13,
                      lineHeight: 17,
                      color: differs ? c.accent : c.onContainer,
                    }}
                  >
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Horizontally Scrollable Product Columns */}
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View style={{ flexDirection: "row" }}>
              {items.map((v, colIdx) => (
                <View
                  key={v.id}
                  style={{
                    width: MOBILE_COLUMN_WIDTH,
                    borderRightWidth: 1,
                    borderColor: c.line,
                  }}
                >
                  <View
                    style={{
                      height: 212,
                      padding: 10,
                      gap: 6,
                      justifyContent: "space-between",
                      borderBottomWidth: 1,
                      borderColor: c.line,
                      backgroundColor: c.card,
                    }}
                  >
                    <View style={{ gap: 4 }}>
                      <RetailerBadge source={v.source} colors={c} compact />
                      <Text
                        accessibilityRole="header"
                        numberOfLines={2}
                        style={{
                          fontSize: 14,
                          lineHeight: 19,
                          fontWeight: "700",
                          color: c.text,
                        }}
                      >
                        {v.name}
                      </Text>
                    </View>
                    <View style={{ gap: 6 }}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Chi tiết ${v.name}`}
                        onPress={() => onOpen(v)}
                        style={{
                          minHeight: 40,
                          borderRadius: 12,
                          backgroundColor: c.accent,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingHorizontal: 8,
                        }}
                      >
                        <Text style={{ color: c.onAccent, fontWeight: "700", fontSize: 13 }}>
                          Chi tiết
                        </Text>
                      </Pressable>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        {onSwap && swapPool.length > 0 && (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Đổi máy ${v.name}`}
                            onPress={() => setSwappingId(swappingId === v.id ? null : v.id)}
                            style={{
                              flex: 1,
                              minHeight: 38,
                              borderRadius: 12,
                              backgroundColor: c.container,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ color: c.onContainer, fontWeight: "700", fontSize: 12 }}>
                              Đổi máy
                            </Text>
                          </Pressable>
                        )}
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Bỏ ${v.name}`}
                          onPress={() => onRemove(v.id)}
                          style={{
                            flex: 1,
                            minHeight: 38,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: c.line,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ color: c.text, fontWeight: "700", fontSize: 12 }}>
                            Bỏ
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>

                  {fields.map(([label, get]) => {
                    const values = items.map((item) => get(item));
                    const differs = items.length > 1 && new Set(values).size > 1;
                    const val = values[colIdx];
                    return (
                      <View
                        key={label}
                        accessible
                        accessibilityLabel={`Máy ${colIdx + 1} (${v.name}), ${label}: ${val}`}
                        style={{
                          height: ROW_MIN_HEIGHT,
                          paddingHorizontal: 10,
                          justifyContent: "center",
                          borderBottomWidth: 1,
                          borderColor: c.line,
                          backgroundColor: differs ? c.container : c.card,
                        }}
                      >
                        <Text
                          selectable
                          numberOfLines={3}
                          style={{
                            color: c.text,
                            fontSize: 13,
                            lineHeight: 18,
                            fontWeight: differs ? "700" : "400",
                            fontVariant: ["tabular-nums"],
                          }}
                        >
                          {val}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* "Thêm ngân sách được gì?" Trade-off Card (STT 7.0) */}
      {catalog && items.length > 0 && (
        <View
          style={{
            padding: EXPRESSIVE_SPACE.md,
            borderRadius: EXPRESSIVE_SHAPE.card,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.line,
            gap: EXPRESSIVE_SPACE.sm,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 16, color: c.text }}>
            Thêm ngân sách được gì? (tham khảo đánh đổi, không tự nới trần)
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[2000000, 5000000].map((delta) => (
              <ExpressiveButton
                key={delta}
                label={`+${formatVnd(delta)}`}
                secondary={upgradeDelta !== delta}
                selected={upgradeDelta === delta}
                onPress={() => setUpgradeDelta(upgradeDelta === delta ? null : delta)}
                colors={c}
                reduceMotion={reduceMotion}
              />
            ))}
          </View>
          {upgradeDelta !== null &&
            (upgradeCandidates.length === 0 ? (
              <Text style={{ color: c.muted, fontSize: 14 }}>
                Chưa có cấu hình nào vượt trần trong khoảng +{formatVnd(upgradeDelta)} mà đạt đủ tiêu chí cứng.
              </Text>
            ) : (
              upgradeCandidates.map((u) => (
                <Pressable
                  key={u.listing.id}
                  accessibilityRole="button"
                  onPress={() => onOpen(u.listing)}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    backgroundColor: c.container,
                    gap: 4,
                  }}
                >
                  <Text style={{ fontWeight: "700", color: c.onContainer }}>
                    {u.listing.name} (+{formatVnd(u.extraVnd)})
                  </Text>
                  <Text style={{ fontSize: 13, color: c.muted }}>
                    {u.listing.cpu ?? "CPU chưa rõ"} · RAM {u.listing.ram ?? "?"} GB · SSD {u.listing.storage ?? "?"} GB · {formatVnd(u.listing.advertisedPrice)}
                  </Text>
                </Pressable>
              ))
            ))}
        </View>
      )}

      <Text style={{ color: c.muted, lineHeight: 22 }}>
        Giá lịch sử. Tổng thanh toán, tồn kho và năng lực tác vụ chưa xác minh. Khác biệt được tô nền để dễ nhận diện.
      </Text>
      <ExpressiveButton
        label={
          items.length < MAX_COMPARE_ITEMS
            ? `Chọn thêm cấu hình (${items.length}/${MAX_COMPARE_ITEMS})`
            : "Quay lại danh sách"
        }
        onPress={onBrowse}
        secondary
        colors={c}
        reduceMotion={reduceMotion}
      />
    </ExpressiveSurface>
  );
}
