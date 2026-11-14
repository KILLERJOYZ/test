import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useAdvisorTheme } from "./AdvisorTheme";
import { ExpressiveButton } from "./ExpressiveButton";
import { referenceAssessment, type Reference } from "./reference";
import type { Needs } from "./picker";
import { retailerDisplayName } from "./RetailerBadge";
import { formatVnd } from "./i18n";

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
    ["Giá quan sát", (r) => formatVnd(r.price)],
    ["RAM", (r) => (r.ramGiB === null ? "Chưa rõ" : r.ramGiB + " GB")],
    [
      "Lưu trữ",
      (r) => (r.storageGiB === null ? "Chưa rõ" : r.storageGiB + " GB"),
    ],
    ["CPU", (r) => String(r.specs.cpu ?? "Chưa rõ")],
    ["Hệ điều hành", (r) => String(r.specs.os ?? "Chưa rõ")],
    ["Màn hình", (r) => String(r.specs.screen ?? "Chưa rõ")],
    ["Nguồn", (r) => retailerDisplayName(r.source)],
    [
      "Ngày quan sát",
      (r) => new Date(r.observedAt).toLocaleDateString("vi-VN"),
    ],
    [
      "Tổng trọn bộ",
      (r) => {
        const a = referenceAssessment(r, needs);
        return a.total === null ? "Chưa đủ dữ liệu" : formatVnd(a.total);
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
  if (!rows.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View
        style={{
          borderWidth: 1,
          borderColor: c.line,
          borderRadius: 20,
          backgroundColor: c.card,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderColor: c.line,
            backgroundColor: c.container,
          }}
        >
          <View style={{ width: 112, padding: 12, justifyContent: "center" }}>
            <Text style={{ fontWeight: "800", color: c.onContainer }}>
              Thuộc tính ({rows.length}/4)
            </Text>
          </View>
          {rows.map((r) => (
            <View
              key={r.id}
              style={{
                width: 196,
                padding: 12,
                gap: 8,
                borderLeftWidth: 1,
                borderColor: c.line,
              }}
            >
              <Text
                numberOfLines={2}
                style={{ fontSize: 16, fontWeight: "700", color: c.text }}
              >
                {r.name}
              </Text>
              <ExpressiveButton
                label={"Bỏ " + r.name.slice(0, 18)}
                secondary
                onPress={() => onRemove(r.id)}
                colors={c}
                reduceMotion={reduceMotion}
              />
            </View>
          ))}
        </View>
        {fields.map(([label, value]) => {
          const vals = rows.map((r) => value(r));
          const differs = rows.length > 1 && new Set(vals).size > 1;
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
                style={{ width: 112, padding: 12, justifyContent: "center" }}
              >
                <Text style={{ color: c.muted, fontWeight: "700", fontSize: 13 }}>
                  {label}
                </Text>
              </View>
              {rows.map((r, idx) => {
                const cellVal = vals[idx];
                return (
                  <View
                    key={r.id}
                    accessible
                    accessibilityLabel={`Máy ${idx + 1} (${r.name}), ${label}: ${cellVal}`}
                    style={{
                      width: 196,
                      padding: 12,
                      borderLeftWidth: 1,
                      borderColor: c.line,
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      selectable
                      style={{
                        color: c.text,
                        lineHeight: 20,
                        fontWeight: differs ? "700" : "400",
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {cellVal}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
