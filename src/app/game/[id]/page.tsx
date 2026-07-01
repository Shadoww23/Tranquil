import { notFound } from "next/navigation";
import Link from "next/link";
import { mockGameLibrary } from "@/lib/data";
import {
  calculateDesignRiskScore,
  calculateJoyIndex,
  detectHabitPatterns,
  generateRecommendation,
} from "@/lib/engines";
import { joyColor, riskColor } from "@/lib/colorUtils";
import PatternBadge from "@/components/PatternBadge";
import RiskBreakdownBar from "@/components/RiskBreakdownBar";
import { ConfidenceBadge, RiskFactorList } from "@/components/RiskFactors";
import ForYouConcern from "@/components/ForYouConcern";
import GameCover from "@/components/GameCover";
import Header from "@/components/Header";

const verdictStyles = {
  healthy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  mindful: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  caution: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  "red-flag": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
} as const;

const verdictLabel = {
  healthy: "Healthy",
  mindful: "Mindful",
  caution: "Caution",
  "red-flag": "Red Flag",
} as const;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GameDetailPage({ params }: Props) {
  const { id } = await params;
  const game = mockGameLibrary.find((g) => g.id === id);
  if (!game) notFound();

  const designRiskScore = calculateDesignRiskScore(game);
  const joyIndex = calculateJoyIndex(game, designRiskScore);
  const detectedPatterns = detectHabitPatterns(game);
  const recommendation = generateRecommendation(designRiskScore, joyIndex);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 dark:text-stone-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to library
        </Link>

        {/* Hero */}
        <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <GameCover game={game} className="shrink-0 w-16 h-16 rounded-2xl" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-100">{game.title}</h1>
                <span className="text-xs font-medium bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded-full">
                  {game.platform}
                </span>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {game.developer} &middot; {game.publisher} &middot; {game.releaseYear}
              </p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-stone-400 dark:text-stone-500">
                <span>{game.price === 0 ? "Free to Play" : `$${game.price.toFixed(2)}`}</span>
                {game.ageRating && <span>Rated {game.ageRating}</span>}
                {game.requiresOnline && <span>Online required</span>}
                {game.estimatedHoursToComplete ? (
                  <span>~{game.estimatedHoursToComplete}h to complete</span>
                ) : null}
                <span className="font-semibold text-stone-600 dark:text-stone-300">{game.hoursPlayed}h played</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {game.genre.map((g) => (
                  <span key={g} className="text-xs bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Score row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Design Risk Score */}
          <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Design Risk Score
              </p>
              <ConfidenceBadge confidence={designRiskScore.confidence} />
            </div>
            <p className={`text-4xl font-bold tabular-nums ${riskColor(designRiskScore.total)}`}>
              {designRiskScore.total}
              <span className="text-lg font-normal text-stone-400">/100</span>
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 mb-4">
              {designRiskScore.flags.length} concern pattern{designRiskScore.flags.length !== 1 ? "s" : ""} detected
            </p>
            <RiskBreakdownBar score={designRiskScore} />
          </div>

          {/* Joy Index */}
          <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
              Joy Index
            </p>
            <p className={`text-4xl font-bold tabular-nums ${joyColor(joyIndex.total)}`}>
              {joyIndex.total}
              <span className="text-lg font-normal text-stone-400">/100</span>
            </p>
            <p className={`text-sm font-semibold mt-1 ${joyColor(joyIndex.total)}`}>{joyIndex.label}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-3 leading-relaxed">
              Community score: <span className="font-medium text-stone-600 dark:text-stone-300">{game.communityScore}/100</span>
              <br />
              Joy reflects genuine enjoyment after accounting for design risk.
            </p>
          </div>

          {/* Verdict */}
          <div className={`rounded-2xl border shadow-sm p-5 ${verdictStyles[recommendation.verdict]}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3">
              Verdict
            </p>
            <p className="text-lg font-bold mb-1">{verdictLabel[recommendation.verdict]}</p>
            <p className="text-sm font-semibold mb-3">{recommendation.headline}</p>
            <p className="text-xs opacity-80 leading-relaxed">{recommendation.detail}</p>
          </div>
        </div>

        {/* Personalized "For you" layer */}
        <ForYouConcern score={designRiskScore} />

        {/* Recommended actions */}
        {recommendation.actions.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
            <h2 className="font-semibold text-stone-800 dark:text-stone-100 mb-3">Recommended Actions</h2>
            <ul className="flex flex-col gap-2">
              {recommendation.actions.map((action) => (
                <li key={action} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detected Patterns */}
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
            <p className="mt-4 text-xs text-stone-300 dark:text-stone-600">
              <Link href="/patterns" className="underline hover:text-violet-500 transition-colors">
                Learn about these patterns in the Pattern Registry →
              </Link>
            </p>
          </div>
        )}

        {/* Why this score */}
        <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-stone-800 dark:text-stone-100">Why this score</h2>
            <ConfidenceBadge confidence={designRiskScore.confidence} />
          </div>
          <RiskFactorList score={designRiskScore} />
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-4 pt-3 border-t border-stone-100 dark:border-stone-700">
            Points reflect <span className="font-medium">severity</span>, not just presence — cosmetic-only
            purchases score far lower than pay-for-power. Total: {designRiskScore.total}/100.
          </p>
        </div>
      </main>

      <footer className="text-center text-xs text-stone-300 dark:text-stone-700 pb-8 pt-4">
        Anti-FOMO &middot; Evidence-based gaming insights &middot; Open source
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
  return mockGameLibrary.map((game) => ({ id: game.id }));
}
