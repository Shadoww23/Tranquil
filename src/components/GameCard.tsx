import Link from "next/link";
import type { AnalyzedGame } from "@/lib/types";
import { joyColor, riskBarColor } from "@/lib/colorUtils";
import PatternBadge from "./PatternBadge";

const platformStyles: Record<AnalyzedGame["platform"], string> = {
  Steam:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  Epic:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
  GOG: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
};

const verdictStyles: Record<AnalyzedGame["recommendation"]["verdict"], string> = {
  healthy:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  mindful:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  caution:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  "red-flag":
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
};

interface Props {
  game: AnalyzedGame;
}

export default function GameCard({ game }: Props) {
  const { designRiskScore, joyIndex, detectedPatterns, recommendation } = game;
  const visiblePatterns = detectedPatterns.slice(0, 3);
  const hiddenCount = detectedPatterns.length - visiblePatterns.length;

  return (
    <Link
      href={`/game/${game.id}`}
      className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-4 flex flex-col gap-3 hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-md transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`shrink-0 w-8 h-8 rounded-lg ${game.coverColor} opacity-80`} aria-hidden />
          <div className="min-w-0">
            <h3 className="font-semibold text-stone-800 dark:text-stone-100 truncate leading-tight">
              {game.title}
            </h3>
            <p className="text-xs text-stone-400 dark:text-stone-500 truncate">
              {game.genre.join(" · ")}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${platformStyles[game.platform]}`}
        >
          {game.platform}
        </span>
      </div>

      {/* Hours */}
      <p className="text-xs text-stone-400 dark:text-stone-500">
        <span className="font-semibold text-stone-600 dark:text-stone-300">
          {game.hoursPlayed.toLocaleString()}h
        </span>{" "}
        played
      </p>

      {/* Design Risk Score */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-stone-500 dark:text-stone-400">Design Risk Score</span>
          <span className="font-semibold text-stone-700 dark:text-stone-200">
            {designRiskScore.total}/100
          </span>
        </div>
        <div
          className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-700 overflow-hidden"
          role="progressbar"
          aria-valuenow={designRiskScore.total}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Design risk score: ${designRiskScore.total} out of 100`}
        >
          <div
            className={`h-full rounded-full ${riskBarColor(designRiskScore.total)}`}
            style={{ width: `${designRiskScore.total}%` }}
          />
        </div>
      </div>

      {/* Joy Index */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500 dark:text-stone-400">Joy Index</span>
        <span className={`text-xs font-semibold ${joyColor(joyIndex.total)}`}>
          {joyIndex.total}/100 · {joyIndex.label}
        </span>
      </div>

      {/* Detected Patterns */}
      {detectedPatterns.length > 0 && (
        <div className="flex flex-wrap gap-1" aria-label="Detected design patterns">
          {visiblePatterns.map((p) => (
            <PatternBadge key={p.pattern} pattern={p} />
          ))}
          {hiddenCount > 0 && (
            <span className="text-xs text-stone-400 dark:text-stone-500 self-center">
              +{hiddenCount} more
            </span>
          )}
        </div>
      )}

      {/* Verdict */}
      <div className={`rounded-xl border p-2.5 mt-auto ${verdictStyles[recommendation.verdict]}`}>
        <p className="text-xs font-semibold">{recommendation.headline}</p>
      </div>
    </Link>
  );
}
