import React, { useEffect, useRef, useState } from "react";
import { NativeModules, Pressable, Text, TextInput, View } from "react-native";
import { useAdvisorTheme } from "./AdvisorTheme";
import { submitListingReport } from "./adviser-client";
import { observationAgeLabel, parseQuotationDraft } from "./catalog";
import { ExpressiveButton } from "./ExpressiveButton";
import { formatVndDigits, parseVndDigits } from "./i18n";
import type { Needs } from "./picker";
import { referenceAssessment, type Reference } from "./reference";
import { listingReference } from "./unified-adapters";

const MONEY_KEYS = new Set(["advertisedPrice", "shipping", "fees"]);

export function QuotationForm({ onOpen }: { onOpen: (r: Reference) => void }) {
  const { colors: c, reduceMotion } = useAdvisorTheme();
  const [open, setOpen] = useState(false);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const [values, setValues] = useState({
    name: "",
    url: "",
    advertisedPrice: "",
    shipping: "",
    fees: "",
    ram: "",
    storage: "",
  });
  const [error, setError] = useState("");
  const labels = {
    name: "Tên cấu hình",
    url: "Liên kết HTTPS (không bắt buộc)",
    advertisedPrice: "Giá thân máy VND",
    shipping: "Phí giao hàng VND (trống = chưa rõ)",
    fees: "Phí bắt buộc VND (trống = chưa rõ)",
    ram: "RAM GB (không bắt buộc)",
    storage: "Lưu trữ GB (không bắt buộc)",
  };
  return (
    <View style={{ gap: 12 }}>
      <ExpressiveButton
        label={open ? "Đóng báo giá" : "Kiểm tra báo giá laptop ngoài"}
        secondary
        onPress={() => setOpen(!open)}
        colors={c}
        reduceMotion={reduceMotion}
      />
      {open && (
        <>
          <Text style={{ color: c.muted }}>
            Tự động phân cách hàng nghìn bằng dấu chấm (ví dụ: 25.000.000). Đây
            là thông tin bạn cung cấp; không tự tải nội dung từ liên kết.
          </Text>
          {(Object.keys(values) as (keyof typeof values)[]).map((k) => {
            const isMoney = MONEY_KEYS.has(k);
            const isInt = k === "ram" || k === "storage";
            return (
              <View key={k} style={{ gap: 4 }}>
                <Text style={{ color: c.text }}>{labels[k]}</Text>
                <TextInput
                  accessibilityLabel={labels[k]}
                  value={values[k]}
                  onFocus={() => setFocusedKey(k)}
                  onBlur={() =>
                    setFocusedKey((cur) => (cur === k ? null : cur))
                  }
                  onChangeText={(v) =>
                    setValues({
                      ...values,
                      [k]: isMoney
                        ? formatVndDigits(v)
                        : isInt
                          ? parseVndDigits(v)
                          : v,
                    })
                  }
                  keyboardType={
                    k === "name" || k === "url" ? "default" : "number-pad"
                  }
                  style={{
                    minHeight: 48,
                    padding: 12,
                    borderWidth: focusedKey === k ? 2 : 1,
                    borderRadius: 14,
                    borderColor: focusedKey === k ? c.accent : c.line,
                    color: c.text,
                  }}
                />
              </View>
            );
          })}
          <ExpressiveButton
            label="Đối chiếu báo giá với nhu cầu"
            onPress={() => {
              const result = parseQuotationDraft(values);
              if (!result) {
                setError(
                  "Kiểm tra tên, liên kết HTTPS và các số tiền nguyên dương (≤ 1.000.000.000 ₫).",
                );
                return;
              }
              setError("");
              onOpen(listingReference(result.listing));
            }}
            colors={c}
            reduceMotion={reduceMotion}
          />
          {!!error && (
            <Text accessibilityLiveRegion="polite" style={{ color: c.error }}>
              {error}
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const REPORT_CATEGORIES: {
  id: "price" | "spec" | "stock" | "link";
  label: string;
}[] = [
  { id: "spec", label: "Sai cấu hình" },
  { id: "price", label: "Sai giá" },
  { id: "stock", label: "Hết hàng" },
  { id: "link", label: "Hỏng liên kết" },
];

export function ListingTools({
  row,
  needs,
  endpoint,
  token,
}: {
  row: Reference;
  needs: Needs;
  endpoint: string;
  token: string;
}) {
  const { colors: c, reduceMotion } = useAdvisorTheme();
  const [note, setNote] = useState(""),
    [category, setCategory] = useState<"price" | "spec" | "stock" | "link">(
      "spec",
    ),
    [noteFocused, setNoteFocused] = useState(false),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");
  const controller = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);

  useEffect(() => {
    setAnswer("");
    setStatus("");
    setNote("");
    return () => {
      generation.current++;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      controller.current?.abort();
      NativeModules.AdviserLocalAi?.cancel("reference-explain");
    };
  }, [row.id, needs.revision]);

  const explain = async () => {
    const id = ++generation.current;
    const a = referenceAssessment(row, needs);
    const facts = [
      row.name,
      `Giá quan sát: ${row.price !== null ? formatVndDigits(String(row.price)) + " ₫" : "chưa rõ"}; ${observationAgeLabel(row.observedAt)}.`,
      ...(needs.useOrderConfirmed
        ? [...a.failures, ...a.unknowns]
        : ["Chưa xác nhận nhu cầu; chưa kết luận phù hợp."]),
      `Tổng chi phí: ${a.total !== null ? formatVndDigits(String(a.total)) + " ₫" : "chưa đủ dữ liệu"}. Không xác minh tồn kho hoặc hiệu năng.`,
    ];
    setBusy(true);
    try {
      const bridge = NativeModules.AdviserLocalAi;
      if (!bridge || (await bridge.availability()) !== "available") {
        if (id === generation.current)
          setAnswer(
            "Dữ kiện theo quy tắc trên máy · AI chưa sẵn sàng\n" +
              facts.join("\n"),
          );
        return;
      }
      const prompt =
        'Select useful fact indexes. Return only JSON {"indexes":[0]}. Never add facts. ' +
        JSON.stringify(facts);
      const raw = bridge.generateWithTimeout
        ? await bridge.generateWithTimeout("reference-explain", prompt, 20000)
        : await bridge.generate("reference-explain", prompt);
      const parsed = JSON.parse(
        raw
          .trim()
          .replace(/^```(?:json)?\s*/, "")
          .replace(/\s*```$/, ""),
      );
      if (
        !Array.isArray(parsed.indexes) ||
        !parsed.indexes.length ||
        parsed.indexes.length > facts.length ||
        parsed.indexes.some(
          (n: unknown) =>
            !Number.isInteger(n) || Number(n) < 0 || Number(n) >= facts.length,
        )
      )
        throw Error();
      if (id === generation.current)
        setAnswer(
          "AI trên thiết bị · chỉ các dữ kiện đã kiểm tra\n" +
            parsed.indexes.map((n: number) => facts[n]).join("\n"),
        );
    } catch {
      if (id === generation.current)
        setAnswer(
          "AI chưa sẵn sàng. Dữ kiện theo quy tắc:\n" + facts.join("\n"),
        );
    } finally {
      if (id === generation.current) setBusy(false);
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <ExpressiveButton
        label="Giải thích bằng dữ kiện đã kiểm tra"
        onPress={() => void explain()}
        disabled={busy}
        colors={c}
        reduceMotion={reduceMotion}
      />
      {!!answer && (
        <Text selectable style={{ color: c.text, lineHeight: 24 }}>
          {answer}
        </Text>
      )}
      <Text style={{ color: c.muted }}>
        Báo sai thông tin cho cấu hình đang xem. Chỉ gửi khi bạn nhấn nút.
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {REPORT_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: category === cat.id }}
            accessibilityLabel={cat.label}
            onPress={() => setCategory(cat.id)}
            style={{
              minHeight: 48,
              justifyContent: "center",
              paddingHorizontal: 14,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: category === cat.id ? c.accent : c.line,
              backgroundColor: category === cat.id ? c.accent : c.card,
            }}
          >
            <Text
              style={{
                color: category === cat.id ? c.onAccent : c.text,
                fontWeight: "600",
              }}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        accessibilityLabel="Nội dung báo sai thông tin"
        value={note}
        onChangeText={setNote}
        onFocus={() => setNoteFocused(true)}
        onBlur={() => setNoteFocused(false)}
        maxLength={1000}
        multiline
        style={{
          minHeight: 64,
          borderWidth: noteFocused ? 2 : 1,
          borderColor: noteFocused ? c.accent : c.line,
          borderRadius: 14,
          padding: 12,
          color: c.text,
        }}
      />
      <ExpressiveButton
        label="Gửi báo sai thông tin"
        disabled={busy || !endpoint || !note.trim()}
        onPress={async () => {
          const id = ++generation.current;
          controller.current?.abort();
          if (timerRef.current) clearTimeout(timerRef.current);
          const abort = new AbortController();
          controller.current = abort;
          timerRef.current = setTimeout(() => abort.abort(), 10000);
          setBusy(true);
          try {
            const r = await submitListingReport(
              endpoint,
              token,
              { listingId: row.id, category, note: note.trim() },
              abort.signal,
            );
            if (id === generation.current) setStatus("Đã nhận báo cáo " + r.id);
          } catch {
            if (id === generation.current)
              setStatus("Chưa gửi được. Nội dung được giữ để thử lại.");
          } finally {
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
            if (id === generation.current) setBusy(false);
          }
        }}
        colors={c}
        reduceMotion={reduceMotion}
      />
      {!!status && (
        <Text accessibilityLiveRegion="polite" style={{ color: c.text }}>
          {status}
        </Text>
      )}
    </View>
  );
}
