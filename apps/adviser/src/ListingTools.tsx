import React, { useEffect, useRef, useState } from "react";
import { NativeModules, Text, TextInput, View } from "react-native";
import { ExpressiveButton } from "./ExpressiveButton";
import { useAdvisorTheme } from "./AdvisorTheme";
import { parseQuotationDraft } from "./catalog";
import { submitListingReport } from "./adviser-client";
import { listingReference } from "./unified-adapters";
import { referenceAssessment, type Reference } from "./reference";
import type { Needs } from "./picker";

export function QuotationForm({ onOpen }: { onOpen: (r: Reference) => void }) {
  const { colors: c, reduceMotion } = useAdvisorTheme();
  const [open, setOpen] = useState(false);
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
            Nhập số tiền đầy đủ, không dùng dấu phân cách. Đây là thông tin bạn
            cung cấp; không tự tải nội dung từ liên kết.
          </Text>
          {(Object.keys(values) as (keyof typeof values)[]).map((k) => (
            <View key={k} style={{ gap: 4 }}>
              <Text style={{ color: c.text }}>{labels[k]}</Text>
              <TextInput
                accessibilityLabel={labels[k]}
                value={values[k]}
                onChangeText={(v) => setValues({ ...values, [k]: v })}
                keyboardType={
                  k === "name" || k === "url" ? "default" : "number-pad"
                }
                style={{
                  minHeight: 48,
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 14,
                  borderColor: c.line,
                  color: c.text,
                }}
              />
            </View>
          ))}
          <ExpressiveButton
            label="Đối chiếu báo giá với nhu cầu"
            onPress={() => {
              const result = parseQuotationDraft(values);
              if (!result) {
                setError(
                  "Kiểm tra tên, liên kết HTTPS và các số tiền nguyên dương.",
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
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  useEffect(() => {
    setAnswer("");
    setStatus("");
    setNote("");
    return () => {
      generation.current++;
      controller.current?.abort();
      NativeModules.AdviserLocalAi?.cancel("reference-explain");
    };
  }, [row.id, needs.revision]);
  const explain = async () => {
    const id = ++generation.current;
    const a = referenceAssessment(row, needs);
    const facts = [
      row.name,
      `Giá quan sát: ${row.price ?? "chưa rõ"} VND; quan sát ${row.observedAt}.`,
      ...(needs.useOrderConfirmed
        ? [...a.failures, ...a.unknowns]
        : ["Chưa xác nhận nhu cầu; chưa kết luận phù hợp."]),
      `Tổng chi phí: ${a.total ?? "chưa đủ dữ liệu"}. Không xác minh tồn kho hoặc hiệu năng.`,
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
      const raw = await bridge.generate(
        "reference-explain",
        'Select useful fact indexes. Return only JSON {"indexes":[0]}. Never add facts. ' +
          JSON.stringify(facts),
      );
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
      <TextInput
        accessibilityLabel="Nội dung báo sai thông tin"
        value={note}
        onChangeText={setNote}
        maxLength={1000}
        multiline
        style={{
          minHeight: 64,
          borderWidth: 1,
          borderColor: c.line,
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
          const abort = new AbortController();
          controller.current = abort;
          const timer = setTimeout(() => abort.abort(), 10000);
          setBusy(true);
          try {
            const r = await submitListingReport(
              endpoint,
              token,
              { listingId: row.id, category: "spec", note: note.trim() },
              abort.signal,
            );
            if (id === generation.current) setStatus("Đã nhận báo cáo " + r.id);
          } catch {
            if (id === generation.current)
              setStatus("Chưa gửi được. Nội dung được giữ để thử lại.");
          } finally {
            clearTimeout(timer);
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
