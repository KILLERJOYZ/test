import React, { useEffect, useRef } from "react";
import { Animated, AppState } from "react-native";

/** Presentation follows React state; completion never performs a domain action. */
export function ExpressiveSurface({
  children,
  reduceMotion,
  busy = false,
}: {
  children: React.ReactNode;
  reduceMotion: boolean;
  busy?: boolean;
}) {
  const progress = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    progress.stopAnimation();
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.spring(progress, {
      toValue: 1,
      stiffness: 380,
      damping: 31.19,
      mass: 1,
      useNativeDriver: true,
    });
    animation.start();
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active") {
        animation.stop();
        progress.setValue(1);
      }
    });
    return () => {
      animation.stop();
      sub.remove();
    };
  }, [reduceMotion, progress]);
  return (
    <Animated.View
      accessibilityState={busy ? { busy: true } : undefined}
      style={{
        gap: 16,
        opacity: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: "clamp",
        }),
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
