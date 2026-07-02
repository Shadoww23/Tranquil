import type { GameMechanics } from "./types";
import { inferMechanicsFromSteamData, type SteamAppData } from "./steamInference";

// Hand-verified monetisation facts for high-traffic Steam games.
//
// Why this exists: the inference in steamInference.ts reads the store listing,
// but marketing copy never uses the damning words — a gacha game says "convene"
// not "gacha", a case game says "cases" not "loot box" — so the inference
// under-detects real mechanics and those games score far too low. These entries
// are checked against each game's live storefront so the objective score is
// factual. (This is the OBJECTIVE layer — personalisation stays separate.)
//
// monetizationImpact is a factual classification of what real money buys:
//   cosmetic     — skins/visuals only, no gameplay advantage
//   convenience  — time-savers / grind-skips, no competitive power
//   power        — affects gameplay, progression, or competition
//   none         — no real-money monetisation
//
// source: "verified" makes these show as "Verified" (high confidence) rather
// than "Estimated", unlike inferred games.

interface VerifiedEntry {
  /** Expected store name — a guard so a wrong appid can never attach wrong data. */
  name: string;
  mechanics: GameMechanics;
}

// Build a full GameMechanics from just the true fields (everything else false).
function verified(m: Partial<GameMechanics>): GameMechanics {
  return {
    hasLootBoxes: false,
    hasGacha: false,
    hasBattlePass: false,
    hasSeasonPass: false,
    hasMicrotransactions: false,
    hasAds: false,
    hasEnergySystem: false,
    hasDailyLoginBonus: false,
    hasLimitedTimeEvents: false,
    hasPayToWin: false,
    hasSocialPressure: false,
    dlcCount: 0,
    ...m,
    source: "verified",
  };
}

export const VERIFIED_MECHANICS: Record<number, VerifiedEntry> = {
  // Weapon "cases" are paid-key loot boxes with real-money market value.
  730: {
    name: "Counter-Strike 2",
    mechanics: verified({
      hasLootBoxes: true,
      hasMicrotransactions: true,
      hasLimitedTimeEvents: true,
      monetizationImpact: "cosmetic",
    }),
  },
  // "Treasures" are cosmetic loot boxes; long-running battle pass.
  570: {
    name: "Dota 2",
    mechanics: verified({
      hasLootBoxes: true,
      hasBattlePass: true,
      hasMicrotransactions: true,
      hasLimitedTimeEvents: true,
      hasSocialPressure: true,
      monetizationImpact: "cosmetic",
    }),
  },
  // Crates need paid keys to open; tradeable cosmetic outcomes.
  440: {
    name: "Team Fortress 2",
    mechanics: verified({
      hasLootBoxes: true,
      hasMicrotransactions: true,
      monetizationImpact: "cosmetic",
    }),
  },
  // Apex Packs (randomised), battle pass, event stores.
  1172470: {
    name: "Apex Legends",
    mechanics: verified({
      hasLootBoxes: true,
      hasBattlePass: true,
      hasMicrotransactions: true,
      hasDailyLoginBonus: true,
      hasLimitedTimeEvents: true,
      hasSocialPressure: true,
      monetizationImpact: "cosmetic",
    }),
  },
  // Crates + keys, battle pass; cosmetic.
  578080: {
    name: "PUBG: BATTLEGROUNDS",
    mechanics: verified({
      hasLootBoxes: true,
      hasBattlePass: true,
      hasMicrotransactions: true,
      monetizationImpact: "cosmetic",
    }),
  },
  // Seasonal model; paid expansions gate content; Eververse cosmetics.
  1085660: {
    name: "Destiny 2",
    mechanics: verified({
      hasSeasonPass: true,
      hasMicrotransactions: true,
      hasLimitedTimeEvents: true,
      dlcCount: 6,
      monetizationImpact: "convenience",
    }),
  },
  // Platinum buys gear/warframes you can also grind for — time-savers.
  230410: {
    name: "Warframe",
    mechanics: verified({
      hasMicrotransactions: true,
      hasDailyLoginBonus: true,
      monetizationImpact: "convenience",
    }),
  },
  // Cosmetic mystery boxes; stash tabs are near-essential QoL you buy.
  238960: {
    name: "Path of Exile",
    mechanics: verified({
      hasLootBoxes: true,
      hasMicrotransactions: true,
      monetizationImpact: "convenience",
    }),
  },
  // Buy characters (with unique perks) to skip the grind; heavy cosmetic store.
  381210: {
    name: "Dead by Daylight",
    mechanics: verified({
      hasMicrotransactions: true,
      hasLimitedTimeEvents: true,
      dlcCount: 20,
      monetizationImpact: "convenience",
    }),
  },
  // Single-player; paid expansion only, no live monetisation.
  1091500: {
    name: "Cyberpunk 2077",
    mechanics: verified({
      dlcCount: 2,
      monetizationImpact: "none",
    }),
  },
  // Gacha: paid randomised "convenes" for characters/weapons that affect power;
  // stamina ("Waveplate") gate. (Applied only if the store name matches.)
  2857200: {
    name: "Wuthering Waves",
    mechanics: verified({
      hasGacha: true,
      hasMicrotransactions: true,
      hasEnergySystem: true,
      hasDailyLoginBonus: true,
      hasLimitedTimeEvents: true,
      monetizationImpact: "power",
    }),
  },
  // Battle pass + cosmetic store; hero shooter. (Applied only if name matches.)
  2767030: {
    name: "Marvel Rivals",
    mechanics: verified({
      hasBattlePass: true,
      hasMicrotransactions: true,
      hasLimitedTimeEvents: true,
      monetizationImpact: "cosmetic",
    }),
  },
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Factual mechanics for a Steam app: hand-verified data when we have it (and the
 * store name confirms the appid), otherwise a conservative inference from the
 * store listing. The name-guard means a mistyped appid degrades to inference
 * rather than mislabelling a game.
 */
export function mechanicsForSteamApp(appid: number, appData: SteamAppData): GameMechanics {
  const entry = VERIFIED_MECHANICS[appid];
  if (entry && appData?.name) {
    const actual = normalize(appData.name);
    const expected = normalize(entry.name);
    if (actual && expected && (actual.includes(expected) || expected.includes(actual))) {
      return entry.mechanics;
    }
  }
  return inferMechanicsFromSteamData(appData);
}
