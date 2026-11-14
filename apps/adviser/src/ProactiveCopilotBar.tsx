import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { fetchProactiveNudge } from "./adviser-client";
import {
  detectLocalProactiveNudge,
  type Catalog,
  type Listing,
  type ProactiveNudge,
  type Requirements,
} from "./catalog";
import { ExpressiveButton } from "./ExpressiveButton";
import {
  EXPRESSIVE_SHAPE,
  EXPRESSIVE_SPACE,
  EXPRESSIVE_TYPE,
  type ExpressiveColors,
} from "./expressive-theme";
import { Icon } from "./icons";

const MAX_SESSION_NUDGES = 3;

export interface ProactiveCopilotBarProps {
  catalog: Catalog;
  requirements: Requirements;
  currentListing: Listing | null;
  recentListingIds: string[];
  compareIds: string[];
  endpoint: string;
  token: string;
  colors: ExpressiveColors;
  reduceMotion: boolean;
  onCompareIds: (ids: string[]) => void;
  onOpenListing: (listing: Listing) => void;
}

export function ProactiveCopilotBar({
  catalog,
  requirements,
  currentListing,
  recentListingIds,
  compareIds,
  endpoint,
  token,
  colors: c,
  reduceMotion,
  onCompareIds,
  onOpenListing,
}: ProactiveCopilotBarProps) {
  const [mutedSession, setMutedSession] = useState(false);
  const [dismissedKeys, setDismissedKeys] = useState<string[]>([]);
  const [shownKeys, setShownKeys] = useState<string[]>([]);
  const [remoteNudge, setRemoteNudge] = useState<ProactiveNudge | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const localNudge = useMemo(
    () =>
      detectLocalProactiveNudge(
        catalog,
        requirements,
        currentListing,
        recentListingIds,
        compareIds,
      ),
    [catalog, requirements, currentListing, recentListingIds, compareIds],
  );

  useEffect(() => {
    setRemoteNudge(null);
    if (!endpoint.trim() || mutedSession || !localNudge) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const timer = setTimeout(() => {
      void fetchProactiveNudge(
        endpoint,
        token,
        {
          requirements,
          currentListingId: currentListing?.id ?? null,
          recentListingIds: recentListingIds.slice(0, 6),
          compareIds,
        },
        ctrl.signal,
      )
        .then((res) => {
          if (
            !ctrl.signal.aborted &&
            res &&
            res.shouldNudge &&
            typeof res.headline === "string" &&
            typeof res.detail === "string" &&
            Array.isArray(res.citedListingIds)
          ) {
            setRemoteNudge({
              signalType: res.signalType || localNudge.signalType,
              headline: res.headline,
              detail: res.detail,
              citedListingIds: res.citedListingIds,
              suggestedAction:
                res.suggestedAction === "open_listing" ? "open_listing" : "compare",
              mode: res.mode || "online_langgraph_chatgpt",
            });
          }
        })
        .catch(() => {
          // Silent fallback to localNudge
        });
    }, 500);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [
    endpoint,
    token,
    mutedSession,
    localNudge?.signalType,
    currentListing?.id,
    recentListingIds.join(","),
    compareIds.join(","),
    requirements.budget,
  ]);

  const active = remoteNudge ?? localNudge;
  const nudgeKey = active
    ? `${active.signalType}:${active.citedListingIds.join(",")}`
    : "";

  useEffect(() => {
    if (!nudgeKey || mutedSession || dismissedKeys.includes(nudgeKey)) return;
    setShownKeys((prev) =>
      prev.includes(nudgeKey) || prev.length >= MAX_SESSION_NUDGES
        ? prev
        : [...prev, nudgeKey],
    );
  }, [nudgeKey, mutedSession, dismissedKeys]);

  if (
    !active ||
    mutedSession ||
    dismissedKeys.includes(nudgeKey) ||
    (!shownKeys.includes(nudgeKey) && shownKeys.length >= MAX_SESSION_NUDGES)
  ) {
    return null;
  }

  const targetAltListing =
    active.suggestedAction === "open_listing"
      ? catalog.listings.find(
          (x) =>
            active.citedListingIds.includes(x.id) && x.id !== currentListing?.id,
        ) ?? catalog.listings.find((x) => active.citedListingIds.includes(x.id))
      : null;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.bar,
        {
          backgroundColor: c.card,
          borderColor: c.accent,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Icon name="sparkles" size={16} color={c.accent} />
          <Text
            style={{
              ...EXPRESSIVE_TYPE.label,
              color: c.text,
              flex: 1,
            }}
          >
            {active.headline}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đóng gợi ý chủ động"
          onPress={() => setDismissedKeys((prev) => [...prev, nudgeKey])}
          style={styles.closeBtn}
        >
          <Icon name="x" size={18} color={c.muted} />
        </Pressable>
      </View>
      <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.muted }}>
        {active.detail}
      </Text>
      <View style={styles.actions}>
        {active.suggestedAction === "compare" &&
        active.citedListingIds.length >= 2 ? (
          <ExpressiveButton
            label="Đối chiếu ngay"
            onPress={() => {
              setDismissedKeys((prev) => [...prev, nudgeKey]);
              onCompareIds(active.citedListingIds);
            }}
            colors={c}
            reduceMotion={reduceMotion}
          />
        ) : targetAltListing ? (
          <ExpressiveButton
            label="Xem cấu hình gợi ý"
            onPress={() => {
              setDismissedKeys((prev) => [...prev, nudgeKey]);
              onOpenListing(targetAltListing);
            }}
            colors={c}
            reduceMotion={reduceMotion}
          />
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tạm ẩn gợi ý trong phiên này"
          onPress={() => setMutedSession(true)}
          style={styles.muteBtn}
        >
          <Text style={{ ...EXPRESSIVE_TYPE.caption, color: c.muted }}>
            Tạm ẩn gợi ý
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    marginHorizontal: EXPRESSIVE_SPACE.md,
    marginBottom: EXPRESSIVE_SPACE.xs,
    padding: EXPRESSIVE_SPACE.md,
    borderRadius: EXPRESSIVE_SHAPE.card,
    borderWidth: 1,
    gap: EXPRESSIVE_SPACE.xs,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  closeBtn: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    margin: -10,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
  },
  muteBtn: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
});
