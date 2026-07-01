import { describe, it, expect } from "vitest";
import { generateRecommendation } from "../recommendations";
import type { DesignRiskScore, JoyIndex } from "../../types";

function makeScore(total: number): DesignRiskScore {
  return { total, breakdown: { monetization: 0, manipulation: 0, compulsion: 0 }, flags: [] };
}

function makeJoy(total: number): JoyIndex {
  const label = total >= 75 ? "Excellent" : total >= 50 ? "Good" : total >= 25 ? "Fair" : "Poor";
  return { total, label };
}

describe("generateRecommendation", () => {
  it("returns healthy for a clean, high-joy game", () => {
    const result = generateRecommendation(makeScore(0), makeJoy(85));
    expect(result.verdict).toBe("healthy");
    expect(result.actions.length).toBeGreaterThan(0);
  });

  it("returns mindful for moderate predatory score with decent joy", () => {
    const result = generateRecommendation(makeScore(25), makeJoy(60));
    expect(result.verdict).toBe("mindful");
  });

  it("returns caution for moderately-high predatory score", () => {
    const result = generateRecommendation(makeScore(50), makeJoy(40));
    expect(result.verdict).toBe("caution");
  });

  it("returns red-flag for high predatory score", () => {
    const result = generateRecommendation(makeScore(80), makeJoy(20));
    expect(result.verdict).toBe("red-flag");
  });

  it("returns red-flag when predatory score is 100", () => {
    const result = generateRecommendation(makeScore(100), makeJoy(0));
    expect(result.verdict).toBe("red-flag");
    expect(result.headline).toMatch(/red flag/i);
  });

  it("all verdicts include non-empty actions array", () => {
    const scenarios = [
      [makeScore(0), makeJoy(85)],
      [makeScore(25), makeJoy(60)],
      [makeScore(50), makeJoy(40)],
      [makeScore(90), makeJoy(10)],
    ] as const;

    for (const [score, joy] of scenarios) {
      const result = generateRecommendation(score, joy);
      expect(result.actions.length).toBeGreaterThan(0);
      expect(result.headline.length).toBeGreaterThan(0);
      expect(result.detail.length).toBeGreaterThan(0);
    }
  });
});
