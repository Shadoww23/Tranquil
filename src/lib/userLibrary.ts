import type { Game, PreferenceProfile } from "./types";
import { defaultProfile } from "./engines/personalization";

const LIBRARY_KEY = "tranquil-user-library";
const STEAM_KEY_KEY = "tranquil-steam-api-key";
const STEAM_ID_KEY = "tranquil-steam-id";
const PREFERENCES_KEY = "tranquil-preferences";

export interface LibraryMeta {
  steamId: string;
  displayName?: string;
  gameCount: number;
  importedAt: string;
}

export interface StoredLibrary {
  meta: LibraryMeta;
  games: Game[];
}

export function getStoredLibrary(): StoredLibrary | null {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredLibrary;
  } catch {
    return null;
  }
}

export function saveLibrary(library: StoredLibrary): void {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  } catch {}
}

export function clearLibrary(): void {
  try {
    localStorage.removeItem(LIBRARY_KEY);
    localStorage.removeItem(STEAM_KEY_KEY);
    localStorage.removeItem(STEAM_ID_KEY);
  } catch {}
}

export function getSteamCredentials(): { apiKey: string; steamId: string } | null {
  try {
    const apiKey = localStorage.getItem(STEAM_KEY_KEY);
    const steamId = localStorage.getItem(STEAM_ID_KEY);
    if (!apiKey || !steamId) return null;
    return { apiKey, steamId };
  } catch {
    return null;
  }
}

export function saveSteamCredentials(apiKey: string, steamId: string): void {
  try {
    localStorage.setItem(STEAM_KEY_KEY, apiKey);
    localStorage.setItem(STEAM_ID_KEY, steamId);
  } catch {}
}

// --- Personalization preferences ---

export function getPreferences(): PreferenceProfile {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw) as Partial<PreferenceProfile>;
    // Merge onto defaults so a stored profile missing a newer dimension still
    // yields a complete, valid weight set.
    const base = defaultProfile();
    return {
      weights: { ...base.weights, ...(parsed.weights ?? {}) },
      updatedAt: parsed.updatedAt ?? base.updatedAt,
    };
  } catch {
    return defaultProfile();
  }
}

export function savePreferences(profile: PreferenceProfile): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(profile));
  } catch {}
}

export function clearPreferences(): void {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
  } catch {}
}
