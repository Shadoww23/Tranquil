// Shared UI helpers for the extension: colour scales, the full store-page card,
// and the compact browse-page badge. No Tailwind here, so styles are inline and
// mirror the web app's risk/joy scales.

import type { DesignRiskScore, JoyIndex, Recommendation } from "../../src/lib/types";
import type { Scored } from "./score";

export const CARD_ID = "tranquil-card";
export const BADGE_CLASS = "tranquil-badge";
export const BADGE_MARK = "data-tranquil-badged";

export function riskColor(v: number): string {
  if (v <= 15) return "#10b981";
  if (v <= 40) return "#3b82f6";
  if (v <= 65) return "#f59e0b";
  return "#ef4444";
}
export function joyColor(v: number): string {
  if (v >= 75) return "#10b981";
  if (v >= 50) return "#3b82f6";
  if (v >= 25) return "#f59e0b";
  return "#ef4444";
}

const VERDICT_META: Record<Recommendation["verdict"], { label: string; color: string }> = {
  healthy: { label: "Healthy", color: "#10b981" },
  mindful: { label: "Mindful", color: "#3b82f6" },
  caution: { label: "Caution", color: "#f59e0b" },
  "red-flag": { label: "Red Flag", color: "#ef4444" },
};

function el(tag: string, style: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  node.setAttribute("style", style);
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---- Full card (store app page) --------------------------------------------
export function buildCard(
  risk: DesignRiskScore,
  joy: JoyIndex,
  rec: Recommendation,
  siteUrl: string
): HTMLElement {
  const verdict = VERDICT_META[rec.verdict];

  const card = el(
    "div",
    `all:revert;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
     margin:12px 0;padding:16px;border-radius:14px;background:#1b2838;border:1px solid #2a475e;color:#c7d5e0;`
  );
  card.id = CARD_ID;

  const header = el("div", "display:flex;align-items:center;gap:8px;margin-bottom:12px;");
  const dot = el("div", "width:18px;height:18px;border-radius:5px;background:#8b5cf6;flex:none;");
  const brand = el("div", "font-weight:700;font-size:14px;color:#ffffff;", "Tranquil");
  const conf = el(
    "div",
    "margin-left:auto;font-size:11px;color:#7a8a99;",
    risk.confidence === "high" ? "Verified" : "Estimated from store data"
  );
  header.append(dot, brand, conf);

  const scores = el("div", "display:flex;gap:20px;align-items:baseline;margin-bottom:10px;");
  const mkScore = (label: string, value: number, color: string) => {
    const box = el("div", "");
    box.append(
      el("div", `font-size:26px;font-weight:800;line-height:1;color:${color};`, String(value)),
      el("div", "font-size:11px;color:#8ba0b2;margin-top:3px;", label)
    );
    return box;
  };
  const verdictBox = el(
    "div",
    `margin-left:auto;font-size:12px;font-weight:700;padding:5px 10px;border-radius:999px;
     background:${verdict.color}22;color:${verdict.color};`,
    verdict.label
  );
  scores.append(
    mkScore("Design Risk", risk.total, riskColor(risk.total)),
    mkScore("Joy Index", joy.total, joyColor(joy.total)),
    verdictBox
  );

  card.append(header, scores);

  const factors = [...risk.factors].sort((a, b) => b.points - a.points).slice(0, 3);
  if (factors.length > 0) {
    const list = el("div", "display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;");
    for (const f of factors) {
      const chip = el(
        "span",
        "font-size:11px;padding:3px 8px;border-radius:999px;background:#2a475e;color:#c7d5e0;cursor:help;",
        `${f.label} +${f.points}`
      );
      if (f.reason) chip.title = f.reason;
      list.append(chip);
    }
    card.append(list);
  } else {
    card.append(
      el("div", "font-size:12px;color:#8ba0b2;margin-top:2px;", "No concern patterns detected.")
    );
  }

  const footer = el(
    "div",
    "display:flex;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid #2a475e;"
  );
  const link = document.createElement("a");
  link.setAttribute(
    "style",
    "margin-left:auto;font-size:11px;font-weight:600;color:#8b5cf6;text-decoration:none;"
  );
  link.href = siteUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Open Tranquil ↗";
  footer.append(link);
  card.append(footer);

  return card;
}

// ---- Compact badge (browse / search / wishlist tiles) ----------------------
// A small pill pinned to a game tile: Design Risk + Joy, colour-coded, with the
// verdict on hover. Kept tiny so it never fights the store's own art.
export function buildBadge(scored: Scored): HTMLElement {
  const verdict = VERDICT_META[scored.rec.verdict];
  const badge = el(
    "div",
    `position:absolute;top:6px;right:6px;z-index:5;display:flex;gap:5px;align-items:center;
     padding:3px 7px;border-radius:999px;pointer-events:auto;
     font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;font-weight:700;
     line-height:1;background:rgba(23,26,33,0.92);border:1px solid #2a475e;box-shadow:0 1px 4px rgba(0,0,0,0.4);`
  );
  badge.className = BADGE_CLASS;
  badge.title = `Tranquil — ${verdict.label} · Design Risk ${scored.risk.total} · Joy ${scored.joy.total}`;

  const dot = el("span", "width:8px;height:8px;border-radius:2px;background:#8b5cf6;flex:none;");
  const risk = el("span", `color:${riskColor(scored.risk.total)};`, `R ${scored.risk.total}`);
  const sep = el("span", "color:#4b5b6b;", "·");
  const joy = el("span", `color:${joyColor(scored.joy.total)};`, `J ${scored.joy.total}`);
  badge.append(dot, risk, sep, joy);
  return badge;
}
