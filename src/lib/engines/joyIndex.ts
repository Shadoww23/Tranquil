import type { Game, PredatoryScore, JoyIndex, JoyLabel } from "../types";

// Joy = genuine enjoyment measured against community sentiment and predatory penalty.
// communityScore contributes up to 80 points; predatory mechanics reduce it by up to 30%.
export function calculateJoyIndex(game: Game, predatoryScore: PredatoryScore): JoyIndex {
  const base = game.communityScore * 0.8;
  const penalty = predatoryScore.total * 0.3;
  const total = Math.max(0, Math.min(100, Math.round(base - penalty)));
  return { total, label: joyLabel(total) };
}

function joyLabel(score: number): JoyLabel {
  if (score >= 75) return "Excellent";
  if (score >= 50) return "Good";
  if (score >= 25) return "Fair";
  return "Poor";
}
