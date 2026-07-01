import type { AnalyzedGame, PreferenceProfile } from "./types";
import { personalizedConcern, type PersonalConcern } from "./engines/personalization";

export interface GameRecommendation {
  game: AnalyzedGame;
  reason: string;
  personal: PersonalConcern;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Recommend good games the user hasn't played, ranked by personal fit.
 *
 * - With a real library: prefer their unplayed backlog, then curated titles they
 *   don't own ("discover").
 * - Demo / fully-played library: fall back to their least-played games so the
 *   section is still useful.
 *
 * Only healthy/mindful games are ever recommended — we never push a
 * caution/red-flag title. Ranked by lowest personal concern, then highest joy.
 */
export function recommendGames(
  library: AnalyzedGame[],
  catalog: AnalyzedGame[],
  profile: PreferenceProfile,
  hasRealLibrary: boolean,
  limit = 6
): GameRecommendation[] {
  const ownedIds = new Set(library.map((g) => g.id));
  const ownedTitles = new Set(library.map((g) => norm(g.title)));

  type Candidate = { game: AnalyzedGame; reason: string };
  let pool: Candidate[] = [];

  if (hasRealLibrary) {
    const backlog: Candidate[] = library
      .filter((g) => g.hoursPlayed === 0)
      .map((g) => ({ game: g, reason: "In your backlog" }));
    const discover: Candidate[] = catalog
      .filter((c) => !ownedIds.has(c.id) && !ownedTitles.has(norm(c.title)))
      .map((c) => ({ game: c, reason: "Worth discovering" }));
    pool = [...backlog, ...discover];
  }

  if (pool.length === 0) {
    pool = [...library]
      .sort((a, b) => a.hoursPlayed - b.hoursPlayed)
      .map((g) => ({ game: g, reason: hasRealLibrary ? "Barely touched" : "Top pick" }));
  }

  const seen = new Set<string>();
  return pool
    .filter((c) => {
      if (seen.has(c.game.id)) return false;
      seen.add(c.game.id);
      const v = c.game.recommendation.verdict;
      return v === "healthy" || v === "mindful";
    })
    .map((c) => ({ ...c, personal: personalizedConcern(c.game.designRiskScore, profile) }))
    .sort((a, b) =>
      a.personal.score !== b.personal.score
        ? a.personal.score - b.personal.score
        : b.game.joyIndex.total - a.game.joyIndex.total
    )
    .slice(0, limit);
}
