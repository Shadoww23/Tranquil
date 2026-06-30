import type { Game, DetectedPattern } from "../types";

export function detectHabitPatterns(game: Game): DetectedPattern[] {
  const { mechanics } = game;
  const patterns: DetectedPattern[] = [];

  if (mechanics.hasDailyLoginBonus) {
    patterns.push({
      pattern: "Daily Login Hook",
      severity: "medium",
      description:
        "Rewards tuned to make you log in every day regardless of genuine desire to play.",
    });
  }

  if (mechanics.hasEnergySystem) {
    patterns.push({
      pattern: "Energy System",
      severity: "high",
      description:
        "Artificial play limits create urgency and pressure to return or pay to continue.",
    });
  }

  if (mechanics.hasLimitedTimeEvents) {
    patterns.push({
      pattern: "FOMO Pressure",
      severity: mechanics.hasMicrotransactions ? "high" : "low",
      description:
        "Time-limited content creates fear of missing out, driving compulsive engagement.",
    });
  }

  if (mechanics.hasGacha || mechanics.hasLootBoxes) {
    patterns.push({
      pattern: "Gacha Loop",
      severity: "high",
      description:
        "Variable reward schedules exploit gambling psychology to keep players spending.",
    });
  }

  if (mechanics.hasPayToWin) {
    patterns.push({
      pattern: "Pay-to-Progress",
      severity: "high",
      description:
        "Progression gated behind purchases creates artificial frustration to drive spending.",
    });
  }

  if (mechanics.hasSocialPressure) {
    patterns.push({
      pattern: "Social Obligation",
      severity: "medium",
      description:
        "Social mechanics create obligation to play so you don't let others down.",
    });
  }

  return patterns;
}
