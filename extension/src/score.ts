// Shared data + scoring layer for the extension.
//
// Both the store-page card and the browse-page badges go through here, so we
// fetch each game once, score it with the *exact* web-app engine, and reuse the
// result. We cache the raw Steam `appdetails` (not the score): that way an
// improvement to the scoring engine takes effect immediately for every cached
// game, with no network round-trip and no stale numbers.

import type { SteamAppData } from "../../src/lib/steamInference";
import { mechanicsForSteamApp } from "../../src/lib/verifiedMechanics";
import {
  calculateDesignRiskScore,
  calculateJoyIndex,
  generateRecommendation,
} from "../../src/lib/engines";
import type { DesignRiskScore, Game, JoyIndex, Recommendation } from "../../src/lib/types";

export interface Scored {
  appid: string;
  game: Game;
  risk: DesignRiskScore;
  joy: JoyIndex;
  rec: Recommendation;
}

// Bump when the cached shape changes so old entries are ignored.
const CACHE_VERSION = 1;
const CACHE_PREFIX = `tranquil-app-v${CACHE_VERSION}-`;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // store data is near-static; 7 days is plenty.

// ---- Throttled fetch queue -------------------------------------------------
// Browse pages can ask for dozens of games at once. We serialise the network
// fetches with a small gap so we never burst Steam into rate-limiting us.
const MIN_GAP_MS = 250;
let tail: Promise<unknown> = Promise.resolve();

function throttle<T>(job: () => Promise<T>): Promise<T> {
  const result = tail.then(job, job);
  // The next job waits for this one to finish *and* for the gap to elapse.
  tail = result.then(
    () => new Promise((r) => setTimeout(r, MIN_GAP_MS)),
    () => new Promise((r) => setTimeout(r, MIN_GAP_MS))
  );
  return result;
}

// ---- Persistent cache (chrome.storage.local) -------------------------------
async function readCache(appid: string): Promise<SteamAppData | null> {
  try {
    const key = CACHE_PREFIX + appid;
    const got = await chrome.storage.local.get(key);
    const hit = got[key] as { ts: number; data: SteamAppData } | undefined;
    if (hit && Date.now() - hit.ts < TTL_MS) return hit.data;
  } catch {
    // storage unavailable — fall through to a live fetch.
  }
  return null;
}

async function writeCache(appid: string, data: SteamAppData): Promise<void> {
  try {
    await chrome.storage.local.set({ [CACHE_PREFIX + appid]: { ts: Date.now(), data } });
  } catch {
    // best-effort; a failed write just means we fetch again next time.
  }
}

async function fetchAppData(appid: string): Promise<SteamAppData | null> {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&l=en`,
      { credentials: "omit" }
    );
    const json = await res.json();
    const entry = json?.[appid];
    if (!entry?.success) return null;
    return entry.data as SteamAppData;
  } catch {
    return null;
  }
}

// In-flight de-dupe: multiple tiles / the card asking for the same appid at the
// same time share one promise instead of racing.
const inflight = new Map<string, Promise<SteamAppData | null>>();

async function getAppData(appid: string): Promise<SteamAppData | null> {
  const cached = await readCache(appid);
  if (cached) return cached;

  const existing = inflight.get(appid);
  if (existing) return existing;

  const p = throttle(() => fetchAppData(appid)).then(async (data) => {
    if (data) await writeCache(appid, data);
    inflight.delete(appid);
    return data;
  });
  inflight.set(appid, p);
  return p;
}

function toGame(appid: string, data: SteamAppData): Game {
  const mechanics = mechanicsForSteamApp(Number(appid), data);
  const communityScore = data.metacritic?.score ?? (data.is_free ? 68 : 72);
  return {
    id: `steam-${appid}`,
    title: data.name,
    platform: "Steam",
    genre: (data.genres ?? []).map((g) => g.description),
    developer: (data.developers ?? ["Unknown"])[0],
    publisher: (data.publishers ?? ["Unknown"])[0],
    releaseYear: new Date().getFullYear(),
    hoursPlayed: 0,
    lastPlayed: "",
    price: 0,
    coverColor: "",
    mechanics,
    communityScore,
    steamAppId: Number(appid),
  };
}

/** Fetch (cached) + score a single Steam app. Returns null if data is missing. */
export async function scoreApp(appid: string): Promise<Scored | null> {
  const data = await getAppData(appid);
  if (!data) return null;
  const game = toGame(appid, data);
  const risk = calculateDesignRiskScore(game);
  const joy = calculateJoyIndex(game, risk);
  const rec = generateRecommendation(risk, joy);
  return { appid, game, risk, joy, rec };
}
