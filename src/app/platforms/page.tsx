import Link from "next/link";
import { mockGameLibrary } from "@/lib/data";
import {
  calculateDesignRiskScore,
  calculateJoyIndex,
  generateRecommendation,
} from "@/lib/engines";
import { riskColor, joyColor } from "@/lib/colorUtils";
import Header from "@/components/Header";

type Platform = "Steam" | "Epic" | "GOG";

const PLATFORM_META: Record<
  Platform,
  { dotColor: string; labelColor: string; description: string }
> = {
  Steam: {
    dotColor: "bg-sky-500",
    labelColor: "text-sky-600 dark:text-sky-400",
    description:
      "Valve's PC marketplace — the world's largest, with a wide range of monetisation models.",
  },
  Epic: {
    dotColor: "bg-indigo-500",
    labelColor: "text-indigo-600 dark:text-indigo-400",
    description:
      "Features free weekly games and exclusives, but many titles lean on battle passes and live-service mechanics.",
  },
  GOG: {
    dotColor: "bg-violet-500",
    labelColor: "text-violet-600 dark:text-violet-400",
    description:
      "DRM-free store focused on player rights. Curates titles that tend to avoid aggressive monetisation.",
  },
};

export default function PlatformsPage() {
  const analyzed = mockGameLibrary.map((game) => {
    const designRiskScore = calculateDesignRiskScore(game);
    const joyIndex = calculateJoyIndex(game, designRiskScore);
    const recommendation = generateRecommendation(designRiskScore, joyIndex);
    return { ...game, designRiskScore, joyIndex, recommendation };
  });

  const platforms = (["Steam", "Epic", "GOG"] as Platform[]).flatMap((id) => {
    const games = analyzed
      .filter((g) => g.platform === id)
      .sort((a, b) => b.hoursPlayed - a.hoursPlayed);
    if (games.length === 0) return [];
    const avgRisk = Math.round(
      games.reduce((s, g) => s + g.designRiskScore.total, 0) / games.length
    );
    const avgJoy = Math.round(
      games.reduce((s, g) => s + g.joyIndex.total, 0) / games.length
    );
    const cleanCount = games.filter(
      (g) =>
        g.recommendation.verdict === "healthy" ||
        g.recommendation.verdict === "mindful"
    ).length;
    const flaggedCount = games.filter(
      (g) =>
        g.recommendation.verdict === "caution" ||
        g.recommendation.verdict === "red-flag"
    ).length;
    return [{ id, meta: PLATFORM_META[id], games, avgRisk, avgJoy, cleanCount, flaggedCount }];
  });

  const cleanest = [...platforms].sort((a, b) => a.avgRisk - b.avgRisk)[0];
  const riskiest = [...platforms].sort((a, b) => b.avgRisk - a.avgRisk)[0];

  const totalGames = platforms.reduce((s, p) => s + p.games.length, 0);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 dark:text-stone-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to library
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Platform Breakdown
          </h1>
          <p className="text-stone-500 dark:text-stone-400 max-w-2xl">
            {totalGames} games across {platforms.length} platforms. See which store best serves your
            wellbeing — and which carries the most design risk.
          </p>
        </div>

        {/* Platform comparison cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {platforms.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl ${p.meta.dotColor} flex-shrink-0`}
                  aria-hidden
                />
                <div>
                  <p className={`font-semibold ${p.meta.labelColor}`}>{p.id}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    {p.games.length} game{p.games.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500 dark:text-stone-400">Avg Risk</span>
                  <span className={`font-semibold ${riskColor(p.avgRisk)}`}>
                    {p.avgRisk}/100
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500 dark:text-stone-400">Avg Joy</span>
                  <span className={`font-semibold ${joyColor(p.avgJoy)}`}>
                    {p.avgJoy}/100
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500 dark:text-stone-400">Clean / Flagged</span>
                  <span className="font-semibold text-stone-700 dark:text-stone-200">
                    <span className="text-emerald-600 dark:text-emerald-400">{p.cleanCount}</span>
                    {" · "}
                    <span className="text-red-500 dark:text-red-400">{p.flaggedCount}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-400 dark:text-stone-500 leading-relaxed border-t border-stone-100 dark:border-stone-700 pt-3">
                {p.meta.description}
              </p>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="grid sm:grid-cols-2 gap-4">
          {cleanest && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-500 mb-1">
                Cleanest Platform
              </p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {cleanest.id}
              </p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70 mt-1">
                Avg Design Risk Score: {cleanest.avgRisk}/100 &middot;{" "}
                {cleanest.cleanCount} of {cleanest.games.length} games are clean
              </p>
            </div>
          )}
          {riskiest && cleanest?.id !== riskiest.id && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-500 dark:text-red-400 mb-1">
                Most Concerning Platform
              </p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {riskiest.id}
              </p>
              <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-1">
                Avg Design Risk Score: {riskiest.avgRisk}/100 &middot;{" "}
                {riskiest.flaggedCount} of {riskiest.games.length} games flagged
              </p>
            </div>
          )}
        </div>

        {/* Per-platform game lists */}
        {platforms.map((p) => (
          <section key={p.id}>
            <h2 className="font-semibold text-stone-700 dark:text-stone-300 text-sm uppercase tracking-wider mb-3">
              {p.id} Library ({p.games.length})
            </h2>
            <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm overflow-hidden">
              {p.games.map((game, i) => (
                <Link
                  key={game.id}
                  href={`/game/${game.id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors ${
                    i < p.games.length - 1
                      ? "border-b border-stone-100 dark:border-stone-700"
                      : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg ${game.coverColor} opacity-80 shrink-0`}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
                      {game.title}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 truncate">
                      {game.genre.join(" · ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <p className={`text-xs font-semibold ${riskColor(game.designRiskScore.total)}`}>
                      Risk {game.designRiskScore.total}
                    </p>
                    <p className={`text-xs ${joyColor(game.joyIndex.total)}`}>
                      Joy {game.joyIndex.total}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="text-center text-xs text-stone-300 dark:text-stone-700 pb-8 pt-4">
        Anti-FOMO &middot; Evidence-based gaming insights &middot; Open source
      </footer>
    </div>
  );
}
