import type { Game, DesignRiskScore, RiskFactor, MonetizationImpact } from "../types";

// Severity-based Design Risk model.
//
// The core idea: score by *harm*, not by the mere presence of a mechanic. The
// same battle pass is trivial if it sells cosmetics and serious if it sells
// power, so direct-purchase mechanics scale by `monetizationImpact`. This is
// what stops the model from punishing multiplayer/live-service games simply for
// being monetised. Randomised purchases (gacha/loot boxes) keep a meaningful
// baseline even when cosmetic, because the gambling mechanic is itself a
// concern — but they weigh more when they affect power.
const W = {
  payToWin: 25,
  gachaBase: 15,
  gachaPowerBonus: 10,
  lootBoxesBase: 12,
  lootBoxesPowerBonus: 8,
  ads: 8,
  dlcPerTitle: 1,
  maxDlcPoints: 5,
  socialPressure: 4,
  energySystem: 12,
  dailyLoginBonus: 5,
  limitedTimeEventsBase: 6,
  limitedTimeEventsSpendBonus: 6,
} as const;

// Direct-purchase mechanics: points scale by what the money actually buys.
const DIRECT_PURCHASE: Record<
  "battlePass" | "seasonPass" | "microtransactions",
  Record<MonetizationImpact, number>
> = {
  battlePass: { none: 0, cosmetic: 2, convenience: 6, power: 12 },
  seasonPass: { none: 0, cosmetic: 2, convenience: 5, power: 10 },
  microtransactions: { none: 0, cosmetic: 2, convenience: 6, power: 12 },
};

// Theoretical maximum contribution per category, used by the breakdown bars.
export const RISK_MAX = { monetization: 117, manipulation: 16, compulsion: 17 } as const;

// When a game doesn't carry an explicit monetizationImpact fact, infer it
// conservatively: pay-to-win is unambiguous power; any other monetisation is
// charitably treated as cosmetic (and flagged low-confidence elsewhere) rather
// than accusing a game of pay-for-power we can't verify.
function resolveImpact(game: Game): MonetizationImpact {
  const m = game.mechanics;
  if (m.monetizationImpact) return m.monetizationImpact;
  if (m.hasPayToWin) return "power";
  if (
    m.hasGacha ||
    m.hasLootBoxes ||
    m.hasMicrotransactions ||
    m.hasBattlePass ||
    m.hasSeasonPass
  ) {
    return "cosmetic";
  }
  return "none";
}

function directPurchaseReason(subject: string, impact: MonetizationImpact): string {
  switch (impact) {
    case "power":
      return `${subject} sells items that affect gameplay or progression.`;
    case "convenience":
      return `${subject} sells time-savers/convenience, not power.`;
    default:
      return `${subject} sells cosmetic items only — no gameplay advantage.`;
  }
}

export function calculateDesignRiskScore(game: Game): DesignRiskScore {
  const m = game.mechanics;
  const impact = resolveImpact(game);
  const factors: RiskFactor[] = [];

  const add = (
    label: string,
    category: RiskFactor["category"],
    points: number,
    reason: string
  ) => {
    if (points > 0) factors.push({ label, category, points, reason });
  };

  // --- Monetization ---
  if (m.hasPayToWin) {
    add("Pay-to-Win", "monetization", W.payToWin,
      "Paying grants a direct gameplay or competitive advantage.");
  }
  if (m.hasGacha) {
    const power = impact === "power";
    add("Gacha System", "monetization", W.gachaBase + (power ? W.gachaPowerBonus : 0),
      power
        ? "Randomised paid pulls for characters/gear that affect power."
        : "Randomised paid pulls — gambling-like mechanics, cosmetic outcomes.");
  }
  if (m.hasLootBoxes) {
    const power = impact === "power";
    add("Loot Boxes", "monetization", W.lootBoxesBase + (power ? W.lootBoxesPowerBonus : 0),
      power
        ? "Randomised paid containers that can affect gameplay."
        : "Randomised paid containers — gambling-like mechanics, cosmetic outcomes.");
  }
  if (m.hasBattlePass) {
    add("Battle Pass", "monetization", DIRECT_PURCHASE.battlePass[impact],
      directPurchaseReason("A battle pass", impact));
  }
  if (m.hasSeasonPass) {
    add("Season Pass", "monetization", DIRECT_PURCHASE.seasonPass[impact],
      directPurchaseReason("A season pass", impact));
  }
  if (m.hasMicrotransactions) {
    add("Microtransactions", "monetization", DIRECT_PURCHASE.microtransactions[impact],
      directPurchaseReason("In-game purchases", impact));
  }
  if (m.hasAds) {
    add("In-Game Ads", "monetization", W.ads,
      "Advertising interrupts play or pressures purchases to remove it.");
  }
  const dlcPoints = Math.min(m.dlcCount * W.dlcPerTitle, W.maxDlcPoints);
  if (dlcPoints > 0) {
    add("Paid DLC", "monetization", dlcPoints,
      `${m.dlcCount} paid add-on${m.dlcCount !== 1 ? "s" : ""} beyond the base game.`);
  }

  // --- Manipulation ---
  if (m.hasLimitedTimeEvents) {
    const spend = impact === "power" || impact === "convenience";
    add("FOMO Events", "manipulation",
      W.limitedTimeEventsBase + (spend ? W.limitedTimeEventsSpendBonus : 0),
      spend
        ? "Time-limited content tied to spending pressure."
        : "Time-limited content — mild fear-of-missing-out, cosmetic stakes.");
  }
  if (m.hasSocialPressure) {
    add("Social Pressure", "manipulation", W.socialPressure,
      "Competitive/social mechanics can create obligation to keep playing.");
  }

  // --- Compulsion ---
  if (m.hasEnergySystem) {
    add("Energy System", "compulsion", W.energySystem,
      "Artificial play limits pressure you to wait or pay to continue.");
  }
  if (m.hasDailyLoginBonus) {
    add("Daily Login Bonus", "compulsion", W.dailyLoginBonus,
      "Daily rewards nudge habitual logins regardless of genuine desire.");
  }

  const sumCat = (cat: RiskFactor["category"]) =>
    factors.filter((f) => f.category === cat).reduce((s, f) => s + f.points, 0);

  const monetization = sumCat("monetization");
  const manipulation = sumCat("manipulation");
  const compulsion = sumCat("compulsion");
  const total = Math.min(100, Math.round(monetization + manipulation + compulsion));

  return {
    total,
    breakdown: {
      monetization: Math.min(100, monetization),
      manipulation,
      compulsion,
    },
    flags: factors.map((f) => f.label),
    factors,
    confidence: m.source === "inferred" ? "low" : "high",
  };
}
