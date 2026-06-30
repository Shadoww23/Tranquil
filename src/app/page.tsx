import { mockGameLibrary } from "@/lib/data";
import {
  calculateDesignRiskScore,
  calculateJoyIndex,
  detectHabitPatterns,
  generateRecommendation,
} from "@/lib/engines";
import type { AnalyzedGame } from "@/lib/types";
import Link from "next/link";
import Header from "@/components/Header";
import PlayerHealthSummary from "@/components/PlayerHealthSummary";
import GameLibrary from "@/components/GameLibrary";
import StatCard from "@/components/StatCard";
import WhatYouDidntMiss from "@/components/WhatYouDidntMiss";

function analyzeLibrary(): AnalyzedGame[] {
  return mockGameLibrary.map((game) => {
    const designRiskScore = calculateDesignRiskScore(game);
    const joyIndex = calculateJoyIndex(game, designRiskScore);
    const detectedPatterns = detectHabitPatterns(game);
    const recommendation = generateRecommendation(designRiskScore, joyIndex);
    return { ...game, designRiskScore, joyIndex, detectedPatterns, recommendation };
  });
}

export default function Home() {
  const games = analyzeLibrary();

  const avgRisk = Math.round(
    games.reduce((s, g) => s + g.designRiskScore.total, 0) / games.length
  );
  const avgJoy = Math.round(
    games.reduce((s, g) => s + g.joyIndex.total, 0) / games.length
  );
  const redFlagCount = games.filter((g) => g.recommendation.verdict === "red-flag").length;
  const cleanCount = games.filter((g) => g.recommendation.verdict === "healthy").length;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <PlayerHealthSummary games={games} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Avg Design Risk Score"
            value={`${avgRisk}/100`}
            sub="Lower is better"
            accent="bg-rose-50 dark:bg-rose-950/40"
            icon={
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            }
          />
          <StatCard
            label="Avg Joy Index"
            value={`${avgJoy}/100`}
            sub="Genuine enjoyment"
            accent="bg-violet-50 dark:bg-violet-950/40"
            icon={
              <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Red Flags"
            value={redFlagCount}
            sub={`of ${games.length} games`}
            accent="bg-amber-50 dark:bg-amber-950/40"
            icon={
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7l9-4 9 4v14" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
              </svg>
            }
          />
          <StatCard
            label="Clean Games"
            value={cleanCount}
            sub="Healthy picks"
            accent="bg-emerald-50 dark:bg-emerald-950/40"
            icon={
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
        </div>

        {/* Score methodology explainer */}
        <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
            How scores work
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">Design Risk Score</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                0–100. A weighted count of concern patterns: gacha, pay-to-win, and loot boxes carry the most weight.
                Lower is better.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mb-1">Joy Index</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                0–100. Community satisfaction (80%) minus a design risk penalty. A beloved game with aggressive
                monetisation still scores lower than a clean one. Higher is better.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1">Verdict</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Healthy · Mindful · Caution · Red Flag — derived from both scores together.{" "}
                <Link href="/patterns" className="text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 underline transition-colors">
                  Learn about each pattern →
                </Link>
              </p>
            </div>
          </div>
        </div>

        <WhatYouDidntMiss />

        <GameLibrary games={games} />
      </main>

      <footer className="text-center text-xs text-stone-300 dark:text-stone-700 pb-8 pt-4">
        Anti-FOMO &middot; Evidence-based gaming insights &middot; Open source
      </footer>
    </div>
  );
}
