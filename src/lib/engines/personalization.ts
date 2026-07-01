import type {
  ConcernDimension,
  DesignRiskScore,
  PreferenceProfile,
} from "../types";

// The personal layer. It NEVER changes the objective Design Risk Score — it only
// re-weights that score's factors by how much a given user cares about each kind
// of concern, producing a separate "For you" reading.

const NEUTRAL = 1;
const MIN_WEIGHT = 0.3;
const MAX_WEIGHT = 2;
const NUDGE_STEP = 0.12;

export const DIMENSIONS: ConcernDimension[] = [
  "payForPower",
  "randomized",
  "cosmeticSpend",
  "fomo",
  "timeGate",
];

export const DIMENSION_META: Record<
  ConcernDimension,
  { label: string; description: string }
> = {
  payForPower: { label: "Pay-to-win", description: "Paying for gameplay or competitive advantage" },
  randomized: { label: "Loot boxes & gacha", description: "Randomised paid rewards (gambling-like)" },
  cosmeticSpend: { label: "Cosmetic spending", description: "Skins, battle passes, and item shops" },
  fomo: { label: "FOMO & events", description: "Limited-time pressure and social obligation" },
  timeGate: { label: "Time gates", description: "Energy systems and daily-login hooks" },
};

// Three-way sensitivity presets used by the preferences UI.
export const SENSITIVITY_LEVELS = [
  { key: "low" as const, label: "Don't mind", weight: 0.4 },
  { key: "neutral" as const, label: "Neutral", weight: NEUTRAL },
  { key: "high" as const, label: "Bothers me", weight: 1.7 },
];

export function defaultProfile(): PreferenceProfile {
  const weights = {} as Record<ConcernDimension, number>;
  for (const d of DIMENSIONS) weights[d] = NEUTRAL;
  return { weights, updatedAt: new Date().toISOString() };
}

// Map an arbitrary stored weight back to the nearest UI level.
export function weightToLevel(weight: number): "low" | "neutral" | "high" {
  if (weight <= 0.7) return "low";
  if (weight >= 1.35) return "high";
  return "neutral";
}

export type ConcernLabel = "None" | "Low" | "Moderate" | "High";

function concernLabel(total: number): ConcernLabel {
  if (total <= 8) return "None";
  if (total <= 25) return "Low";
  if (total <= 50) return "Moderate";
  return "High";
}

export interface PersonalConcern {
  score: number;
  label: ConcernLabel;
  /** The dimensions that drove this user's concern most, strongest first. */
  topDimensions: ConcernDimension[];
  /** How the personal reading compares to the objective one. */
  delta: number;
}

/**
 * Re-weight the objective factors by the user's sensitivities. A neutral profile
 * (all weights 1) returns exactly the objective total — personalization is
 * strictly opt-in.
 */
export function personalizedConcern(
  score: DesignRiskScore,
  profile: PreferenceProfile
): PersonalConcern {
  let weighted = 0;
  const byDimension = new Map<ConcernDimension, number>();

  for (const f of score.factors) {
    const w = profile.weights[f.dimension] ?? NEUTRAL;
    const contribution = f.points * w;
    weighted += contribution;
    byDimension.set(f.dimension, (byDimension.get(f.dimension) ?? 0) + contribution);
  }

  const total = Math.max(0, Math.min(100, Math.round(weighted)));
  const topDimensions = [...byDimension.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([d]) => d);

  return {
    score: total,
    label: concernLabel(total),
    topDimensions,
    delta: total - score.total,
  };
}

function clamp(n: number): number {
  return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, n));
}

/**
 * Learn from feedback on a specific game. "bothers" raises sensitivity for the
 * concern types that game actually uses; "fine" lowers them. This is the
 * per-user "gets more accurate over time" loop.
 */
export function nudgeProfile(
  profile: PreferenceProfile,
  score: DesignRiskScore,
  reaction: "fine" | "bothers"
): PreferenceProfile {
  const dims = new Set(score.factors.map((f) => f.dimension));
  const delta = reaction === "bothers" ? NUDGE_STEP : -NUDGE_STEP;
  const weights = { ...profile.weights };
  for (const d of dims) {
    weights[d] = Math.round(clamp((weights[d] ?? NEUTRAL) + delta) * 100) / 100;
  }
  return { weights, updatedAt: new Date().toISOString() };
}
