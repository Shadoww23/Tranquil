"use client";

import { useState, useMemo } from "react";
import type { AnalyzedGame, RecommendationVerdict } from "@/lib/types";
import GameCard from "./GameCard";

type SortKey = "hoursPlayed" | "predatoryScore" | "joyIndex" | "title";
type FilterKey = "all" | "clean" | "flagged";

interface Props {
  games: AnalyzedGame[];
}

const CLEAN_VERDICTS: RecommendationVerdict[] = ["healthy", "mindful"];
const FLAGGED_VERDICTS: RecommendationVerdict[] = ["caution", "red-flag"];

export default function GameLibrary({ games }: Props) {
  const [sort, setSort] = useState<SortKey>("hoursPlayed");
  const [filter, setFilter] = useState<FilterKey>("all");

  const displayed = useMemo(() => {
    const filtered =
      filter === "clean"
        ? games.filter((g) => CLEAN_VERDICTS.includes(g.recommendation.verdict))
        : filter === "flagged"
          ? games.filter((g) => FLAGGED_VERDICTS.includes(g.recommendation.verdict))
          : games;

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "hoursPlayed":
          return b.hoursPlayed - a.hoursPlayed;
        case "predatoryScore":
          return b.predatoryScore.total - a.predatoryScore.total;
        case "joyIndex":
          return b.joyIndex.total - a.joyIndex.total;
        case "title":
          return a.title.localeCompare(b.title);
      }
    });
  }, [games, sort, filter]);

  return (
    <section aria-label="Game library">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h2 className="font-semibold text-stone-800 dark:text-stone-100">Your Library</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-0.5 gap-0.5"
            role="group"
            aria-label="Filter games"
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
            <option value="predatoryScore">Sort: Predatory Score</option>
            <option value="joyIndex">Sort: Joy Index</option>
            <option value="title">Sort: Title A&#x2013;Z</option>
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
        <p className="text-center py-12 text-stone-400 dark:text-stone-600 text-sm">
          No games match this filter.
        </p>
      )}
    </section>
  );
}
