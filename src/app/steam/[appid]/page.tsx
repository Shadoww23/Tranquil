"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { getStoredLibrary } from "@/lib/userLibrary";
import { calculateDesignRiskScore, calculateJoyIndex, detectHabitPatterns, generateRecommendation } from "@/lib/engines";
import { joyColor, riskColor } from "@/lib/colorUtils";
import PatternBadge from "@/components/PatternBadge";
import RiskBreakdownBar from "@/components/RiskBreakdownBar";
import { ConfidenceBadge, RiskFactorList } from "@/components/RiskFactors";
import ForYouConcern from "@/components/ForYouConcern";
import Header from "@/components/Header";
import type { Game } from "@/lib/types";

const verdictStyles = {
  healthy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  mindful: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  caution: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  "red-flag": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
} as const;

const verdictLabel = { healthy: "Healthy", mindful: "Mindful", caution: "Caution", "red-flag": "Red Flag" } as const;

export default function SteamGamePage({ params }: { params: Promise<{ appid: string }> }) {
  const { appid } = use(params);
  const [game, setGame] = useState<Game | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const lib = getStoredLibrary();
    const found = lib?.games.find((g) => g.steamAppId === Number(appid) || g.id === `steam-${appid}`);
    if (found) setGame(found);
    else setNotFound(true);
  }, [appid]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-stone-400 dark:text-stone-600 mb-4">Game not found in your library.</p>
          <Link href="/" className="text-violet-500 hover:underline text-sm">← Back to library</Link>
        </main>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-stone-400 dark:text-stone-600 text-sm">Loading…</p>
        </main>
      </div>
    );
  }

  const designRiskScore = calculateDesignRiskScore(game);
  const joyIndex = calculateJoyIndex(game, designRiskScore);
  const detectedPatterns = detectHabitPatterns(game);
  const recommendation = generateRecommendation(designRiskScore, joyIndex);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-stone-400 dark:text-stone-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to library
        </Link>

        <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-16 h-16 rounded-2xl ${game.coverColor} opacity-80`} aria-hidden />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-100">{game.title}</h1>
                <span className="text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 px-2 py-0.5 rounded-full">Steam</span>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400">{game.developer}{game.publisher !== game.developer ? ` · ${game.publisher}` : ""}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-stone-400 dark:text-stone-500">
                <span className="font-semibold text-stone-600 dark:text-stone-300">{game.hoursPlayed.toLocaleString()}h played</span>
                {game.steamAppId && <a href={`https://store.steampowered.com/app/${game.steamAppId}`} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition-colors">View on Steam →</a>}
              </div>
              {game.genre.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {game.genre.map((g) => <span key={g} className="text-xs bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">{g}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Design Risk Score</p>
              <ConfidenceBadge confidence={designRiskScore.confidence} />
            </div>
            <p className={`text-4xl font-bold tabular-nums ${riskColor(designRiskScore.total)}`}>{designRiskScore.total}<span className="text-lg font-normal text-stone-400">/100</span></p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 mb-4">{designRiskScore.flags.length} concern pattern{designRiskScore.flags.length !== 1 ? "s" : ""} detected</p>
            <RiskBreakdownBar score={designRiskScore} />
          </div>
          <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">Joy Index</p>
            <p className={`text-4xl font-bold tabular-nums ${joyColor(joyIndex.total)}`}>{joyIndex.total}<span className="text-lg font-normal text-stone-400">/100</span></p>
            <p className={`text-sm font-semibold mt-1 ${joyColor(joyIndex.total)}`}>{joyIndex.label}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-3">Community score: <span className="font-medium text-stone-600 dark:text-stone-300">{game.communityScore}/100</span></p>
          </div>
          <div className={`rounded-2xl border shadow-sm p-5 ${verdictStyles[recommendation.verdict]}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3">Verdict</p>
            <p className="text-lg font-bold mb-1">{verdictLabel[recommendation.verdict]}</p>
            <p className="text-sm font-semibold mb-3">{recommendation.headline}</p>
            <p className="text-xs opacity-80 leading-relaxed">{recommendation.detail}</p>
          </div>
        </div>

        {/* Personalized "For you" layer */}
        <ForYouConcern score={designRiskScore} />

        {recommendation.actions.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
            <h2 className="font-semibold text-stone-800 dark:text-stone-100 mb-3">Recommended Actions</h2>
            <ul className="flex flex-col gap-2">
              {recommendation.actions.map((action) => (
                <li key={action} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {detectedPatterns.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
            <h2 className="font-semibold text-stone-800 dark:text-stone-100 mb-4">Detected Design Patterns</h2>
            <div className="flex flex-col gap-4">
              {detectedPatterns.map((p) => (
                <div key={p.pattern} className="flex items-start gap-3">
                  <PatternBadge pattern={p} />
                  <p className="text-sm text-stone-500 dark:text-stone-400 flex-1">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-stone-800 dark:text-stone-100">Why this score</h2>
            <ConfidenceBadge confidence={designRiskScore.confidence} />
          </div>
          <RiskFactorList score={designRiskScore} />
          {designRiskScore.confidence === "low" && (
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-4 pt-3 border-t border-stone-100 dark:border-stone-700">
              This game was analysed from its Steam store listing, so its mechanics are an estimate.
              Curated games use hand-verified data.
            </p>
          )}
        </div>
      </main>
      <footer className="text-center text-xs text-stone-300 dark:text-stone-700 pb-8 pt-4">Anti-FOMO · Evidence-based gaming insights · Open source</footer>
    </div>
  );
}
