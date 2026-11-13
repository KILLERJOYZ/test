import React from "react";
import { Text, View } from "react-native";
import type { Listing } from "./catalog";
import { listingEvidence } from "./listing-evidence";
import type { ExpressiveColors } from "./expressive-theme";
import { ExpressiveButton } from "./ExpressiveButton";
import { ExpressiveSurface } from "./ExpressiveSurface";
export function ComparisonView({
  items,
  expanded,
  colors: c,
  reduceMotion,
  onRemove,
  onOpen,
  onBrowse,
}: {
  items: Listing[];
  expanded: boolean;
  colors: ExpressiveColors;
  reduceMotion: boolean;
  onRemove: (id: string) => void;
  onOpen: (v: Listing) => void;
  onBrowse: () => void;
}) {
  const fields = [
    [
      "RAM",
      (v: Listing) => {
        const n = listingEvidence(v).ram;
        return n === null ? "Chưa xác minh" : `${n} GB`;
      },
    ],
    [
      "Ổ lưu trữ",
      (v: Listing) => {
        const n = listingEvidence(v).storage;
        return n === null ? "Chưa xác minh" : `${n} GB`;
      },
    ],
    ["CPU", (v: Listing) => v.cpu ?? "Chưa rõ"],
    [
      "Giá quan sát",
      (v: Listing) =>
        v.advertisedPrice === null
          ? "Chưa rõ"
          : v.advertisedPrice.toLocaleString("vi-VN") + " ₫",
    ],
    ["Nguồn", (v: Listing) => v.source],
    [
      "Ngày quan sát",
      (v: Listing) => new Date(v.observedAt).toLocaleString("vi-VN"),
    ],
  ] as const;
  return (
    <ExpressiveSurface
      key={items.map((v) => v.id).join(":")}
      reduceMotion={reduceMotion}
    >
      <Text
        accessibilityRole="header"
        style={{ fontSize: 28, fontWeight: "800", color: c.text }}
      >
        Đặt cạnh nhau. Chọn có căn cứ.
      </Text>
      {!items.length && (
        <Text style={{ color: c.muted }}>
          Chọn tối đa hai cấu hình để đối chiếu.
        </Text>
      )}
      <View style={{ flexDirection: expanded ? "row" : "column", gap: 12 }}>
        {items.map((v) => (
          <View
            key={v.id}
            style={{
              flex: expanded ? 1 : undefined,
              padding: 16,
              borderRadius: 28,
              backgroundColor: c.container,
              gap: 12,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                lineHeight: 26,
                fontWeight: "700",
                color: c.text,
              }}
            >
              {v.name}
            </Text>
            {listingEvidence(v).conflicts.map((x) => (
              <Text key={x} style={{ color: c.error }}>
                {x}
              </Text>
            ))}
            <ExpressiveButton
              label="Chi tiết"
              onPress={() => onOpen(v)}
              colors={c}
              reduceMotion={reduceMotion}
            />
            <ExpressiveButton
              label="Bỏ & chọn thay thế"
              onPress={() => {
                onRemove(v.id);
                onBrowse();
              }}
              secondary
              colors={c}
              reduceMotion={reduceMotion}
            />
          </View>
        ))}
      </View>
      {items.length > 0 &&
        fields.map(([label, get]) => (
          <View
            key={label}
            style={{
              gap: 8,
              padding: 16,
              borderRadius: 20,
              backgroundColor: c.card,
            }}
          >
            <Text style={{ color: c.muted, fontWeight: "700" }}>{label}</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {items.map((v, i) => (
                <View key={v.id} style={{ flex: 1, gap: 4 }}>
                  <Text style={{ color: c.muted, fontSize: 12 }}>
                    Máy {i + 1}
                  </Text>
                  <Text
                    selectable
                    style={{
                      color: c.text,
                      fontSize: 16,
                      lineHeight: 24,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {get(v)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      <Text style={{ color: c.muted, lineHeight: 22 }}>
        Giá lịch sử. Tổng thanh toán, tồn kho và năng lực tác vụ chưa xác minh.
        Khác biệt không phải kết luận máy tốt hơn.
      </Text>
      <ExpressiveButton
        label={items.length < 2 ? "Chọn thêm cấu hình" : "Thay đổi lựa chọn"}
        onPress={onBrowse}
        secondary
        colors={c}
        reduceMotion={reduceMotion}
      />
    </ExpressiveSurface>
  );
}
