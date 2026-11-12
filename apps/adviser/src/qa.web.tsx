import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import App from "./App";
import { OFFERS, SAMPLE_PROFILE, DATASET_VERSION } from "./domain";
import "./web.css";
declare global {
  interface Window {
    __LUA_QA_SCENARIO__?: string;
  }
}
const mode = window.__LUA_QA_SCENARIO__ || "flow";
const initial = {
  version: 1,
  profile: SAMPLE_PROFILE,
  saved: [],
  offers: OFFERS,
};
const seed =
  mode === "storage-invalid"
    ? {
        ...initial,
        profile: { ...SAMPLE_PROFILE, budget: 1000000 },
        offers: [],
      }
    : mode === "storage-restore"
      ? {
          ...initial,
          profile: { ...SAMPLE_PROFILE, budget: 1000000 },
          saved: [
            {
              id: "restore-check",
              name: "Phương án từ phiên trước",
              profile: SAMPLE_PROFILE,
              productIds: ["p1"],
              savedAt: "2026-11-11T09:00:00.000Z",
              datasetVersion: DATASET_VERSION,
            },
          ],
        }
      : initial;
localStorage.setItem("lua-demo-v1", JSON.stringify(seed));
flushSync(() =>
  createRoot(document.getElementById("root")!).render(
    <App
      storage={{
        read: () => localStorage.getItem("lua-demo-v1"),
        write: (v) => {
          if (mode === "storage-denied")
            throw Error("Simulated storage failure");
          localStorage.setItem("lua-demo-v1", v);
        },
      }}
    />,
  ),
);
setTimeout(() => {
  const checks: string[] = [];
  const assert = (label: string, ok: unknown) => {
    if (!ok) throw Error(label);
    checks.push(label);
  };
  const byId = (id: string) =>
    document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  const button = (label: string) =>
    Array.from(document.querySelectorAll<HTMLElement>('[role="button"]'))
      .filter((x) => x.textContent?.includes(label))
      .sort(
        (a, b) => (a.textContent?.length || 0) - (b.textContent?.length || 0),
      )[0];
  const click = (el: Element | null | undefined) => {
    if (!(el instanceof HTMLElement)) throw Error("Missing control");
    flushSync(() => el.click());
  };
  const input = (el: HTMLElement | null, value: string) => {
    if (!el) throw Error("Missing input");
    flushSync(() => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };
  const stored = () => JSON.parse(localStorage.getItem("lua-demo-v1")!);
  try {
    if (mode === "storage-invalid") {
      assert("Invalid payload is not partially applied", !byId("no-fit"));
      assert(
        "Invalid stored payload is preserved until explicit reset",
        stored().offers.length === 0,
      );
      assert(
        "Storage warning is shown",
        document.body.textContent?.includes("Không đọc được dữ liệu lưu"),
      );
    } else if(mode==='layout-mobile') {
      assert('Mobile discovery has no horizontal overflow',document.documentElement.scrollWidth<=window.innerWidth+1);
      click(document.querySelector('[aria-label="So sánh Néo Air 14"]'));
      click(document.querySelector('[aria-label="So sánh Forma Pro 14"]'));
      click(button('So sánh · 2'));
      assert('Mobile paired comparison is readable without page overflow',document.documentElement.scrollWidth<=window.innerWidth+1&&document.body.textContent?.includes('32 GB'));
      click(button('Khám phá'));click(byId('start-advice'));
      assert('Mobile wizard opens and retains task controls',!!byId('task-code'));
      click(byId('wizard-next'));
      assert('Mobile budget entry remains inside viewport',byId('budget-input')!.getBoundingClientRect().right<=window.innerWidth);
    } else if (mode === "storage-denied") {
      click(document.querySelector('[aria-label="Lưu Néo Air 14"]'));
      assert(
        "Write failure preserves prior stored decisions",
        stored().saved.length === 0,
      );
      assert(
        "Write failure is explicitly disclosed",
        document.body.textContent?.includes("chưa lưu trên thiết bị"),
      );
      click(byId("nav-saved"));
      assert("In-session decision remains usable", !!button("Mở phương án"));
    } else if (mode === "storage-restore") {
      assert(
        "Stored profile loads with its original cap",
        !!byId("no-fit") && stored().profile.budget === 1000000,
      );
      click(byId("nav-saved"));
      assert(
        "Saved decision loads from prior payload",
        document.body.textContent?.includes("Phương án từ phiên trước"),
      );
    } else {
      assert(
        "Initial shortlist renders three eligible variants",
        document.querySelectorAll('[data-testid="product-card"]').length === 3,
      );
      click(document.querySelector('[aria-label="So sánh Néo Air 14"]'));
      click(document.querySelector('[aria-label="So sánh Forma Pro 14"]'));
      click(byId("nav-compare"));
      assert(
        "Comparison keeps exact variants and RAM values",
        document.body.textContent?.includes("32 GB") &&
          document.body.textContent?.includes("Néo Air 14"),
      );
      click(button("Lưu phương án so sánh"));
      assert(
        "Saving writes both variant IDs to local storage",
        stored().saved[0].productIds.length === 2,
      );
      assert(
        "Save retains dated offer observations",
        stored().saved[0].observations[0].total === 18900000 &&
          stored().saved[0].observations[0].observedAt.includes("11/11/2026"),
      );
      click(byId("nav-saved"));
      assert(
        "Saved workspace exposes reopen and export actions",
        !!button("Mở phương án") && !!button("Xuất tóm tắt"),
      );
      click(byId("nav-discover"));
      click(byId("start-advice"));
      click(byId("task-vm"));
      click(button("Chưa rõ"));
      click(byId("wizard-next"));
      input(byId("budget-input"), "1000000");
      click(byId("wizard-next"));
      click(byId("wizard-next"));
      click(byId("wizard-next"));
      assert("No-fit is explicit", !!byId("no-fit"));
      assert(
        "Exact budget and unknown VM requirement remain unchanged",
        stored().profile.budget === 1000000 &&
          stored().profile.vm === "unknown",
      );
      click(button("Bạn đang là khách"));
      click(button("Khôi phục hồ sơ mặc định"));
      click(document.querySelector('[aria-label="Xem Néo Air 14"]'));
      assert(
        "Detail shows conditional discount separately",
        document.body.textContent?.includes(
          "Chưa xác nhận, chưa trừ vào tổng.",
        ),
      );
      click(button("Xem đề nghị"));
      assert(
        "Buying action shows simulation, never checkout",
        document.body.textContent?.includes(
          "Không có cửa hàng thật, giao dịch",
        ),
      );
      click(byId("sheet-close"));
      click(document.querySelector('[aria-label="Xem Néo Air 14"]'));
      click(button("Giải thích lựa chọn này"));
      let advice: (() => void) | undefined;
      const real = window.setTimeout;
      window.setTimeout = ((
        fn: TimerHandler,
        ms?: number,
        ...args: unknown[]
      ) => {
        if (ms === 450 && typeof fn === "function") {
          advice = () => fn(...args);
          return 999999;
        }
        return real(fn, ms, ...args);
      }) as typeof window.setTimeout;
      click(button("Có lựa chọn nào rẻ hơn?"));
      flushSync(() => advice?.());
      window.setTimeout = real;
      assert(
        "Rule-based adviser renders grounded cheaper alternative",
        document.body.textContent?.includes(
          "Mộc Everyday 15 có tổng giá thấp nhất",
        ),
      );
      assert(
        "Adviser explicitly discloses no live AI connection",
        document.body.textContent?.includes("không kết nối mô hình AI"),
      );
      click(byId("sheet-close"));
      click(button("Xưởng dữ liệu mẫu"));
      input(byId("studio-price"), "-5");
      click(button("Kiểm tra & áp dụng"));
      assert(
        "Workshop rejects negative prices",
        stored().offers.find((o: { id: string }) => o.id === "o1").base ===
          18700000,
      );
      input(byId("studio-price"), "21900000");
      click(button("Kiểm tra & áp dụng"));
      assert(
        "Validated workshop edit updates stored offer",
        stored().offers.find((o: { id: string }) => o.id === "o1").base ===
          21900000,
      );
      click(byId("nav-discover"));
      assert(
        "Shortlist recomputes using next lowest complete offer",
        document.body.textContent?.includes("19.100.000"),
      );
    }
    console.info(
      "LUA_QA_PASS " + JSON.stringify({ mode, count: checks.length }),
    );
    checks.forEach((label) => console.info("LUA_CHECK " + label));
  } catch (e) {
    console.error(
      "LUA_QA_FAIL " +
        JSON.stringify({ mode, error: String(e), passed: checks }),
    );
  }
}, 0);
