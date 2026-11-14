import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Linking,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { RULE_VERSION, SCORING_VERSION } from "./advisor-engine";
import { legacyPalette, useAdvisorTheme } from "./AdvisorTheme";
import { MAX_COMPARE_ITEMS, observationAgeLabel } from "./catalog";
import { createUniqueDecisionId } from "./decision-state";
import { storage } from "./demo-storage";
import { PURPOSES } from "./device-profile";
import { money } from "./domain";
import { ExpressiveButton } from "./ExpressiveButton";
import { ListingTools, QuotationForm } from "./ListingTools";
import type { Needs } from "./picker";
import {
  referenceAssessment,
  referenceSeed,
  referenceUrl,
  selectReferences,
  type Reference,
} from "./reference";
import { loadReferences, referenceStorageKind } from "./reference-storage";
import {
  importConnectedHistory,
  validUnifiedSaved,
  type UnifiedSaved,
} from "./unified-adapters";
import { UnifiedComparison } from "./UnifiedComparison";

type Saved = UnifiedSaved;
const KEY = "lua-real-reference-decisions-v1";

function Action({
  title,
  onPress,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors, reduceMotion } = useAdvisorTheme();
  return (
    <ExpressiveButton
      label={title}
      onPress={onPress}
      disabled={disabled}
      colors={colors}
      reduceMotion={reduceMotion}
    />
  );
}

export default function ReferenceExplorer({
  needs,
  endpoint = "",
  token = "",
  screen,
  onNavigate,
  onProposeBudget,
  catalogRevision = 0,
}: {
  needs: Needs;
  endpoint?: string;
  token?: string;
  catalogRevision?: number;
  onProposeBudget?: (budget: number, baseRevision: number) => void;
  screen: string;
  onNavigate: (s: "results" | "detail" | "compare" | "saved") => void;
}) {
  const LIGHT = legacyPalette(useAdvisorTheme().colors);
  const s = makeStyles(LIGHT);
  const historyReady = useRef(false),
    writeLock = useRef(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [source, setSource] = useState("");
  const [savedQuery, setSavedQuery] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [historicalNeeds, setHistoricalNeeds] = useState<Needs | null>(null);
  const [rows, setRows] = useState<Reference[]>([]),
    [error, setError] = useState(""),
    [loaded, setLoaded] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [limit, setLimit] = useState(6),
    [explore, setExplore] = useState(false);
  const [query, setQuery] = useState(""),
    [weight, setWeight] = useState(""),
    [sort, setSort] = useState("fit"),
    [all, setAll] = useState(false),
    [detail, setDetail] = useState<Reference | null>(null),
    [selected, setSelected] = useState<string[]>([]),
    [saved, setSaved] = useState<Saved[]>([]),
    [writing, setWriting] = useState(false);

  useEffect(() => {
    let active = true;
    loadReferences()
      .then((r) => {
        if (active) {
          setRows(r);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active)
          setError(
            "Không mở được catalog. Hãy mở lại demo; không thay bằng sản phẩm giả.",
          );
      });
    return () => {
      active = false;
    };
  }, [catalogRevision]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await storage.getItem(KEY);
        const data = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(data) || data.some((x) => !validUnifiedSaved(x)))
          throw Error();
        const imported = await storage.getItem(KEY + "-connected-imported");
        const migrated = imported
          ? []
          : importConnectedHistory(
              await AsyncStorage.getItem("lua-connected-adviser-v1"),
            );
        const ids = new Set(data.map((x) => x.id));
        const combined = [...data, ...migrated.filter((x) => !ids.has(x.id))];
        if (combined.length !== data.length)
          await storage.setItem(KEY, JSON.stringify(combined));
        if (!imported) await storage.setItem(KEY + "-connected-imported", "1");
        if (active) {
          setSaved(combined);
          historyReady.current = true;
        }
      } catch {
        if (active) {
          historyReady.current = false;
          setError(
            "Không đọc được lịch sử. Dữ liệu gốc được giữ; tạm khóa ghi lịch sử.",
          );
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function persist(next: Saved[]) {
    if (!historyReady.current || writeLock.current) return;
    writeLock.current = true;
    setWriting(true);
    try {
      await storage.setItem(KEY, JSON.stringify(next));
      setSaved(next);
      setError("Đã lưu thay đổi.");
    } catch {
      setError("Không ghi được dữ liệu; danh sách cũ được giữ.");
    } finally {
      writeLock.current = false;
      setWriting(false);
    }
  }

  useEffect(() => {
    if (!loaded || historicalNeeds) return;
    setSelected((ids) => ids.filter((id) => rows.some((r) => r.id === id)));
    if (detail) {
      const current = rows.find((r) => r.id === detail.id);
      if (current) setDetail(current);
      else if (detail.catalogVersion) setHistoricalNeeds(needs);
    }
  }, [rows, loaded, detail?.id, historicalNeeds, needs.revision]);

  useEffect(() => {
    setLimit(6);
    setExplore(false);
  }, [query, weight, sort, needs.revision]);

  if (!["results", "detail", "compare", "saved"].includes(screen)) return null;

  const result = selectReferences(
    source ? rows.filter((r) => r.source === source) : rows,
    needs,
    query,
    weight,
    sort,
    all,
  );
  const viewedNeeds = historicalNeeds ?? needs;

  function formatRunBrief() {
    const topLines = result.visible
      .slice(0, 5)
      .map(
        (r, idx) =>
          `${idx + 1}. ${r.name} (${r.source}) — ${r.price === null ? "Chưa rõ giá" : money(r.price)}`,
      );
    return [
      `Tóm tắt kết quả tư vấn · Lựa Device Advisor (${RULE_VERSION} / ${SCORING_VERSION})`,
      `Trần chi tiêu: ${money(needs.budget)}`,
      `Đủ điều kiện: ${result.run.qualified.length} · Cần xác minh: ${result.run.verify.length} · Bị loại: ${result.run.excluded.length}`,
      ...(topLines.length ? ["Gợi ý hàng đầu:", ...topLines] : []),
      "Lưu ý: Dữ liệu quan sát thực tế; vui lòng tự kiểm tra giá và tồn kho tại cửa hàng.",
    ].join("\n");
  }

  function facts(r: Reference) {
    const assessment = referenceAssessment(r, viewedNeeds);
    const ageLabel = observationAgeLabel(r.observedAt);
    if (!viewedNeeds.useOrderConfirmed)
      return (
        <>
          <Text style={s.price}>
            {r.price === null ? "Chưa có giá" : money(r.price)}
          </Text>
          <Text style={s.body}>
            {r.source} · {ageLabel}
          </Text>
          <Text style={s.body}>
            RAM: {r.ramGiB ?? "chưa rõ"} GB · Lưu trữ:{" "}
            {r.storageGiB ?? "chưa rõ"} GB
          </Text>
          <Text style={s.warning}>
            Bản ghi để khám phá. Xác nhận nhu cầu trước khi đánh giá phù hợp.
          </Text>
        </>
      );
    return (
      <>
        <Text style={s.price}>
          {r.price === null ? "Chưa có giá" : money(r.price)}
        </Text>
        <Text style={s.body}>
          Giá thân máy đã ghi nhận · {r.source} · {r.condition}
        </Text>
        <Text style={s.body}>
          {String(r.specs.ram ?? "RAM chưa rõ")} ·{" "}
          {String(r.specs.storage ?? "Ổ đĩa chưa rõ")}
        </Text>
        <Text style={s.body}>{ageLabel}</Text>
        {assessment.state === "excluded" && (
          <Text style={s.warning}>Không đạt điều kiện đã chọn</Text>
        )}
        <Text style={s.body}>
          Độ phủ chứng cứ ưu tiên:{" "}
          {Math.round(assessment.evidenceCoverage * 100)}%.{" "}
          {assessment.evidenceCoverage > 0
            ? `Khoảng điểm ${assessment.scoreLower.toFixed(1)}–${assessment.scoreUpper.toFixed(1)} / 100.`
            : "Chưa đủ dữ liệu để chấm điểm."}{" "}
          Không phải xác suất phù hợp.
        </Text>
        <Text style={s.caption}>
          Tổng trọn bộ:{" "}
          {assessment.total === null
            ? "chưa đủ dữ liệu"
            : money(assessment.total)}
        </Text>
        {[...assessment.failures, ...assessment.unknowns].map((t, i) => (
          <Text key={i} style={s.body}>
            • {t}
          </Text>
        ))}
      </>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      <Text style={s.caption}>
        {referenceStorageKind} · {rows.length} bản ghi ·{" "}
        {rows[0]?.catalogVersion ?? referenceSeed.version}
      </Text>
      {needs.deviceProfile && !needs.deviceProfile.confirmed ? (
        <Text style={s.body}>
          Chưa xác nhận nhu cầu và trần chi tiêu. Hoàn thành lựa chọn để xem gợi
          ý theo hồ sơ của bạn.
        </Text>
      ) : (
        <Text style={s.body}>
          Trần tham khảo: {money(needs.budget)} · Tác vụ:{" "}
          {needs.deviceProfile
            ? needs.deviceProfile.purposes
                .map(
                  (id) =>
                    Object.values(PURPOSES)
                      .flat()
                      .find((p) => p.id === id)?.label ?? id,
                )
                .join(", ")
            : needs.tasks.join(", ")}
          . Xếp theo chính sách ưu tiên có phiên bản; dữ liệu thiếu tạo khoảng
          điểm, không được thay bằng điểm trung bình.
        </Text>
      )}
      <Text style={s.warning}>
        Dữ liệu thu thập thực, chưa được xác minh lại tại thời điểm xem. Giá và
        tồn kho có thể thay đổi.
      </Text>
      {!!error && (
        <Text accessibilityLiveRegion="polite" style={s.warning}>
          {error}
        </Text>
      )}
      {screen === "results" && (
        <>
          <Text accessibilityRole="header" style={s.heading}>
            Catalog tham chiếu
          </Text>
          <Text style={s.warning}>
            Các khoảng điểm có thể chồng nhau; thứ tự xem là thận trọng, không
            chứng minh một máy tốt hơn tuyệt đối. Trọng số thay đổi theo thứ tự
            tác vụ và ưu tiên bạn xác nhận.
          </Text>
          <Action
            title="Xuất kết quả tư vấn và chứng cứ"
            onPress={() =>
              void Share.share({
                message: formatRunBrief(),
              }).catch(() => setError("Không xuất được kết quả."))
            }
          />
          <TextInput
            style={[
              s.input,
              focusedField === "query" && {
                borderColor: LIGHT.primary,
                borderWidth: 2,
              },
            ]}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocusedField("query")}
            onBlur={() =>
              setFocusedField((f) => (f === "query" ? null : f))
            }
            placeholder="Tìm tên máy, hãng, nơi bán, RAM"
            placeholderTextColor={LIGHT.muted}
            accessibilityLabel="Tìm catalog thật"
          />
          <TextInput
            style={[
              s.input,
              focusedField === "source" && {
                borderColor: LIGHT.primary,
                borderWidth: 2,
              },
            ]}
            value={source}
            onChangeText={setSource}
            onFocus={() => setFocusedField("source")}
            onBlur={() =>
              setFocusedField((f) => (f === "source" ? null : f))
            }
            accessibilityLabel="Lọc nguồn bán"
            placeholder="Nguồn bán (ví dụ fptshop; trống = tất cả)"
            placeholderTextColor={LIGHT.muted}
          />
          {needs.deviceProfile?.category === "PC" &&
            needs.deviceProfile.pcType === "LAPTOP" && (
              <QuotationForm
                onOpen={(r) => {
                  setHistoricalNeeds(null);
                  setDetail(r);
                  onNavigate("detail");
                }}
              />
            )}
          <TextInput
            style={[
              s.input,
              focusedField === "weight" && {
                borderColor: LIGHT.primary,
                borderWidth: 2,
              },
            ]}
            value={weight}
            onChangeText={setWeight}
            onFocus={() => setFocusedField("weight")}
            onBlur={() =>
              setFocusedField((f) => (f === "weight" ? null : f))
            }
            placeholder="Trọng lượng tối đa kg (bỏ trống nếu không cần)"
            placeholderTextColor={LIGHT.muted}
            accessibilityLabel="Giới hạn trọng lượng"
            keyboardType="decimal-pad"
          />
          <View style={s.row}>
            <Action
              title="Theo nhu cầu đã chọn"
              onPress={() => setSort("fit")}
            />
            <Action title="Giá thấp trước" onPress={() => setSort("price")} />
            <Action title="Nhẹ trước" onPress={() => setSort("weight")} />
          </View>
          <Action
            title={
              all
                ? "Chỉ phương án tham khảo trong trần"
                : "Xem toàn bộ, kể cả máy vượt điều kiện"
            }
            onPress={() => setAll(!all)}
          />
          <Action
            title="Xóa từ khóa và bộ lọc"
            onPress={() => {
              setQuery("");
              setWeight("");
              setSource("");
              setAll(false);
            }}
          />
          <Text style={s.heading}>
            {loaded
              ? `${result.visible.length} bản ghi`
              : "Đang mở cơ sở dữ liệu…"}
          </Text>
          {loaded &&
            needs.deviceProfile?.category === "PC" &&
            needs.deviceProfile.pcType === "DESKTOP" &&
            !rows.some((r) => r.category === "desktop") && (
              <Text style={s.warning}>
                Chưa có dữ liệu desktop được kiểm tra trong catalog này. Hồ sơ
                của bạn vẫn được lưu; không thay bằng laptop.
              </Text>
            )}
          {loaded && !result.visible.length && (
            <Text style={s.body}>
              {result.eligible.length
                ? "Bộ lọc/từ khóa không có kết quả."
                : "Không có bản ghi đáp ứng các điều kiện tham khảo. Hãy tự điều chỉnh nhu cầu; hệ thống không nới trần."}
            </Text>
          )}
          <Text style={s.heading}>
            Đủ điều kiện: {result.run.qualified.length} · Cần xác minh:{" "}
            {result.run.verify.length} · Bị loại: {result.run.excluded.length}
          </Text>
          {!!result.run.errors.length && (
            <Text style={s.warning}>{result.run.errors.join(" ")}</Text>
          )}
          {!!result.run.exclusions.length && (
            <Text style={s.body}>
              Nguyên nhân loại:{" "}
              {result.run.exclusions
                .map((x) => `${x.code}: ${x.count}`)
                .join(" · ")}
            </Text>
          )}
          <Action
            title={
              explore
                ? "Đóng phương án điều chỉnh"
                : "Khám phá phương án điều chỉnh ngân sách"
            }
            onPress={() => setExplore(!explore)}
          />
          {explore && (
            <View style={s.card}>
              <Text style={s.warning}>
                Đây là phương án thay đổi nhu cầu, chưa áp dụng. Tăng trần không
                giải quyết các điều kiện chưa rõ.
              </Text>
              {!result.run.compromises.length && (
                <Text style={s.body}>
                  Chưa có phương án tăng trần có chi phí đủ dữ liệu. Hãy xem các
                  nguyên nhân loại và chỉnh yêu cầu trong bộ chọn.
                </Text>
              )}
              {result.run.compromises.map((c) => (
                <View key={c.candidateId}>
                  <Text style={s.body}>
                    {rows.find((r) => r.id === c.candidateId)?.name} · Đề xuất
                    trần {money(c.proposedCeiling)} · Còn cần xác minh:{" "}
                    {c.otherBlocks.join(", ") || "không có"}
                  </Text>
                  <Action
                    title="Xem lại đề xuất trần trước khi áp dụng"
                    onPress={() =>
                      onProposeBudget?.(c.proposedCeiling, c.baseRevision)
                    }
                  />
                </View>
              ))}
            </View>
          )}
          {result.visible.slice(0, limit).map((r) => (
            <View key={r.id} style={s.card}>
              <Text accessibilityRole="header" style={s.heading}>
                {r.name}
              </Text>
              {facts(r)}
              <Action
                title="Chi tiết và nguồn dữ liệu"
                onPress={() => {
                  setHistoricalNeeds(null);
                  setDetail(r);
                  onNavigate("detail");
                }}
              />
              <Action
                title={
                  selected.includes(r.id)
                    ? "Bỏ so sánh"
                    : `Chọn so sánh (${selected.length}/${MAX_COMPARE_ITEMS})`
                }
                onPress={() => {
                  if (
                    !selected.includes(r.id) &&
                    selected.length >= MAX_COMPARE_ITEMS
                  ) {
                    setError(
                      `Đã chọn tối đa ${MAX_COMPARE_ITEMS} máy. Bỏ một máy trước khi chọn máy khác.`,
                    );
                    return;
                  }
                  setSelected(
                    selected.includes(r.id)
                      ? selected.filter((id) => id !== r.id)
                      : [...selected, r.id],
                  );
                }}
              />
              <Action
                title={`Mở so sánh (${selected.length})`}
                disabled={selected.length < 2}
                onPress={() => onNavigate("compare")}
              />
            </View>
          ))}
          {result.visible.length > limit && (
            <Action
              title={`Xem thêm ${Math.min(8, result.visible.length - limit)} cấu hình`}
              onPress={() => setLimit(limit + 8)}
            />
          )}
        </>
      )}
      {screen === "detail" && detail && (
        <View style={s.card}>
          <Text style={s.heading}>{detail.name}</Text>
          {historicalNeeds && (
            <Text style={s.warning}>
              Bản ghi lịch sử · đánh giá theo nhu cầu khi lưu.
            </Text>
          )}
          {facts(detail)}
          <ListingTools
            key={
              detail.id +
              String(viewedNeeds.revision) +
              String(detail.catalogVersion)
            }
            row={detail}
            needs={viewedNeeds}
            endpoint={endpoint}
            token={token}
          />
          {Object.entries(detail.specs)
            .filter(([k, v]) => v !== null && k !== "rawSpecs")
            .map(([k, v]) => (
              <Text key={k} style={s.body}>
                {k}: {String(v)}
              </Text>
            ))}
          <Action
            title={
              showEvidence ? "Ẩn chứng cứ kỹ thuật" : "Xem chứng cứ kỹ thuật"
            }
            onPress={() => setShowEvidence(!showEvidence)}
          />
          {showEvidence && (
            <Text style={s.caption}>
              Lý do và chứng cứ:{" "}
              {referenceAssessment(detail, needs)
                .checks.map(
                  (c) => `${c.code}=${c.state} [${c.evidenceIds.join(", ")}]`,
                )
                .join("; ")}
            </Text>
          )}
          <Text selectable style={s.body}>
            {detail.url}
          </Text>
          <Action
            title="Mở trang nguồn để kiểm tra giá"
            onPress={() => {
              try {
                void Linking.openURL(referenceUrl(detail)).catch(() =>
                  setError("Không mở được liên kết."),
                );
              } catch {
                setError("Nguồn liên kết không hợp lệ.");
              }
            }}
          />
          <Action
            disabled={writing || !historyReady.current}
            title="Lưu quyết định với giá lịch sử"
            onPress={() =>
              void persist([
                {
                  id: createUniqueDecisionId(),
                  row: detail,
                  needs: viewedNeeds,
                  date: new Date().toISOString(),
                  recommendationSnapshot: {
                    runKey: result.run.runKey,
                    ruleVersion: RULE_VERSION,
                    scoringVersion: SCORING_VERSION,
                    assessment: referenceAssessment(detail, viewedNeeds),
                  },
                },
                ...saved,
              ])
            }
          />
          <Action
            title="Quay lại gợi ý"
            onPress={() => onNavigate("results")}
          />
        </View>
      )}
      {screen === "compare" && (
        <>
          <Text style={s.heading}>
            So sánh cấu hình nguồn (tối đa {MAX_COMPARE_ITEMS} máy)
          </Text>
          {selected.length < 2 && (
            <Text style={s.body}>
              Chọn từ 2 đến {MAX_COMPARE_ITEMS} sản phẩm trong catalog để so
              sánh. Cùng tên chưa chắc cùng cấu hình; không gộp nơi bán tự động.
            </Text>
          )}
          <UnifiedComparison
            rows={selected
              .map((id) => rows.find((r) => r.id === id))
              .filter((r): r is Reference => !!r)}
            needs={needs}
            onRemove={(id) => setSelected(selected.filter((v) => v !== id))}
          />
          <Action
            title="Quay lại catalog"
            onPress={() => onNavigate("results")}
          />
        </>
      )}
      {screen === "saved" && (
        <>
          <Text style={s.heading}>
            Quyết định tham chiếu đã lưu · {saved.length}
          </Text>
          {!saved.length && (
            <Text style={s.body}>
              Mở chi tiết một cấu hình để lưu nhu cầu và giá tại thời điểm xem.
            </Text>
          )}
          <TextInput
            style={[
              s.input,
              focusedField === "saved" && {
                borderColor: LIGHT.primary,
                borderWidth: 2,
              },
            ]}
            accessibilityLabel="Tìm quyết định đã lưu"
            placeholder="Tên máy hoặc ngày lưu"
            placeholderTextColor={LIGHT.muted}
            value={savedQuery}
            onChangeText={setSavedQuery}
            onFocus={() => setFocusedField("saved")}
            onBlur={() =>
              setFocusedField((f) => (f === "saved" ? null : f))
            }
          />
          {saved
            .filter((x) =>
              (x.row.name + " " + x.date)
                .toLocaleLowerCase("vi")
                .includes(savedQuery.toLocaleLowerCase("vi")),
            )
            .map((x) => (
              <View key={x.id} style={s.card}>
                <Text style={s.heading}>{x.row.name}</Text>
                <Text style={s.body}>
                  Lưu: {new Date(x.date).toLocaleString("vi-VN")} ·{" "}
                  {observationAgeLabel(x.row.observedAt)}
                </Text>
                <Text style={s.body}>
                  Trần khi lưu: {money(x.needs.budget)} · Giá lịch sử:{" "}
                  {x.row.price === null ? "Chưa rõ" : money(x.row.price)}
                </Text>
                <Text style={s.warning}>
                  Giá và nhu cầu lịch sử được giữ khi mở chi tiết.
                </Text>
                <Action
                  title="Xem bản ghi đã lưu"
                  onPress={() => {
                    setHistoricalNeeds(x.needs);
                    setDetail(x.row);
                    onNavigate("detail");
                  }}
                />
                <Action
                  disabled={writing}
                  title="Xóa bản lưu"
                  onPress={() => setDeleteId(x.id)}
                />
                {deleteId === x.id && (
                  <View style={s.row}>
                    <Action
                      title="Xác nhận xóa bản lưu"
                      disabled={writing}
                      onPress={() => {
                        if (writing) return;
                        void persist(saved.filter((v) => v.id !== x.id));
                        setDeleteId(null);
                      }}
                    />
                    <Action
                      title="Giữ bản lưu"
                      disabled={writing}
                      onPress={() => setDeleteId(null)}
                    />
                  </View>
                )}
                <Action
                  title="Chia sẻ quyết định"
                  onPress={() =>
                    void Share.share({
                      message: `${x.row.name}\nGiá tham khảo: ${x.row.price === null ? "chưa rõ" : money(x.row.price)}\n${observationAgeLabel(x.row.observedAt)}\nTrần chi tiêu: ${money(x.needs.budget)}\n${x.row.url}\nChưa xác minh tổng thanh toán hoặc tương thích workload.`,
                    }).catch(() => setError("Không chia sẻ được."))
                  }
                />
              </View>
            ))}
        </>
      )}
    </View>
  );
}

const makeStyles = (LIGHT: ReturnType<typeof legacyPalette>) =>
  StyleSheet.create({
    card: {
      padding: 20,
      gap: 12,
      backgroundColor: LIGHT.surface,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: LIGHT.line,
    },
    heading: {
      fontSize: 21,
      lineHeight: 29,
      fontWeight: "700",
      color: LIGHT.text,
    },
    body: { fontSize: 15, lineHeight: 23, color: LIGHT.muted },
    caption: { fontSize: 13, lineHeight: 20, color: LIGHT.muted },
    price: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "800",
      color: LIGHT.primary,
      fontVariant: ["tabular-nums"],
    },
    warning: {
      fontSize: 14,
      lineHeight: 22,
      color: LIGHT.onSecondary,
      backgroundColor: LIGHT.container,
      padding: 12,
      borderRadius: 12,
    },
    input: {
      minHeight: 52,
      padding: 14,
      borderWidth: 1,
      borderColor: LIGHT.line,
      borderRadius: 14,
      fontSize: 16,
      color: LIGHT.text,
    },
    button: {
      minHeight: 48,
      padding: 14,
      borderRadius: 18,
      backgroundColor: LIGHT.primary,
      justifyContent: "center",
    },
    action: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
      color: LIGHT.surface,
    },
    row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  });
