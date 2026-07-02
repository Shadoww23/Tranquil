import { describe, it, expect } from "vitest";
import { mechanicsForSteamApp } from "../verifiedMechanics";
import type { SteamAppData } from "../steamInference";
import { calculateDesignRiskScore } from "../engines";
import type { Game, GameMechanics } from "../types";

function appData(name: string, extra: Partial<SteamAppData> = {}): SteamAppData {
  return { name, is_free: false, ...extra };
}

function gameWith(mechanics: GameMechanics): Game {
  return {
    id: "steam-test",
    title: "Test",
    platform: "Steam",
    genre: [],
    developer: "Dev",
    publisher: "Pub",
    releaseYear: 2024,
    hoursPlayed: 0,
    lastPlayed: "",
    price: 0,
    coverColor: "",
    mechanics,
    communityScore: 72,
  };
}

describe("mechanicsForSteamApp", () => {
  it("applies verified data when appid + name match", () => {
    const m = mechanicsForSteamApp(730, appData("Counter-Strike 2"));
    expect(m.source).toBe("verified");
    expect(m.hasLootBoxes).toBe(true);
  });

  it("classifies a gacha game's purchases as power (verified)", () => {
    const m = mechanicsForSteamApp(2857200, appData("Wuthering Waves"));
    expect(m.source).toBe("verified");
    expect(m.hasGacha).toBe(true);
    expect(m.monetizationImpact).toBe("power");
  });

  it("falls back to inference when the appid's name does not match (wrong appid guard)", () => {
    const m = mechanicsForSteamApp(730, appData("Some Unrelated Indie Game"));
    expect(m.source).toBe("inferred");
  });

  it("falls back to inference for unknown appids", () => {
    const m = mechanicsForSteamApp(999999999, appData("Obscure Game"));
    expect(m.source).toBe("inferred");
  });
});

describe("scoring with verified data", () => {
  it("scores a gacha game as a real risk, not near-zero", () => {
    const m = mechanicsForSteamApp(2857200, appData("Wuthering Waves"));
    const score = calculateDesignRiskScore(gameWith(m));
    // A gacha game with power-affecting pulls should be well clear of the
    // single-digit scores the inference used to produce.
    expect(score.total).toBeGreaterThan(20);
    expect(score.factors.some((f) => f.dimension === "randomized")).toBe(true);
    expect(score.confidence).toBe("high");
  });

  it("flags a loot-box game's randomised mechanic", () => {
    const m = mechanicsForSteamApp(730, appData("Counter-Strike 2"));
    const score = calculateDesignRiskScore(gameWith(m));
    expect(score.factors.some((f) => f.dimension === "randomized")).toBe(true);
  });
});
