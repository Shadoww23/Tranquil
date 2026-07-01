import { describe, it, expect } from "vitest";
import { calculateDesignRiskScore } from "../predatoryScore";
import {
  personalizedConcern,
  nudgeProfile,
  defaultProfile,
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
