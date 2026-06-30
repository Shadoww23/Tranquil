"use client";

import { useState, useEffect, useCallback } from "react";
import { mockGameLibrary } from "@/lib/data";
import { calculateDesignRiskScore, calculateJoyIndex, detectHabitPatterns, generateRecommendation } from "@/lib/engines";
import type { AnalyzedGame, Game } from "@/lib/types";
import Link from "next/link";
import Header from "@/components/Header";
import PlayerHealthSummary from "@/components/PlayerHealthSummary";
import GameLibrary from "@/components/GameLibrary";
import StatCard from "@/components/StatCard";
import WhatYouDidntMiss from "@/components/WhatYouDidntMiss";
import CalmScoreRing from "@/components/CalmScoreRing";
import ScreenTimeChart from "@/components/ScreenTimeChart";
import AppUsageList from "@/components/AppUsageList";
import { getStoredLibrary, clearLibrary, type LibraryMeta } from "@/lib/userLibrary";

function analyzeGames(games: Game[]): AnalyzedGame[] {
  return games.map((game) => {
    const designRiskScore = calculateDesignRiskScore(game);
    const joyIndex = calculateJoyIndex(game, designRiskScore);
    const detectedPatterns = detectHabitPatterns(game);
    const recommendation = generateRecommendation(designRiskScore, joyIndex);
    return { ...game, designRiskScore, joyIndex, detectedPatterns, recommendation };
  });
}

export default function Home() {
  const [games, setGames] = useState<AnalyzedGame[]>([]);
  const [steamMeta, setSteamMeta] = useState<LibraryMeta | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadLibrary = useCallback(() => {
    const stored = getStoredLibrary();
    if (stored) {
      setGames(analyzeGames(stored.games));
      setSteamMeta(stored.meta);
    } else {
      setGames(analyzeGames(mockGameLibrary));
      setSteamMeta(null);
    }
  }, []);

  useEffect(() => { loadLibrary(); setMounted(true); }, [loadLibrary]);

  const handleDisconnect = () => { clearLibrary(); loadLibrary(); };

  const avgRisk = games.length ? Math.round(games.reduce((s, g) => s + g.designRiskScore.total, 0) / games.length) : 0;
  const avgJoy = games.length ? Math.round(games.reduce((s, g) => s + g.joyIndex.total, 0) / games.length) : 0;
  const redFlagCount = games.filter((g) => g.recommendation.verdict === "red-flag").length;
  const cleanCount = games.filter((g) => g.recommendation.verdict === "healthy").length;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
        <Header onSteamImported={loadLibrary} />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="h-32 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Header onSteamImported={loadLibrary} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {steamMeta ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded bg-sky-500 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <span className="font-medium text-sky-800 dark:text-sky-200">Steam connected</span>
              <span className="text-sky-600 dark:text-sky-400">· {steamMeta.gameCount} games · imported {new Date(steamMeta.importedAt).toLocaleDateString()}</span>
            </div>
            <button onClick={handleDisconnect} className="text-xs text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 transition-colors shrink-0">Disconnect</button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 px-4 py-3">
            <p className="text-sm text-stone-500 dark:text-stone-400"><span className="font-medium text-stone-700 dark:text-stone-300">Demo mode</span> — showing 20 example games.</p>
            <Link href="#" onClick={(e) => { e.preventDefault(); document.dispatchEvent(new CustomEvent("open-steam-connect")); }} className="text-xs font-semibold text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 transition-colors shrink-0">Connect Steam →</Link>
          </div>
        )}

        <PlayerHealthSummary games={games} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Avg Design Risk Score" value={`${avgRisk}/100`} sub="Lower is better" accent="bg-rose-50 dark:bg-rose-950/40"
            icon={<svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>} />
          <StatCard label="Avg Joy Index" value={`${avgJoy}/100`} sub="Genuine enjoyment" accent="bg-violet-50 dark:bg-violet-950/40"
            icon={<svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard label="Red Flags" value={redFlagCount} sub={`of ${games.length} games`} accent="bg-amber-50 dark:bg-amber-950/40"
            icon={<svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7l9-4 9 4v14" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" /></svg>} />
          <StatCard label="Clean Games" value={cleanCount} sub="Healthy picks" accent="bg-emerald-50 dark:bg-emerald-950/40"
            icon={<svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <CalmScoreRing games={games} />
          <ScreenTimeChart games={games} />
        </div>

        <div>
          <h2 className="font-semibold text-stone-800 dark:text-stone-100 text-sm mb-3">Hours Breakdown</h2>
          <AppUsageList games={games} />
        </div>

        <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">How scores work</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">Design Risk Score</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">0–100. A weighted count of concern patterns: gacha, pay-to-win, and loot boxes carry the most weight. Lower is better.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mb-1">Joy Index</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">0–100. Community satisfaction (80%) minus a design risk penalty. Higher is better.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1">Verdict</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">Healthy · Mindful · Caution · Red Flag — derived from both scores together.{" "}
                <Link href="/patterns" className="text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 underline transition-colors">Learn about each pattern →</Link>
              </p>
            </div>
          </div>
        </div>

        <WhatYouDidntMiss />
        <GameLibrary games={games} />
      </main>

      <footer className="text-center text-xs text-stone-300 dark:text-stone-700 pb-8 pt-4">
        Anti-FOMO · Evidence-based gaming insights · Open source
      </footer>
    </div>
  );
}
