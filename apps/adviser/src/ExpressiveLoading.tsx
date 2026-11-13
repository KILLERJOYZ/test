import React, { useEffect, useRef } from "react";
import { Animated, AppState, Text, View } from "react-native";
export function ExpressiveLoading({
  label,
  color,
  reduceMotion,
}: {
  label: string;
  color: string;
  reduceMotion: boolean;
}) {
  const shape = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduceMotion) {
      shape.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shape, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(shape, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ]),
    );
    const update = (state: string) => {
      if (state === "active") loop.start();
      else {
        loop.stop();
        shape.setValue(0);
      }
    };
    update(AppState.currentState);
    const sub = AppState.addEventListener("change", update);
    return () => {
      loop.stop();
      sub.remove();
    };
  }, [reduceMotion, shape]);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
    >
      <Animated.View
        accessible={false}
        style={{
          width: 24,
          height: 24,
          backgroundColor: color,
          borderRadius: shape.interpolate({
            inputRange: [0, 1],
            outputRange: [4, 12],
          }),
        }}
      />
      <Text style={{ color, fontSize: 14, lineHeight: 22 }}>{label}</Text>
    </View>
  );
}
