import type { Game, PredatoryScore } from "../types";

// Weights chosen to produce a 0-100 score where 100 = maximally predatory.
// Maximum possible without capping: 20+15+20+10+5+5 + 15+8 + 15+7+5 = 125
const W = {
  gacha: 20,
  lootBoxes: 15,
  payToWin: 20,
  battlePass: 10,
  seasonPass: 5,
  microtransactions: 5,
  limitedTimeEvents: 15,
  socialPressure: 8,
  energySystem: 15,
  dailyLoginBonus: 7,
  dlcPerTitle: 1,
  maxDlcPoints: 5,
} as const;

export function calculatePredatoryScore(game: Game): PredatoryScore {
  const { mechanics } = game;
  const flags: string[] = [];

  let monetization = 0;
  let manipulation = 0;
  let compulsion = 0;

  if (mechanics.hasGacha) { monetization += W.gacha; flags.push("Gacha System"); }
  if (mechanics.hasLootBoxes) { monetization += W.lootBoxes; flags.push("Loot Boxes"); }
  if (mechanics.hasPayToWin) { monetization += W.payToWin; flags.push("Pay-to-Win"); }
  if (mechanics.hasBattlePass) { monetization += W.battlePass; flags.push("Battle Pass"); }
  if (mechanics.hasSeasonPass) { monetization += W.seasonPass; flags.push("Season Pass"); }
  if (mechanics.hasMicrotransactions) { monetization += W.microtransactions; flags.push("Microtransactions"); }
  monetization += Math.min(mechanics.dlcCount * W.dlcPerTitle, W.maxDlcPoints);

  if (mechanics.hasLimitedTimeEvents) { manipulation += W.limitedTimeEvents; flags.push("FOMO Events"); }
  if (mechanics.hasSocialPressure) { manipulation += W.socialPressure; flags.push("Social Pressure"); }

  if (mechanics.hasEnergySystem) { compulsion += W.energySystem; flags.push("Energy System"); }
  if (mechanics.hasDailyLoginBonus) { compulsion += W.dailyLoginBonus; flags.push("Daily Login Bonus"); }

  const total = Math.min(100, Math.round(monetization + manipulation + compulsion));

  return {
    total,
    breakdown: {
      monetization: Math.min(100, monetization),
      manipulation,
      compulsion,
    },
    flags,
  };
}
