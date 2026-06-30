import type { PredatoryScore, JoyIndex, Recommendation } from "../types";

export function generateRecommendation(
  predatoryScore: PredatoryScore,
  joyIndex: JoyIndex
): Recommendation {
  const p = predatoryScore.total;
  const j = joyIndex.total;

  if (p <= 10 && j >= 70) {
    return {
      verdict: "healthy",
      headline: "This game respects your time and wallet",
      detail:
        "Clean monetization, strong community satisfaction, and genuine gameplay depth make this a safe pick.",
      actions: ["Play freely", "Worth recommending to others"],
    };
  }

  if (p <= 35 && j >= 50) {
    return {
      verdict: "mindful",
      headline: "Enjoy mindfully",
      detail:
        "Some mild monetization exists, but the core game offers genuine value. Stay aware of spending triggers.",
      actions: [
        "Set a monthly cosmetics budget",
        "Ignore FOMO event pressure",
        "Focus on what you genuinely enjoy",
      ],
    };
  }

  if (p <= 65) {
    return {
      verdict: "caution",
      headline: "Proceed with caution",
      detail:
        "Significant predatory design elements are present. Set firm spending and time limits before playing.",
      actions: [
        "Set a hard spending limit before launching",
        "Use parental controls if playing with minors",
        "Track your playtime weekly",
      ],
    };
  }

  return {
    verdict: "red-flag",
    headline: "Red flags: predatory design detected",
    detail:
      "This game employs multiple mechanisms designed to maximize spending over enjoyment. Proceed with extreme caution.",
    actions: [
      "Consider evidence-based alternatives",
      "If you play, set a hard budget and strict time limits",
      "Be aware of sunk-cost manipulation tactics",
    ],
  };
}
