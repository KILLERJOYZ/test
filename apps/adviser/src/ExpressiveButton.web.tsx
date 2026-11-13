import React, { useRef } from "react";
import { Animated, Pressable, Text } from "react-native";
import type { AccessibilityRole } from "react-native";
import { EXPRESSIVE_SHAPE, EXPRESSIVE_SPRING } from "./expressive-theme";
import type { ExpressiveColors } from "./expressive-theme";

export function ExpressiveButton({
  label,
  onPress,
  secondary = false,
  disabled = false,
  selected,
  role = "button",
  colors: c,
  reduceMotion,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  selected?: boolean;
  role?: AccessibilityRole;
  colors: ExpressiveColors;
  reduceMotion: boolean;
}) {
  const [focused, setFocused] = React.useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const radius = useRef(
    new Animated.Value(
      selected ? EXPRESSIVE_SHAPE.selected : EXPRESSIVE_SHAPE.button,
    ),
  ).current;
  React.useEffect(() => {
    const target = selected
      ? EXPRESSIVE_SHAPE.selected
      : EXPRESSIVE_SHAPE.button;
    radius.stopAnimation();
    if (reduceMotion) {
      radius.setValue(target);
      return;
    }
    const animation = Animated.spring(radius, {
      toValue: target,
      ...EXPRESSIVE_SPRING,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [selected, reduceMotion, radius]);
  React.useEffect(() => {
    if (reduceMotion) {
      scale.stopAnimation();
      scale.setValue(1);
    }
  }, [reduceMotion, scale]);
  const animate = (value: number) => {
    if (reduceMotion) return;
    Animated.spring(scale, {
      toValue: value,
      ...EXPRESSIVE_SPRING,
      useNativeDriver: true,
    }).start();
  };
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={{
        disabled,
        ...(selected === undefined
          ? {}
          : role === "radio" || role === "checkbox"
            ? { checked: selected }
            : { selected }),
      }}
      aria-checked={
        role === "radio" || role === "checkbox" ? selected : undefined
      }
      aria-pressed={role === "button" ? selected : undefined}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      onPressIn={() => animate(0.98)}
      onPressOut={() => animate(1)}
      style={{ minHeight: 48, minWidth: 48, justifyContent: "center" }}
    >
      {({ pressed }) => (
        <Animated.View
          style={{
            transform: [{ scale }],
            minHeight: 48,
            paddingHorizontal: 16,
            paddingVertical: 13,
            borderRadius: radius,
            backgroundColor: secondary
              ? pressed
                ? c.container
                : c.bg
              : c.accent,
            borderWidth: focused ? 2 : 1,
            borderColor: focused ? c.accent : c.line,
            opacity: disabled ? 0.5 : 1,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: secondary ? c.text : c.onAccent,
              fontWeight: "700",
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            {selected === true ? "✓  " : ""}
            {label}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
}
