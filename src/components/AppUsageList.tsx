"use client";

import Link from "next/link";
import type { AnalyzedGame } from "@/lib/types";

interface Props {
  games: AnalyzedGame[];
}

export default function AppUsageList({ games }: Props) {
  if (games.length === 0) return null;

  const sorted = [...games].sort((a, b) => b.hoursPlayed - a.hoursPlayed).slice(0, 20);
  const maxHours = sorted[0]?.hoursPlayed ?? 1;
  const totalHours = games.reduce((s, g) => s + g.hoursPlayed, 0);

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-700">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Hours Breakdown</p>
        <p className="text-xs text-stone-400 dark:text-stone-500">{totalHours.toLocaleString()}h total</p>
      </div>
      {sorted.map((game, i) => {
        const pct = Math.max(2, Math.round((game.hoursPlayed / maxHours) * 100));
        const href = game.id.startsWith("steam-") && game.steamAppId ? `/steam/${game.steamAppId}` : `/game/${game.id}`;
        const barColor = game.recommendation.verdict === "healthy" ? "bg-emerald-400" : game.recommendation.verdict === "mindful" ? "bg-blue-400" : game.recommendation.verdict === "caution" ? "bg-amber-400" : "bg-red-400";
        return (
          <Link key={game.id} href={href} className={`flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors ${i < sorted.length - 1 ? "border-b border-stone-50 dark:border-stone-700/50" : ""}`}>
            <span className="w-5 text-xs text-stone-300 dark:text-stone-600 text-right shrink-0">{i + 1}</span>
            <div className={`w-6 h-6 rounded-md ${game.coverColor} opacity-70 shrink-0`} aria-hidden />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-700 dark:text-stone-200 truncate">{game.title}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="flex-1 h-1 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden max-w-[120px]">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">{game.hoursPlayed.toLocaleString()}h</p>
              <p className="text-xs text-stone-400 dark:text-stone-500">{Math.round((game.hoursPlayed / totalHours) * 100)}%</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
