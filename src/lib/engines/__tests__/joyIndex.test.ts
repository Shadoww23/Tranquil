import { describe, it, expect } from "vitest";
import { calculateJoyIndex } from "../joyIndex";
import { calculateDesignRiskScore } from "../predatoryScore";
import type { Game } from "../../types";

const cleanMechanics = {
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
};

const makeGame = (communityScore: number, overrides = {}): Game => ({
  id: "test",
  title: "Test",
  platform: "Steam",
  genre: ["Action"],
  developer: "Dev",
  publisher: "Pub",
  releaseYear: 2023,
  hoursPlayed: 50,
  lastPlayed: "2025-01-01",
  price: 20,
  coverColor: "bg-stone-400",
  communityScore,
  mechanics: { ...cleanMechanics, ...overrides },
});

describe("calculateJoyIndex", () => {
  it("gives Excellent rating for a clean, highly-rated game", () => {
    const game = makeGame(98);
    const risk = calculateDesignRiskScore(game);
    const joy = calculateJoyIndex(game, risk);
    expect(joy.total).toBeGreaterThanOrEqual(75);
    expect(joy.label).toBe("Excellent");
  });

  it("reduces joy when design risk score is high", () => {
    const cleanGame = makeGame(80);
    const riskyGame = makeGame(80, {
      hasGacha: true,
      hasPayToWin: true,
      hasEnergySystem: true,
      hasDailyLoginBonus: true,
      hasLimitedTimeEvents: true,
    });
    const cleanRisk = calculateDesignRiskScore(cleanGame);
    const highRisk = calculateDesignRiskScore(riskyGame);
    const cleanJoy = calculateJoyIndex(cleanGame, cleanRisk);
    const riskyJoy = calculateJoyIndex(riskyGame, highRisk);
    expect(riskyJoy.total).toBeLessThan(cleanJoy.total);
  });

  it("never goes below 0", () => {
    const game = makeGame(10, {
      hasGacha: true,
      hasPayToWin: true,
      hasLootBoxes: true,
      hasBattlePass: true,
      hasEnergySystem: true,
      hasDailyLoginBonus: true,
      hasLimitedTimeEvents: true,
      hasSocialPressure: true,
    });
    const risk = calculateDesignRiskScore(game);
    const joy = calculateJoyIndex(game, risk);
    expect(joy.total).toBeGreaterThanOrEqual(0);
  });

  it("labels Poor when total is below 25", () => {
    const game = makeGame(15, { hasGacha: true, hasPayToWin: true });
    const risk = calculateDesignRiskScore(game);
    const joy = calculateJoyIndex(game, risk);
    expect(joy.label).toBe("Poor");
  });
});
