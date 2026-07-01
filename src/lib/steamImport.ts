import type { Game } from "./types";
import { mockGameLibrary } from "./data";
import {
  CURATED_APPIDS,
  appIdToCoverColor,
  emptMechanics,
  inferMechanicsFromSteamData,
  type SteamAppData,
} from "./steamInference";

interface SteamOwnedGame {
  appid: number;
  name: string;
  playtime_forever: number; // minutes
  img_icon_url?: string;
}

// apiKey is optional: when omitted, the server uses the app-owned STEAM_API_KEY
// (Tier 1, "Sign in through Steam"). When present, the user's own key is used.
async function steamFetch(url: string, apiKey?: string) {
  return fetch(url, apiKey ? { headers: { "x-steam-key": apiKey } } : undefined);
}

export async function resolveVanityUrl(
  vanity: string,
  apiKey?: string
): Promise<string | null> {
  const res = await steamFetch(
    `/api/steam/resolve?vanity=${encodeURIComponent(vanity)}`,
    apiKey
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.success === 1 ? (data.steamid as string) : null;
}

// Thrown when Steam returns no library because the profile's game details are
// private. The UI checks `isPrivateProfile` to show a fix-it card instead of a
// generic error.
export class PrivateProfileError extends Error {
  isPrivateProfile = true;
  constructor() {
    super(
      "Your Steam profile's game details are private, so we can't see your library."
    );
    this.name = "PrivateProfileError";
  }
}

export async function importSteamLibrary(
  steamId: string,
  apiKey: string | undefined,
  onProgress: (step: string, current: number, total: number) => void
): Promise<Game[]> {
  onProgress("Fetching your Steam library…", 0, 1);
  const libRes = await steamFetch(`/api/steam/library?steamid=${steamId}`, apiKey);
  if (!libRes.ok) {
    const err = await libRes.json().catch(() => ({ error: "Steam API error" }));
    throw new Error(err.error ?? "Failed to fetch Steam library");
  }
  const libData = await libRes.json();
  const owned: SteamOwnedGame[] = libData.games ?? [];

  if (owned.length === 0) {
    // Distinguish "private profile" (Steam returned nothing) from a public
    // profile that genuinely owns no games.
    if (libData.private) throw new PrivateProfileError();
    throw new Error(
      "No games found on this account. If you expected games here, make sure your Steam profile is set to Public in Steam → Privacy Settings."
    );
  }

  const sorted = [...owned]
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, MAX_IMPORT_GAMES);

  // Analyse games with bounded concurrency. Doing this sequentially means one
  // network round-trip per played game (slow, and enough of them can trip
  // Steam's store rate limit, silently degrading later games to defaults).
  // A small pool keeps it fast while staying well under the rate limit.
  const games: Game[] = new Array(sorted.length);
  let completed = 0;
  let next = 0;

  async function worker() {
    while (true) {
      const i = next++;
      if (i >= sorted.length) return;
      games[i] = await processGame(sorted[i]);
      completed++;
      onProgress("Analyzing games…", completed, sorted.length);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(IMPORT_CONCURRENCY, sorted.length) }, worker)
  );

  return games;
}

/** Maximum games imported, taken by descending playtime. */
export const MAX_IMPORT_GAMES = 150;
const IMPORT_CONCURRENCY = 5;

async function processGame(sg: SteamOwnedGame): Promise<Game> {
  const hoursPlayed = Math.round(sg.playtime_forever / 60);
  const curatedId = CURATED_APPIDS[sg.appid];

  if (curatedId) {
    const curated = mockGameLibrary.find((g) => g.id === curatedId);
    if (curated) return { ...curated, hoursPlayed };
  }

  let mechanics = emptMechanics();
  let communityScore = 72;
  let genres: string[] = [];
  let developer = "Unknown";
  let publisher = "Unknown";

  if (sg.playtime_forever > 0) {
    try {
      const detailRes = await fetch(`/api/steam/appdetails?appid=${sg.appid}`);
      if (detailRes.ok) {
        const detail: SteamAppData = await detailRes.json();
        mechanics = inferMechanicsFromSteamData(detail);
        genres = (detail.genres ?? []).map((g) => g.description).slice(0, 2);
        developer = (detail.developers ?? ["Unknown"])[0];
        publisher = (detail.publishers ?? [developer])[0];
        if (detail.metacritic?.score) {
          communityScore = detail.metacritic.score;
        } else if (detail.is_free) {
          communityScore = 68;
        }
      }
    } catch {
      // proceed with defaults
    }
  }

  return {
    id: `steam-${sg.appid}`,
    title: sg.name,
    platform: "Steam",
    genre: genres.length > 0 ? genres : ["PC Game"],
    developer,
    publisher,
    releaseYear: new Date().getFullYear(),
    hoursPlayed,
    lastPlayed: new Date().toISOString().split("T")[0],
    price: 0,
    coverColor: appIdToCoverColor(sg.appid),
    mechanics,
    communityScore,
    steamAppId: sg.appid,
  };
}
