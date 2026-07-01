import { describe, it, expect } from "vitest";
import { recommendGames } from "../recommend";
import { mockGameLibrary } from "../data";
import {
  calculateDesignRiskScore,
  calculateJoyIndex,
  detectHabitPatterns,
  generateRecommendation,
  defaultProfile,
} from "../engines";
import type { AnalyzedGame, Game } from "../types";

function analyze(game: Game): AnalyzedGame {
  const designRiskScore = calculateDesignRiskScore(game);
  const joyIndex = calculateJoyIndex(game, designRiskScore);
  const detectedPatterns = detectHabitPatterns(game);
  const recommendation = generateRecommendation(designRiskScore, joyIndex);
  return { ...game, designRiskScore, joyIndex, detectedPatterns, recommendation };
}

const catalog = mockGameLibrary.map(analyze);

describe("recommendGames", () => {
  it("never recommends caution or red-flag games", () => {
    const recs = recommendGames(catalog, catalog, defaultProfile(), false);
    for (const r of recs) {
      expect(["healthy", "mindful"]).toContain(r.game.recommendation.verdict);
    }
    expect(recs.length).toBeGreaterThan(0);
  });

  it("ranks by lowest personal concern first", () => {
    const recs = recommendGames(catalog, catalog, defaultProfile(), false);
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i].personal.score).toBeGreaterThanOrEqual(recs[i - 1].personal.score);
    }
  });

  it("prefers unplayed backlog games for a real library", () => {
    // A small library: one unplayed clean game + one heavily-played clean game.
    const unplayed = { ...analyze(mockGameLibrary.find((g) => g.id === "hollow-knight")!), hoursPlayed: 0 };
    const played = { ...analyze(mockGameLibrary.find((g) => g.id === "hades")!), hoursPlayed: 120 };
    const recs = recommendGames([unplayed, played], catalog, defaultProfile(), true);
    // The unplayed game should be surfaced with the backlog reason.
    const backlog = recs.find((r) => r.game.id === "hollow-knight");
    expect(backlog?.reason).toBe("In your backlog");
    // The heavily-played game should not be presented as backlog.
    expect(recs.find((r) => r.game.id === "hades")?.reason).not.toBe("In your backlog");
  });

  it("excludes games the user already owns from discovery", () => {
    const owned = [analyze(mockGameLibrary.find((g) => g.id === "stardew-valley")!)];
    const recs = recommendGames(owned, catalog, defaultProfile(), true);
    // Stardew is owned+played → must not appear as a "discover" suggestion.
    const stardewDiscover = recs.find(
      (r) => r.game.id === "stardew-valley" && r.reason === "Worth discovering"
    );
    expect(stardewDiscover).toBeUndefined();
  });

  it("respects the limit", () => {
    expect(recommendGames(catalog, catalog, defaultProfile(), false, 3).length).toBeLessThanOrEqual(3);
  });
});
