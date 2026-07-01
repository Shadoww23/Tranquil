import type { GameMechanics } from "./types";

interface SteamCategory { id: number; description: string; }
interface SteamGenre { id: string; description: string; }

export interface SteamAppData {
  name: string;
  is_free: boolean;
  categories?: SteamCategory[];
  genres?: SteamGenre[];
  dlc?: number[];
  about_the_game?: string;
  short_description?: string;
  developers?: string[];
  publishers?: string[];
  metacritic?: { score: number; url: string };
  header_image?: string;
  price_overview?: { currency: string; initial: number; final: number; discount_percent: number };
}

// Category 35 = "In-App Purchases" in Steam's taxonomy
const CAT_IN_APP_PURCHASES = 35;

const KEYWORD_MAP: Partial<Record<keyof GameMechanics, string[]>> = {
  hasLootBoxes: ["loot box", "lootbox", "supply crate", "supply drop", "loot crate", "card pack"],
  hasGacha: ["gacha", "summon", "banner", "wish system", "pull system", "gate system"],
  hasBattlePass: ["battle pass", "battlepass", "combat pass", "premium pass"],
  hasSeasonPass: ["season pass", "year pass", "expansion pass"],
  hasMicrotransactions: ["microtransaction", "item shop", "in-game store", "cosmetic store", "virtual currency", "premium currency", "gems", "coins shop"],
  hasAds: ["rewarded ad", "video ad", "watch an ad", "advertisement"],
  hasEnergySystem: ["energy system", "stamina system", "action points", "fuel system"],
  hasDailyLoginBonus: ["daily login", "login bonus", "daily reward", "daily check-in"],
  hasLimitedTimeEvents: ["limited time", "seasonal event", "time-limited", "event ends", "ends in", "limited availability"],
  hasPayToWin: ["pay to win", "p2w", "pay-to-win", "purchase power", "buy advantages"],
  hasSocialPressure: ["compete with friends", "seasonal ranking", "ranked season", "social competition"],
};

function scanText(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

export function inferMechanicsFromSteamData(appData: SteamAppData): GameMechanics {
  const rawText = [appData.about_the_game ?? "", appData.short_description ?? ""]
    .join(" ")
    .replace(/<[^>]+>/g, "");

  const hasIAP = appData.categories?.some((c) => c.id === CAT_IN_APP_PURCHASES) ?? false;
  const isFree = appData.is_free ?? false;
  const dlcCount = Math.min(appData.dlc?.length ?? 0, 20);

  const hasMicrotransactions =
    hasIAP || isFree || scanText(rawText, KEYWORD_MAP.hasMicrotransactions!);

  return {
    hasLootBoxes: scanText(rawText, KEYWORD_MAP.hasLootBoxes!),
    hasGacha: scanText(rawText, KEYWORD_MAP.hasGacha!),
    hasBattlePass: scanText(rawText, KEYWORD_MAP.hasBattlePass!),
    hasSeasonPass: scanText(rawText, KEYWORD_MAP.hasSeasonPass!),
    hasMicrotransactions,
    hasAds: scanText(rawText, KEYWORD_MAP.hasAds!),
    hasEnergySystem: scanText(rawText, KEYWORD_MAP.hasEnergySystem!),
    hasDailyLoginBonus: scanText(rawText, KEYWORD_MAP.hasDailyLoginBonus!),
    hasLimitedTimeEvents: scanText(rawText, KEYWORD_MAP.hasLimitedTimeEvents!),
    hasPayToWin: scanText(rawText, KEYWORD_MAP.hasPayToWin!),
    hasSocialPressure: scanText(rawText, KEYWORD_MAP.hasSocialPressure!),
    dlcCount,
  };
}

// Maps Steam appids to our curated game IDs (hand-verified mechanic data)
export const CURATED_APPIDS: Record<number, string> = {
  413150: "stardew-valley",
  367520: "hollow-knight",
  1145360: "hades",
  504230: "celeste",
  1172470: "apex-legends",
  2669320: "ea-fc-25",
  252950: "rocket-league",
  292030: "witcher-3",
  632470: "disco-elysium",
  1086940: "baldurs-gate-3",
  32370: "kotor",
  435150: "divinity-original-sin-2",
  1097150: "fall-guys",
  1245620: "elden-ring",
  945360: "among-us",
};

const COVER_COLORS = [
  "bg-violet-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-teal-500", "bg-indigo-500", "bg-orange-500",
  "bg-pink-500", "bg-cyan-500", "bg-lime-500", "bg-purple-500",
];

export function appIdToCoverColor(appid: number): string {
  return COVER_COLORS[appid % COVER_COLORS.length];
}

export function emptMechanics(): GameMechanics {
  return {
    hasLootBoxes: false,
    hasGacha: false,
    hasBattlePass: false,
    hasSeasonPass: false,
    hasMicrotransactions: false,
    hasAds: false,
    hasEnergySystem: false,
    hasDailyLoginBonus: false,
    hasLimitedTimeEvents: false,
    hasPayToWin: false,
    hasSocialPressure: false,
    dlcCount: 0,
  };
}
