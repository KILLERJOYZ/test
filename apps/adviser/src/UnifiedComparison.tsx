import React from "react";
import { Text, View } from "react-native";
import { useAdvisorTheme } from "./AdvisorTheme";
import { ExpressiveButton } from "./ExpressiveButton";
import { referenceAssessment, type Reference } from "./reference";
import type { Needs } from "./picker";
export function UnifiedComparison({
  rows,
  needs,
  onRemove,
}: {
  rows: Reference[];
  needs: Needs;
  onRemove: (id: string) => void;
}) {
  const { colors: c, reduceMotion } = useAdvisorTheme();
  const fields: [string, (r: Reference) => string][] = [
    [
      "Giá quan sát",
      (r) =>
        r.price === null ? "Chưa rõ" : r.price.toLocaleString("vi-VN") + " ₫",
    ],
    ["RAM", (r) => (r.ramGiB === null ? "Chưa rõ" : r.ramGiB + " GB")],
    [
      "Lưu trữ",
      (r) => (r.storageGiB === null ? "Chưa rõ" : r.storageGiB + " GB"),
    ],
    ["CPU", (r) => String(r.specs.cpu ?? "Chưa rõ")],
    ["Hệ điều hành", (r) => String(r.specs.os ?? "Chưa rõ")],
    ["Màn hình", (r) => String(r.specs.screen ?? "Chưa rõ")],
    ["Nguồn", (r) => r.source],
    ["Ngày quan sát", (r) => r.observedAt],
    [
      "Tổng trọn bộ",
      (r) => {
        const a = referenceAssessment(r, needs);
        return a.total === null
          ? "Chưa đủ dữ liệu"
          : a.total.toLocaleString("vi-VN") + " ₫";
      },
    ],
    [
      "Theo nhu cầu",
      (r) => {
        if (!needs.useOrderConfirmed) return "Chưa xác nhận nhu cầu";
        const a = referenceAssessment(r, needs);
        return (
          [...a.failures, ...a.unknowns].join("; ") ||
          "Đạt các điều kiện có chứng cứ"
        );
      },
    ],
  ];
  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {rows.map((r) => (
          <View key={r.id} style={{ flex: 1, gap: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: c.text }}>
              {r.name}
            </Text>
            <ExpressiveButton
              label={"Bỏ " + r.name}
              secondary
              onPress={() => onRemove(r.id)}
              colors={c}
              reduceMotion={reduceMotion}
            />
          </View>
        ))}
      </View>
      {fields.map(([label, value]) => (
        <View
          key={label}
          style={{
            gap: 8,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderColor: c.line,
          }}
        >
          <Text style={{ color: c.muted, fontWeight: "700" }}>{label}</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {rows.map((r) => (
              <Text
                key={r.id}
                style={{ flex: 1, color: c.text, lineHeight: 23 }}
              >
                {value(r)}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
