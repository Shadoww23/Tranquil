"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { mockGameLibrary } from "@/lib/data";
import {
  calculateDesignRiskScore,
  calculateJoyIndex,
  detectHabitPatterns,
  generateRecommendation,
  defaultProfile,
} from "@/lib/engines";
import { recommendGames } from "@/lib/recommend";
import { getPreferences, PREFERENCES_CHANGED_EVENT } from "@/lib/userLibrary";
import { riskColor, joyColor } from "@/lib/colorUtils";
import GameCover from "./GameCover";
import type { AnalyzedGame, Game, PreferenceProfile } from "@/lib/types";

function analyze(game: Game): AnalyzedGame {
  const designRiskScore = calculateDesignRiskScore(game);
  const joyIndex = calculateJoyIndex(game, designRiskScore);
  const detectedPatterns = detectHabitPatterns(game);
  const recommendation = generateRecommendation(designRiskScore, joyIndex);
  return { ...game, designRiskScore, joyIndex, detectedPatterns, recommendation };
}

interface Props {
  library: AnalyzedGame[];
  hasRealLibrary: boolean;
}

// Surfaces good games the user hasn't played, ranked by personal fit. We only
// ever recommend healthy/mindful games — never push a caution/red-flag title.
export default function RecommendedGames({ library, hasRealLibrary }: Props) {
  const [profile, setProfile] = useState<PreferenceProfile>(() => defaultProfile());

  useEffect(() => {
    const reload = () => setProfile(getPreferences());
    reload();
    document.addEventListener(PREFERENCES_CHANGED_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      document.removeEventListener(PREFERENCES_CHANGED_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const catalog = useMemo(() => mockGameLibrary.map(analyze), []);

  const recs = useMemo(
    () => recommendGames(library, catalog, profile, hasRealLibrary),
    [library, catalog, hasRealLibrary, profile]
  );

  if (recs.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l1.5 4L11 8.5 6.5 10 5 14l-1.5-4L-1 8.5 3.5 7 5 3z" transform="translate(4 2)" />
          </svg>
        </div>
        <h2 className="font-semibold text-stone-800 dark:text-stone-100 text-sm">Recommended for you</h2>
        <span className="text-xs text-stone-400 dark:text-stone-500">
          &middot;{" "}
          {hasRealLibrary
            ? "Games you haven't played, matched to your preferences"
            : "Clean, well-loved games to explore"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {recs.map(({ game, reason, personal }) => {
          const href =
            game.id.startsWith("steam-") && game.steamAppId
              ? `/steam/${game.steamAppId}`
              : `/game/${game.id}`;
          return (
            <Link
              key={game.id}
              href={href}
              className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm overflow-hidden flex flex-col hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-md transition-all"
            >
              <GameCover game={game} className="w-full h-24 border-b border-stone-100 dark:border-stone-700" />
              <div className="p-4 flex flex-col gap-2.5 flex-1">
                <div className="min-w-0">
                  <h3 className="font-semibold text-stone-800 dark:text-stone-100 truncate leading-tight text-sm">{game.title}</h3>
                  <p className="text-xs text-stone-400 dark:text-stone-500 truncate">{game.genre.join(" · ")}</p>
                </div>

                <span className="self-start text-[11px] font-medium px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                  {reason}
                </span>

                <div className="mt-auto flex items-center justify-between text-xs pt-1">
                  <span className={`font-semibold ${riskColor(game.designRiskScore.total)}`}>
                    Risk {game.designRiskScore.total}
                  </span>
                  <span className={`font-semibold ${joyColor(game.joyIndex.total)}`}>
                    Joy {game.joyIndex.total}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500">
                  For you: <span className="font-medium text-violet-500 dark:text-violet-400">{personal.label} concern</span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
