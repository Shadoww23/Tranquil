import Link from "next/link";
import { PATTERN_REGISTRY } from "@/lib/patterns";
import type { GameMechanics } from "@/lib/types";
import { mockGameLibrary } from "@/lib/data";
import Header from "@/components/Header";

const categoryStyles = {
  monetization: {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
    dot: "bg-rose-400",
  },
  manipulation: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-400",
  },
  compulsion: {
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800",
    dot: "bg-violet-400",
  },
} as const;

const severityStyles = {
  low: "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
} as const;

function countGamesWithPattern(mechanicsKey: keyof GameMechanics): number {
  return mockGameLibrary.filter((g) => !!g.mechanics[mechanicsKey]).length;
}

export default function PatternsPage() {
  const monetization = PATTERN_REGISTRY.filter((p) => p.category === "monetization");
  const manipulation = PATTERN_REGISTRY.filter((p) => p.category === "manipulation");
  const compulsion = PATTERN_REGISTRY.filter((p) => p.category === "compulsion");

  const totalGames = mockGameLibrary.length;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
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

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Design Pattern Registry
          </h1>
          <p className="text-stone-500 dark:text-stone-400 max-w-2xl">
            Evidence-based documentation of game design patterns that influence player behaviour.
            Understanding these patterns helps you make informed decisions about the games you play.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              { label: "Monetization", count: monetization.length, style: categoryStyles.monetization },
              { label: "Manipulation", count: manipulation.length, style: categoryStyles.manipulation },
              { label: "Compulsion", count: compulsion.length, style: categoryStyles.compulsion },
            ] as const
          ).map(({ label, count, style }) => (
            <div
              key={label}
              className={`rounded-2xl bg-white dark:bg-stone-800 border ${style.border} shadow-sm p-4`}
            >
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${style.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden />
                {label}
              </div>
              <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{count}</p>
              <p className="text-xs text-stone-400 dark:text-stone-500">pattern{count !== 1 ? "s" : ""} tracked</p>
            </div>
          ))}
        </div>

        {/* Pattern sections */}
        {(
          [
            { title: "Monetization Patterns", patterns: monetization, style: categoryStyles.monetization },
            { title: "Manipulation Patterns", patterns: manipulation, style: categoryStyles.manipulation },
            { title: "Compulsion Patterns", patterns: compulsion, style: categoryStyles.compulsion },
          ] as const
        ).map(({ title, patterns, style }) => (
          <section key={title}>
            <h2 className="font-semibold text-stone-700 dark:text-stone-300 text-sm uppercase tracking-wider mb-4">
              {title}
            </h2>
            <div className="flex flex-col gap-4">
              {patterns.map((pattern) => {
                const count = countGamesWithPattern(pattern.mechanicsKey);
                const pct = Math.round((count / totalGames) * 100);
                return (
                  <div
                    key={pattern.id}
                    className={`rounded-2xl bg-white dark:bg-stone-800 border ${style.border} shadow-sm p-5`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-stone-800 dark:text-stone-100">
                          {pattern.name}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityStyles[pattern.defaultSeverity]}`}>
                          {pattern.defaultSeverity} severity
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-stone-700 dark:text-stone-200">{count}/{totalGames}</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">games in library ({pct}%)</p>
                      </div>
                    </div>

                    <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">
                      {pattern.description}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1.5">
                          How to Identify
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                          {pattern.howToIdentify}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1.5">
                          Research Context
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                          {pattern.researchContext}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <p className="text-xs text-stone-300 dark:text-stone-700 text-center pb-4">
          Pattern definitions are based on published research and regulatory findings. This registry is open source and community-maintained.
        </p>
      </main>

      <footer className="text-center text-xs text-stone-300 dark:text-stone-700 pb-8 pt-4">
        Anti-FOMO &middot; Evidence-based gaming insights &middot; Open source
      </footer>
    </div>
  );
}
