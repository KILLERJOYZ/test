import React from "react";
import { Text, View } from "react-native";
import type { ExpressiveColors } from "./expressive-theme";

export type RetailerMeta = {
  id: string;
  label: string;
  shortMark: string;
};

const RETAILERS: Record<string, RetailerMeta> = {
  fptshop: { id: "fptshop", label: "FPT Shop", shortMark: "FPT" },
  thegioididong: {
    id: "thegioididong",
    label: "Thế Giới Di Động",
    shortMark: "TG",
  },
  dienmayxanh: {
    id: "dienmayxanh",
    label: "Điện Máy Xanh",
    shortMark: "ĐMX",
  },
  cellphones: { id: "cellphones", label: "CellphoneS", shortMark: "CPS" },
  gearvn: { id: "gearvn", label: "GearVN", shortMark: "GVN" },
  phongvu: { id: "phongvu", label: "Phong Vũ", shortMark: "PV" },
  hacom: { id: "hacom", label: "HACOM", shortMark: "HC" },
  laptopaz: { id: "laptopaz", label: "LaptopAZ", shortMark: "AZ" },
  trungtran: { id: "trungtran", label: "Trung Trần", shortMark: "TT" },
  apple: { id: "apple", label: "Apple", shortMark: "AP" },
  samsung: { id: "samsung", label: "Samsung", shortMark: "SS" },
  "manual-quote": {
    id: "manual-quote",
    label: "Báo giá ngoài",
    shortMark: "BG",
  },
};

export function retailerDisplayName(source: string): string {
  if (!source) return "Mọi nguồn";
  const key = source.trim().toLowerCase();
  return RETAILERS[key]?.label ?? source;
}

export function retailerMeta(source: string): RetailerMeta {
  const key = source.trim().toLowerCase();
  if (RETAILERS[key]) return RETAILERS[key];
  const fallbackMark = source.slice(0, 2).toUpperCase() || "VN";
  return {
    id: key || "all",
    label: source || "Mọi nguồn",
    shortMark: key ? fallbackMark : "TẤT",
  };
}

export function RetailerBadge({
  source,
  colors: c,
  selected = false,
  compact = false,
}: {
  source: string;
  colors: ExpressiveColors;
  selected?: boolean;
  compact?: boolean;
}) {
  const meta = retailerMeta(source);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        paddingVertical: compact ? 3 : 5,
        paddingHorizontal: compact ? 8 : 10,
        borderRadius: 999,
        backgroundColor: selected ? c.accent : c.container,
        borderWidth: 1,
        borderColor: selected ? c.accent : c.line,
      }}
    >
      <View
        style={{
          minWidth: 22,
          height: 20,
          paddingHorizontal: 4,
          borderRadius: 6,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: selected ? c.onAccent : c.accent,
        }}
      >
        <Text
          accessible={false}
          style={{
            fontSize: 10,
            lineHeight: 13,
            fontWeight: "800",
            color: selected ? c.accent : c.onAccent,
          }}
        >
          {meta.shortMark}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        style={{
          fontSize: compact ? 12 : 13,
          lineHeight: compact ? 16 : 18,
          fontWeight: "700",
          color: selected ? c.onAccent : c.onContainer,
        }}
      >
        {meta.label}
      </Text>
    </View>
  );
}

