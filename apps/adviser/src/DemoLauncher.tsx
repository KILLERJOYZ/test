import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import AndroidApp from "./AndroidApp";
import DeviceAdvisorApp from "./DeviceAdvisorApp";
export default function DemoLauncher() {
  const [demo, setDemo] = useState(2);
  if (demo === 1) return <AndroidApp />;
  if (demo === 2) return <DeviceAdvisorApp onExit={() => setDemo(0)} />;
  return (
    <View style={s.root}>
      <Text style={s.title}>Lựa · Hai bản demo</Text>
      <Text style={s.body}>
        Demo 1 dùng dữ liệu giả. Demo 2 dùng catalog tham chiếu từ dữ liệu thu thập thực.
      </Text>
      {[1, 2].map((n) => (
        <Pressable
          key={n}
          accessibilityRole="button"
          onPress={() => setDemo(n)}
          style={s.button}
        >
          <Text style={s.label}>
            {n === 1
              ? "Demo 1 · Hành trình chọn laptop"
              : "Demo 2 · Tích hợp offline"}
          </Text>
          <Text style={s.description}>
            {n === 1
              ? "Khám phá, bộ chọn, so sánh và quyết định đã lưu."
              : "Catalog có phiên bản, xác nhận nhu cầu, lưu phiên và khôi phục dữ liệu."}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    padding: 28,
    gap: 22,
    backgroundColor: "#f6f5ee",
  },
  title: { fontSize: 32, fontWeight: "800", color: "#173d32" },
  body: { fontSize: 17, lineHeight: 26, color: "#344c44" },
  button: {
    padding: 24,
    minHeight: 100,
    borderRadius: 26,
    backgroundColor: "#244e40",
    gap: 10,
  },
  label: { fontSize: 22, fontWeight: "700", color: "#fff" },
  description: { fontSize: 16, lineHeight: 24, color: "#e0efe5" },
});
