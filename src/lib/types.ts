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
}

export interface DesignRiskScore {
  total: number;
  breakdown: {
    monetization: number;
    manipulation: number;
    compulsion: number;
  };
  flags: string[];
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
