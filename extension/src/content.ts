// Tranquil for Steam — content script.
// Reuses the exact scoring engine from the web app (shared source), so a game's
// Design Risk / Joy is identical here and on the site. Runs on Steam store app
// pages: fetches appdetails same-origin, infers mechanics, scores, and injects a
// compact card near the game title.

import { inferMechanicsFromSteamData, type SteamAppData } from "../../src/lib/steamInference";
import {
  calculateDesignRiskScore,
  calculateJoyIndex,
  generateRecommendation,
} from "../../src/lib/engines";
import type { DesignRiskScore, Game, JoyIndex, Recommendation } from "../../src/lib/types";

const CARD_ID = "tranquil-card";

// Where the "Open Tranquil" link points. Update if the app is hosted elsewhere.
const SITE_URL = "https://tranquil.vercel.app";

function getAppId(): string | null {
  const m = location.pathname.match(/\/app\/(\d+)/);
  return m ? m[1] : null;
}

async function fetchAppData(appid: string): Promise<SteamAppData | null> {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&l=en`,
      { credentials: "omit" }
    );
    const json = await res.json();
    const entry = json?.[appid];
    if (!entry?.success) return null;
    return entry.data as SteamAppData;
  } catch {
    return null;
  }
}

function toGame(appid: string, data: SteamAppData): Game {
  const mechanics = inferMechanicsFromSteamData(data);
  const communityScore = data.metacritic?.score ?? (data.is_free ? 68 : 72);
  return {
    id: `steam-${appid}`,
    title: data.name,
    platform: "Steam",
    genre: (data.genres ?? []).map((g) => g.description),
    developer: (data.developers ?? ["Unknown"])[0],
    publisher: (data.publishers ?? ["Unknown"])[0],
    releaseYear: new Date().getFullYear(),
    hoursPlayed: 0,
    lastPlayed: "",
    price: 0,
    coverColor: "",
    mechanics,
    communityScore,
    steamAppId: Number(appid),
  };
}

// Hex colours mirroring the app's risk/joy scales (no Tailwind available here).
function riskColor(v: number): string {
  if (v <= 15) return "#10b981";
  if (v <= 40) return "#3b82f6";
  if (v <= 65) return "#f59e0b";
  return "#ef4444";
}
function joyColor(v: number): string {
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

function buildCard(risk: DesignRiskScore, joy: JoyIndex, rec: Recommendation): HTMLElement {
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

  // Top few contributing factors.
  const factors = [...risk.factors].sort((a, b) => b.points - a.points).slice(0, 3);
  if (factors.length > 0) {
    const list = el("div", "display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;");
    for (const f of factors) {
      const chip = el(
        "span",
        "font-size:11px;padding:3px 8px;border-radius:999px;background:#2a475e;color:#c7d5e0;cursor:help;",
        `${f.label} +${f.points}`
      );
      // The "why" behind each factor, on hover — mirrors the web app's factor list.
      if (f.reason) chip.title = f.reason;
      list.append(chip);
    }
    card.append(list);
  } else {
    card.append(
      el("div", "font-size:12px;color:#8ba0b2;margin-top:2px;", "No concern patterns detected.")
    );
  }

  // Footer: link back to the web app.
  const footer = el(
    "div",
    "display:flex;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid #2a475e;"
  );
  const link = document.createElement("a");
  link.setAttribute(
    "style",
    "margin-left:auto;font-size:11px;font-weight:600;color:#8b5cf6;text-decoration:none;"
  );
  link.href = SITE_URL;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Open Tranquil ↗";
  footer.append(link);
  card.append(footer);

  return card;
}

// Insert the card near the top of the store page's main column.
function mount(card: HTMLElement): boolean {
  const anchors = [
    ".apphub_HomeHeaderContent",
    ".apphub_AppName",
    "#game_highlights",
    ".page_title_area",
    ".block.game_background_glow",
  ];
  for (const sel of anchors) {
    const node = document.querySelector(sel);
    if (node) {
      // Insert after the anchor's nearest sensible container.
      const target = sel === ".apphub_AppName" ? node.closest(".apphub_HeaderStandardTop") ?? node : node;
      target.insertAdjacentElement("afterend", card);
      return true;
    }
  }
  return false;
}

async function run() {
  if (document.getElementById(CARD_ID)) return;
  const appid = getAppId();
  if (!appid) return;
  const data = await fetchAppData(appid);
  if (!data) return;

  const game = toGame(appid, data);
  const risk = calculateDesignRiskScore(game);
  const joy = calculateJoyIndex(game, risk);
  const rec = generateRecommendation(risk, joy);

  mount(buildCard(risk, joy, rec));
}

run();
