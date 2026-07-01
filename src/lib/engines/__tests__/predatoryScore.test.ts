import { describe, it, expect } from "vitest";
import { calculateDesignRiskScore } from "../predatoryScore";
import type { Game } from "../../types";

const baseGame: Game = {
  id: "test",
  title: "Test Game",
  platform: "Steam",
  genre: ["Action"],
  developer: "Dev",
  publisher: "Pub",
  releaseYear: 2023,
  hoursPlayed: 10,
  lastPlayed: "2025-01-01",
  price: 20,
  coverColor: "bg-stone-400",
  communityScore: 80,
  mechanics: {
    hasLootBoxes: false,
    hasBattlePass: false,
    hasSeasonPass: false,
    hasMicrotransactions: false,
    dlcCount: 0,
    hasEnergySystem: false,
    hasDailyLoginBonus: false,
    hasLimitedTimeEvents: false,
    hasPayToWin: false,
    hasGacha: false,
    hasSocialPressure: false,
    hasAds: false,
  },
};

describe("calculateDesignRiskScore", () => {
  it("returns 0 for a completely clean game", () => {
    const result = calculateDesignRiskScore(baseGame);
    expect(result.total).toBe(0);
    expect(result.flags).toHaveLength(0);
  });

  it("caps the score at 100", () => {
    const game: Game = {
      ...baseGame,
      mechanics: {
        hasLootBoxes: true,
        hasBattlePass: true,
        hasSeasonPass: true,
        hasMicrotransactions: true,
        dlcCount: 10,
        hasEnergySystem: true,
        hasDailyLoginBonus: true,
        hasLimitedTimeEvents: true,
        hasPayToWin: true,
        hasGacha: true,
        hasSocialPressure: true,
        hasAds: true,
      },
    };
    const result = calculateDesignRiskScore(game);
    expect(result.total).toBe(100);
  });

  it("scores gacha correctly", () => {
    const game: Game = {
      ...baseGame,
      mechanics: { ...baseGame.mechanics, hasGacha: true },
    };
    const result = calculateDesignRiskScore(game);
    expect(result.total).toBeGreaterThan(0);
    expect(result.flags).toContain("Gacha System");
    expect(result.breakdown.monetization).toBeGreaterThan(0);
  });

  it("scores cosmetic-only live-service mild (de-bias)", () => {
    const game: Game = {
      ...baseGame,
      mechanics: {
        ...baseGame.mechanics,
        hasBattlePass: true,
        hasLimitedTimeEvents: true,
        hasMicrotransactions: true,
        monetizationImpact: "cosmetic",
      },
    };
    const result = calculateDesignRiskScore(game);
    expect(result.flags).toContain("Battle Pass");
    expect(result.flags).toContain("FOMO Events");
    // A cosmetic battle pass + shop + events should stay mild, not "caution".
    expect(result.total).toBeLessThanOrEqual(15);
  });

  it("scores pay-for-power far higher than the same cosmetic mechanics", () => {
    const shared = {
      hasBattlePass: true,
      hasMicrotransactions: true,
      hasLimitedTimeEvents: true,
    };
    const cosmetic = calculateDesignRiskScore({
      ...baseGame,
      mechanics: { ...baseGame.mechanics, ...shared, monetizationImpact: "cosmetic" },
    });
    const power = calculateDesignRiskScore({
      ...baseGame,
      mechanics: { ...baseGame.mechanics, ...shared, monetizationImpact: "power" },
    });
    expect(power.total).toBeGreaterThan(cosmetic.total * 2);
  });

  it("weights gacha higher when it affects power, but counts it even when cosmetic", () => {
    const cosmeticGacha = calculateDesignRiskScore({
      ...baseGame,
      mechanics: { ...baseGame.mechanics, hasGacha: true, monetizationImpact: "cosmetic" },
    });
    const powerGacha = calculateDesignRiskScore({
      ...baseGame,
      mechanics: { ...baseGame.mechanics, hasGacha: true, monetizationImpact: "power" },
    });
    expect(powerGacha.total).toBeGreaterThan(cosmeticGacha.total);
    expect(cosmeticGacha.total).toBeGreaterThan(0);
  });

  it("marks inferred data low-confidence and verified data high-confidence", () => {
    const verified = calculateDesignRiskScore(baseGame);
    const inferred = calculateDesignRiskScore({
      ...baseGame,
      mechanics: { ...baseGame.mechanics, source: "inferred" },
    });
    expect(verified.confidence).toBe("high");
    expect(inferred.confidence).toBe("low");
  });

  it("gives every factor points and a plain-language reason", () => {
    const game: Game = {
      ...baseGame,
      mechanics: { ...baseGame.mechanics, hasPayToWin: true, hasEnergySystem: true },
    };
    const result = calculateDesignRiskScore(game);
    expect(result.factors.length).toBeGreaterThan(0);
    for (const f of result.factors) {
      expect(f.points).toBeGreaterThan(0);
      expect(f.reason.length).toBeGreaterThan(0);
    }
  });

  it("returns breakdown with correct categories", () => {
    const game: Game = {
      ...baseGame,
      mechanics: {
        ...baseGame.mechanics,
        hasDailyLoginBonus: true,
        hasEnergySystem: true,
      },
    };
    const result = calculateDesignRiskScore(game);
    expect(result.breakdown.compulsion).toBeGreaterThan(0);
    expect(result.breakdown.monetization).toBe(0);
    expect(result.breakdown.manipulation).toBe(0);
  });
});
