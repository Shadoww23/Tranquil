// What a game's real-money purchases actually buy. This is the key factual
// signal that lets the score distinguish cosmetic-only monetisation (low risk)
// from pay-for-power (high risk), instead of penalising any monetisation.
export type MonetizationImpact = "none" | "cosmetic" | "convenience" | "power";

export interface GameMechanics {
  hasLootBoxes: boolean;
  hasBattlePass: boolean;
  hasSeasonPass: boolean;
  hasMicrotransactions: boolean;
  dlcCount: number;
  hasEnergySystem: boolean;
  hasDailyLoginBonus: boolean;
  hasLimitedTimeEvents: boolean;
  hasPayToWin: boolean;
  hasGacha: boolean;
  hasSocialPressure: boolean;
  hasAds: boolean;
  /** What purchases buy. When omitted, the engine infers it conservatively. */
  monetizationImpact?: MonetizationImpact;
  /** Provenance of this data. "inferred" (Steam store guess) lowers confidence. */
  source?: "verified" | "inferred";
}

export interface Game {
  id: string;
  title: string;
  platform: "Steam" | "Epic" | "GOG";
  genre: string[];
  developer: string;
  publisher: string;
  releaseYear: number;
  hoursPlayed: number;
  lastPlayed: string;
  price: number;
  coverColor: string;
  mechanics: GameMechanics;
  communityScore: number;
  ageRating?: string;
  requiresOnline?: boolean;
  estimatedHoursToComplete?: number;
  steamAppId?: number;
  /** Explicit cover image URL; when absent we derive one from steamAppId. */
  coverImage?: string;
}

// The kinds of concern a player can be more or less sensitive to. Used by the
// per-user personalization layer to weight the objective factors — the facts
// themselves never change, only how much *this* user cares about each.
export type ConcernDimension =
  | "payForPower"
  | "randomized"
  | "cosmeticSpend"
  | "fomo"
  | "timeGate";

// A single scored mechanic, with the points it contributed and a plain-language
// reason — so a score can always explain itself rather than looking like a
// black box.
export interface RiskFactor {
  label: string;
  category: "monetization" | "manipulation" | "compulsion";
  dimension: ConcernDimension;
  points: number;
  reason: string;
}

// A user's personal sensitivities, stored locally. weight 1 = neutral, <1 =
// cares less, >1 = cares more. This drives the "For you" layer only.
export interface PreferenceProfile {
  weights: Record<ConcernDimension, number>;
  updatedAt: string;
  /** How the profile was set: neutral default, seeded from the library, or edited by the user. */
  source?: "default" | "derived" | "user";
}

export interface DesignRiskScore {
  total: number;
  breakdown: {
    monetization: number;
    manipulation: number;
    compulsion: number;
  };
  /** Human-readable labels of each contributing factor (back-compat). */
  flags: string[];
  /** Structured factors with points + reasons, for the "why". */
  factors: RiskFactor[];
  /** "high" = verified data; "low" = inferred from a store listing. */
  confidence: "high" | "low";
}

export type JoyLabel = "Excellent" | "Good" | "Fair" | "Poor";

export interface JoyIndex {
  total: number;
  label: JoyLabel;
}

export type HabitPattern =
  | "Daily Login Hook"
  | "Energy System"
  | "FOMO Pressure"
  | "Gacha Loop"
  | "Loot Boxes"
  | "Pay-to-Progress"
  | "Social Obligation";

export interface DetectedPattern {
  pattern: HabitPattern;
  severity: "low" | "medium" | "high";
  description: string;
}

export type RecommendationVerdict = "healthy" | "mindful" | "caution" | "red-flag";

export interface Recommendation {
  verdict: RecommendationVerdict;
  headline: string;
  detail: string;
  actions: string[];
}

export interface AnalyzedGame extends Game {
  designRiskScore: DesignRiskScore;
  joyIndex: JoyIndex;
  detectedPatterns: DetectedPattern[];
  recommendation: Recommendation;
}
