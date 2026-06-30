import type { AnalyzedGame } from "@/lib/types";

interface Props {
  games: AnalyzedGame[];
}

export default function PlayerHealthSummary({ games }: Props) {
  const avgJoy = Math.round(
    games.reduce((s, g) => s + g.joyIndex.total, 0) / games.length
  );
  const concernCount = games.filter(
    (g) => g.recommendation.verdict === "caution" || g.recommendation.verdict === "red-flag"
  ).length;
  const cleanCount = games.filter((g) => g.recommendation.verdict === "healthy").length;
  const totalHours = games.reduce((s, g) => s + g.hoursPlayed, 0);
  const topGame = [...games].sort((a, b) => b.hoursPlayed - a.hoursPlayed)[0];

  const joyColor =
    avgJoy >= 70
      ? "text-emerald-600 dark:text-emerald-400"
      : avgJoy >= 50
        ? "text-blue-600 dark:text-blue-400"
        : avgJoy >= 30
          ? "text-amber-600 dark:text-amber-400"
          : "text-red-600 dark:text-red-400";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 border border-violet-100 dark:border-violet-900 p-6">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 dark:text-violet-400">
            Library Health Report
          </p>
          <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-100 mt-1">
            {games.length} games analyzed
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            {concernCount} needing review &middot;{" "}
            {totalHours.toLocaleString()} hours played total
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/70 dark:bg-stone-800/50 rounded-xl p-3 border border-white/50 dark:border-stone-700/50">
            <p className="text-xs text-stone-400 dark:text-stone-500">Avg Joy Index</p>
            <p className={`text-xl font-bold mt-0.5 ${joyColor}`}>{avgJoy}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">
            {avgJoy >= 75 ? "Excellent" : avgJoy >= 50 ? "Good" : avgJoy >= 25 ? "Fair" : "Poor"}
          </p>
          </div>
          <div className="bg-white/70 dark:bg-stone-800/50 rounded-xl p-3 border border-white/50 dark:border-stone-700/50">
            <p className="text-xs text-stone-400 dark:text-stone-500">Clean Games</p>
            <p className="text-xl font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
              {cleanCount}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500">healthy picks</p>
          </div>
          <div className="bg-white/70 dark:bg-stone-800/50 rounded-xl p-3 border border-white/50 dark:border-stone-700/50">
            <p className="text-xs text-stone-400 dark:text-stone-500">Most Played</p>
            <p className="text-sm font-bold mt-0.5 text-stone-700 dark:text-stone-200 truncate">
              {topGame.title.split(" ")[0]}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500">{topGame.hoursPlayed}h played</p>
          </div>
        </div>
      </div>
    </div>
  );
}
