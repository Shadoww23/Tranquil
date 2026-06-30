import { describe, it, expect } from "vitest";
import { detectHabitPatterns } from "../habitLoop";
import type { Game } from "../../types";

const baseGame: Game = {
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

describe("detectHabitPatterns", () => {
  it("returns empty array for a clean game", () => {
    const result = detectHabitPatterns(baseGame);
    expect(result).toHaveLength(0);
  });

  it("detects daily login hook", () => {
    const game: Game = {
      ...baseGame,
      mechanics: { ...baseGame.mechanics, hasDailyLoginBonus: true },
    };
    const result = detectHabitPatterns(game);
    const patterns = result.map((p) => p.pattern);
    expect(patterns).toContain("Daily Login Hook");
  });

  it("detects energy system with high severity", () => {
    const game: Game = {
      ...baseGame,
      mechanics: { ...baseGame.mechanics, hasEnergySystem: true },
    };
    const result = detectHabitPatterns(game);
    const energy = result.find((p) => p.pattern === "Energy System");
    expect(energy).toBeDefined();
    expect(energy?.severity).toBe("high");
  });

  it("detects loot boxes separately from gacha loop", () => {
    const lootGame: Game = {
      ...baseGame,
      mechanics: { ...baseGame.mechanics, hasLootBoxes: true },
    };
    const gachaGame: Game = {
      ...baseGame,
      mechanics: { ...baseGame.mechanics, hasGacha: true },
    };
    const lootPatterns = detectHabitPatterns(lootGame).map((p) => p.pattern);
    const gachaPatterns = detectHabitPatterns(gachaGame).map((p) => p.pattern);
    expect(lootPatterns).toContain("Loot Boxes");
    expect(lootPatterns).not.toContain("Gacha Loop");
    expect(gachaPatterns).toContain("Gacha Loop");
    expect(gachaPatterns).not.toContain("Loot Boxes");
  });

  it("escalates FOMO severity when microtransactions are present", () => {
    const highFomo: Game = {
      ...baseGame,
      mechanics: {
        ...baseGame.mechanics,
        hasLimitedTimeEvents: true,
        hasMicrotransactions: true,
      },
    };
    const lowFomo: Game = {
      ...baseGame,
      mechanics: { ...baseGame.mechanics, hasLimitedTimeEvents: true },
    };
    const highResult = detectHabitPatterns(highFomo).find((p) => p.pattern === "FOMO Pressure");
    const lowResult = detectHabitPatterns(lowFomo).find((p) => p.pattern === "FOMO Pressure");
    expect(highResult?.severity).toBe("high");
    expect(lowResult?.severity).toBe("low");
  });

  it("detects pay-to-progress when pay-to-win is enabled", () => {
    const game: Game = {
      ...baseGame,
      mechanics: { ...baseGame.mechanics, hasPayToWin: true },
    };
    const result = detectHabitPatterns(game);
    const patterns = result.map((p) => p.pattern);
    expect(patterns).toContain("Pay-to-Progress");
  });
});
