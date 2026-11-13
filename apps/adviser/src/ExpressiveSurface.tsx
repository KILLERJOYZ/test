import React, { useEffect } from "react";
import { AppState } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  cancelAnimation,
} from "react-native-reanimated";
export function ExpressiveSurface({
  children,
  reduceMotion,
  busy = false,
}: {
  children: React.ReactNode;
  reduceMotion: boolean;
  busy?: boolean;
}) {
  const progress = useSharedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    progress.value = reduceMotion
      ? 1
      : withSpring(1, { stiffness: 380, damping: 31.19, mass: 1 });
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") {
        cancelAnimation(progress);
        progress.value = 1;
      }
    });
    return () => {
      cancelAnimation(progress);
      sub.remove();
    };
  }, [reduceMotion, progress]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, progress.value)),
    transform: [{ translateY: 8 * (1 - progress.value) }],
  }));
  return (
    <Animated.View
      accessibilityState={busy ? { busy: true } : undefined}
      style={[{ gap: 16 }, style]}
    >
      {children}
    </Animated.View>
  );
}
