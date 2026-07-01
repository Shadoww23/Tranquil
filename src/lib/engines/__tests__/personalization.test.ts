import { describe, it, expect } from "vitest";
import { calculateDesignRiskScore } from "../predatoryScore";
import {
  personalizedConcern,
  nudgeProfile,
  defaultProfile,
  deriveProfileFromLibrary,
} from "../personalization";
import type { Game, PreferenceProfile } from "../../types";

const baseGame: Game = {
  id: "t",
  title: "T",
  platform: "Steam",
  genre: ["Action"],
  developer: "D",
  publisher: "P",
  releaseYear: 2023,
  hoursPlayed: 10,
  lastPlayed: "2025-01-01",
  price: 0,
  coverColor: "bg-stone-400",
  communityScore: 75,
  mechanics: {
    hasLootBoxes: false,
    hasBattlePass: true,
    hasSeasonPass: false,
    hasMicrotransactions: true,
    dlcCount: 0,
    hasEnergySystem: false,
    hasDailyLoginBonus: false,
    hasLimitedTimeEvents: true,
    hasPayToWin: false,
    hasGacha: false,
    hasSocialPressure: false,
    hasAds: false,
    monetizationImpact: "cosmetic",
  },
};

const cosmeticScore = calculateDesignRiskScore(baseGame);

describe("personalizedConcern", () => {
  it("equals the objective score for a neutral profile", () => {
    const result = personalizedConcern(cosmeticScore, defaultProfile());
    expect(result.score).toBe(cosmeticScore.total);
    expect(result.delta).toBe(0);
  });

  it("lowers concern when the user doesn't mind the concerns present", () => {
    const relaxed: PreferenceProfile = {
      weights: { payForPower: 1, randomized: 1, cosmeticSpend: 0.4, fomo: 0.4, timeGate: 1 },
      updatedAt: "",
    };
    const result = personalizedConcern(cosmeticScore, relaxed);
    expect(result.score).toBeLessThan(cosmeticScore.total);
    expect(result.delta).toBeLessThan(0);
  });

  it("raises concern when the user is sensitive to the concerns present", () => {
    const sensitive: PreferenceProfile = {
      weights: { payForPower: 1, randomized: 1, cosmeticSpend: 1.7, fomo: 1.7, timeGate: 1 },
      updatedAt: "",
    };
    const result = personalizedConcern(cosmeticScore, sensitive);
    expect(result.score).toBeGreaterThan(cosmeticScore.total);
  });

  it("surfaces the dimensions driving a user's concern", () => {
    const result = personalizedConcern(cosmeticScore, defaultProfile());
    expect(result.topDimensions.length).toBeGreaterThan(0);
    expect(result.topDimensions).toContain("cosmeticSpend");
  });
});

describe("deriveProfileFromLibrary", () => {
  const cosmeticGame = (hours: number): Game => ({
    ...baseGame,
    hoursPlayed: hours,
    mechanics: { ...baseGame.mechanics, monetizationImpact: "cosmetic" },
  });
  const cleanGame = (hours: number): Game => ({
    ...baseGame,
    hoursPlayed: hours,
    mechanics: {
      ...baseGame.mechanics,
      hasBattlePass: false,
      hasMicrotransactions: false,
      hasLimitedTimeEvents: false,
      monetizationImpact: "none",
    },
  });

  const scored = (g: Game) => ({ hoursPlayed: g.hoursPlayed, score: calculateDesignRiskScore(g) });

  it("lowers sensitivity for concerns the player sinks hours into (revealed tolerance)", () => {
    const profile = deriveProfileFromLibrary([scored(cosmeticGame(200))]);
    expect(profile.weights.cosmeticSpend).toBeLessThan(1);
    expect(profile.weights.fomo).toBeLessThan(1);
    expect(profile.source).toBe("derived");
  });

  it("never raises a weight above neutral, and leaves unexposed concerns neutral", () => {
    const profile = deriveProfileFromLibrary([scored(cosmeticGame(200))]);
    for (const w of Object.values(profile.weights)) expect(w).toBeLessThanOrEqual(1);
    // No pay-to-win game played → payForPower stays neutral.
    expect(profile.weights.payForPower).toBe(1);
  });

  it("returns a neutral derived profile when there are no hours to learn from", () => {
    const profile = deriveProfileFromLibrary([scored(cleanGame(0)), scored(cosmeticGame(0))]);
    for (const w of Object.values(profile.weights)) expect(w).toBe(1);
  });
});

describe("nudgeProfile", () => {
  it("raises sensitivity for present dimensions on 'bothers'", () => {
    const before = defaultProfile();
    const after = nudgeProfile(before, cosmeticScore, "bothers");
    expect(after.weights.cosmeticSpend).toBeGreaterThan(before.weights.cosmeticSpend);
    expect(after.weights.fomo).toBeGreaterThan(before.weights.fomo);
    // Dimensions not in this game are untouched.
    expect(after.weights.timeGate).toBe(before.weights.timeGate);
  });

  it("lowers sensitivity for present dimensions on 'fine'", () => {
    const before = defaultProfile();
    const after = nudgeProfile(before, cosmeticScore, "fine");
    expect(after.weights.cosmeticSpend).toBeLessThan(before.weights.cosmeticSpend);
  });

  it("clamps weights within bounds under repeated nudges", () => {
    let profile = defaultProfile();
    for (let i = 0; i < 50; i++) profile = nudgeProfile(profile, cosmeticScore, "bothers");
    expect(profile.weights.cosmeticSpend).toBeLessThanOrEqual(2);
    for (let i = 0; i < 100; i++) profile = nudgeProfile(profile, cosmeticScore, "fine");
    expect(profile.weights.cosmeticSpend).toBeGreaterThanOrEqual(0.3);
  });
});
