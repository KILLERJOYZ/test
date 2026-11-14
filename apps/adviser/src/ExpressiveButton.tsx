import React, { useEffect } from "react";
import { Pressable, Text } from "react-native";
import type { AccessibilityRole } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  cancelAnimation,
} from "react-native-reanimated";
import { EXPRESSIVE_SHAPE, EXPRESSIVE_SPRING } from "./expressive-theme";
import type { ExpressiveColors } from "./expressive-theme";
export function ExpressiveButton({
  label,
  onPress,
  secondary = false,
  disabled = false,
  loading = false,
  selected,
  role = "button",
  colors: c,
  reduceMotion,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  loading?: boolean;
  selected?: boolean;
  role?: AccessibilityRole;
  colors: ExpressiveColors;
  reduceMotion: boolean;
}) {
  const [focused,setFocused]=React.useState(false);
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1),
    radius = useSharedValue(
      selected ? EXPRESSIVE_SHAPE.selected : EXPRESSIVE_SHAPE.button,
    );
  useEffect(() => {
    const target = selected
      ? EXPRESSIVE_SHAPE.selected
      : EXPRESSIVE_SHAPE.button;
    radius.value = reduceMotion
      ? target
      : withSpring(target, EXPRESSIVE_SPRING);
    if (reduceMotion) {
      cancelAnimation(scale);
      scale.value = 1;
    }
    return () => { cancelAnimation(radius); };
  }, [selected, reduceMotion, radius, scale]);
  useEffect(()=>()=>{cancelAnimation(scale);},[scale]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderRadius: radius.value,
  }));
  const press = (v: number) => {
    scale.value = reduceMotion ? 1 : withSpring(v, EXPRESSIVE_SPRING);
  };
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading || undefined,
        ...(selected === undefined
          ? {}
          : role === "radio" || role === "checkbox"
            ? { checked: selected }
            : { selected }),
      }}
      disabled={isDisabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      onPressIn={() => press(0.98)}
      onPressOut={() => press(1)}
      style={{ minHeight: 48, minWidth: 48, justifyContent: "center" }}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            {
              minHeight: 48,
              paddingHorizontal: 16,
              paddingVertical: 13,
              borderWidth: focused || selected ? 2 : 1,
              borderColor: focused || selected ? c.accent : c.line,
              backgroundColor: secondary
                ? selected || pressed
                  ? c.container
                  : c.bg
                : c.accent,
              opacity: isDisabled ? 0.5 : 1,
              justifyContent: "center",
            },
            style,
          ]}
        >
          <Text
            style={{
              color: secondary
                ? selected
                  ? c.onContainer
                  : c.text
                : c.onAccent,
              fontWeight: "700",
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            {loading ? "⏳  " : selected ? "✓  " : ""}
            {label}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
}
