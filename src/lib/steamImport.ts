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

async function steamFetch(url: string, apiKey: string) {
  return fetch(url, { headers: { "x-steam-key": apiKey } });
}

export async function resolveVanityUrl(
  vanity: string,
  apiKey: string
): Promise<string | null> {
  const res = await steamFetch(
    `/api/steam/resolve?vanity=${encodeURIComponent(vanity)}`,
    apiKey
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.success === 1 ? (data.steamid as string) : null;
}

export async function importSteamLibrary(
  steamId: string,
  apiKey: string,
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
    throw new Error(
      "No games found. Make sure your Steam profile visibility is set to Public in Steam → Privacy Settings."
    );
  }

  const sorted = [...owned]
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, 150);

  const games: Game[] = [];
  let analyzed = 0;

  for (const sg of sorted) {
    analyzed++;
    onProgress("Analyzing games…", analyzed, sorted.length);

    const hoursPlayed = Math.round(sg.playtime_forever / 60);
    const curatedId = CURATED_APPIDS[sg.appid];

    if (curatedId) {
      const curated = mockGameLibrary.find((g) => g.id === curatedId);
      if (curated) {
        games.push({ ...curated, hoursPlayed });
        continue;
      }
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

    games.push({
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
    });
  }

  return games;
}
