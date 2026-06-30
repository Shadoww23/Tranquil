import { describe, it, expect } from "vitest";
import { calculateJoyIndex } from "../joyIndex";
import { calculatePredatoryScore } from "../predatoryScore";
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
    const predatory = calculatePredatoryScore(game);
    const joy = calculateJoyIndex(game, predatory);
    expect(joy.total).toBeGreaterThanOrEqual(75);
    expect(joy.label).toBe("Excellent");
  });

  it("reduces joy when predatory score is high", () => {
    const cleanGame = makeGame(80);
    const predatoryGame = makeGame(80, {
      hasGacha: true,
      hasPayToWin: true,
      hasEnergySystem: true,
      hasDailyLoginBonus: true,
      hasLimitedTimeEvents: true,
    });
    const cleanPredatory = calculatePredatoryScore(cleanGame);
    const dirtyPredatory = calculatePredatoryScore(predatoryGame);
    const cleanJoy = calculateJoyIndex(cleanGame, cleanPredatory);
    const dirtyJoy = calculateJoyIndex(predatoryGame, dirtyPredatory);
    expect(dirtyJoy.total).toBeLessThan(cleanJoy.total);
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
    const predatory = calculatePredatoryScore(game);
    const joy = calculateJoyIndex(game, predatory);
    expect(joy.total).toBeGreaterThanOrEqual(0);
  });

  it("labels Poor when total is below 25", () => {
    const game = makeGame(15, { hasGacha: true, hasPayToWin: true });
    const predatory = calculatePredatoryScore(game);
    const joy = calculateJoyIndex(game, predatory);
    expect(joy.label).toBe("Poor");
  });
});
