"use client";

import { useState, useMemo } from "react";
import type { AnalyzedGame, RecommendationVerdict } from "@/lib/types";
import GameCard from "./GameCard";

type SortKey = "hoursPlayed" | "designRiskScore" | "joyIndex" | "title";
type FilterKey = "all" | "clean" | "flagged";
type PlatformKey = "all" | "Steam" | "Epic" | "GOG";

interface Props {
  games: AnalyzedGame[];
}

const CLEAN_VERDICTS: RecommendationVerdict[] = ["healthy", "mindful"];
const FLAGGED_VERDICTS: RecommendationVerdict[] = ["caution", "red-flag"];

export default function GameLibrary({ games }: Props) {
  const [sort, setSort] = useState<SortKey>("hoursPlayed");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [platform, setPlatform] = useState<PlatformKey>("all");
  const [search, setSearch] = useState("");

  const availablePlatforms = useMemo(() => {
    const found = new Set(games.map((g) => g.platform));
    return (["Steam", "Epic", "GOG"] as const).filter((p) => found.has(p));
  }, [games]);

  const displayed = useMemo(() => {
    let filtered = games;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.genre.some((genre) => genre.toLowerCase().includes(q))
      );
    }

    if (filter === "clean") {
      filtered = filtered.filter((g) => CLEAN_VERDICTS.includes(g.recommendation.verdict));
    } else if (filter === "flagged") {
      filtered = filtered.filter((g) => FLAGGED_VERDICTS.includes(g.recommendation.verdict));
    }

    if (platform !== "all") {
      filtered = filtered.filter((g) => g.platform === platform);
    }

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "hoursPlayed":
          return b.hoursPlayed - a.hoursPlayed;
        case "designRiskScore":
          return b.designRiskScore.total - a.designRiskScore.total;
        case "joyIndex":
          return b.joyIndex.total - a.joyIndex.total;
        case "title":
          return a.title.localeCompare(b.title);
      }
    });
  }, [games, sort, filter, platform, search]);

  const isFiltered = !!search.trim() || filter !== "all" || platform !== "all";

  return (
    <section aria-label="Game library">
      {/* Search */}
      <div className="relative mb-3">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search by title or genre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-700"
          aria-label="Search games"
        />
      </div>

      {/* Controls row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-stone-800 dark:text-stone-100">
            Your Library
          </h2>
          {isFiltered && (
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {displayed.length} of {games.length}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Verdict filter */}
          <div
            className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-0.5 gap-0.5"
            role="group"
            aria-label="Filter by verdict"
          >
            {(["all", "clean", "flagged"] as FilterKey[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  filter === f
                    ? "bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                }`}
              >
                {f === "all" ? "All" : f === "clean" ? "Clean" : "Flagged"}
              </button>
            ))}
          </div>

          {/* Platform filter */}
          {availablePlatforms.length > 1 && (
            <div
              className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-0.5 gap-0.5"
              role="group"
              aria-label="Filter by platform"
            >
              <button
                onClick={() => setPlatform("all")}
                aria-pressed={platform === "all"}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  platform === "all"
                    ? "bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                }`}
              >
                All
              </button>
              {availablePlatforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  aria-pressed={platform === p}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    platform === p
                      ? "bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Sort */}
          <label className="sr-only" htmlFor="library-sort">
            Sort games by
          </label>
          <select
            id="library-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-700"
          >
            <option value="hoursPlayed">Sort: Hours Played</option>
            <option value="designRiskScore">Sort: Design Risk Score</option>
            <option value="joyIndex">Sort: Joy Index</option>
            <option value="title">Sort: Title A–Z</option>
          </select>
        </div>
      </div>

      {displayed.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-stone-400 dark:text-stone-600 text-sm mb-2">
            No games match
            {search.trim() ? ` "${search.trim()}"` : " this filter"}.
          </p>
          <button
            onClick={() => { setSearch(""); setFilter("all"); setPlatform("all"); }}
            className="text-xs text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 underline transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </section>
  );
}
