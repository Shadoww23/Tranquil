const PAST_EVENTS = [
  {
    id: "fortnite-c6s1",
    game: "Fortnite",
    coverColor: "bg-cyan-500",
    event: "Chapter 6 Season 1 Battle Pass",
    daysAgo: 47,
    whatWasMissed: "100 cosmetic items",
    impact: "Zero gameplay advantages — skins don't change damage, speed, or survival odds.",
  },
  {
    id: "genshin-lantern",
    game: "Genshin Impact",
    coverColor: "bg-amber-500",
    event: "Lantern Rite Festival",
    daysAgo: 31,
    whatWasMissed: "Limited character skins & event currency",
    impact: "All characters remain fully usable. Story content is available permanently.",
  },
  {
    id: "apex-harbingers",
    game: "Apex Legends",
    coverColor: "bg-orange-600",
    event: "Harbingers Collection Event",
    daysAgo: 19,
    whatWasMissed: "16 limited-edition skins",
    impact: "Every legend plays identically regardless of cosmetics.",
  },
  {
    id: "valorant-nightmarket",
    game: "Valorant",
    coverColor: "bg-red-500",
    event: "Night Market Rotation",
    daysAgo: 12,
    whatWasMissed: "6 discounted weapon skins",
    impact: "Weapon skins are visual only — hitboxes and spray patterns are unchanged.",
  },
  {
    id: "pokemon-go-season",
    game: "Pokémon GO",
    coverColor: "bg-yellow-500",
    event: "Shared Skies Season",
    daysAgo: 8,
    whatWasMissed: "Seasonal spawns & a badge",
    impact:
      "Many featured Pokémon will return in future seasons. The badge was decorative.",
  },
] as const;

export default function WhatYouDidntMiss() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-semibold text-stone-800 dark:text-stone-100 text-sm">
          What You Didn&apos;t Miss
        </h2>
        <span className="text-xs text-stone-400 dark:text-stone-500">
          &middot; Limited-time events that have passed
        </span>
      </div>

      <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-700 bg-emerald-50/50 dark:bg-emerald-950/20">
          <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
            These events ended without you. Your enjoyment of each game is unchanged — FOMO works by making temporary cosmetics feel permanent losses. They weren&apos;t.
          </p>
        </div>

        {PAST_EVENTS.map((ev, i) => (
          <div
            key={ev.id}
            className={`flex items-start gap-3 px-4 py-3.5 ${
              i < PAST_EVENTS.length - 1
                ? "border-b border-stone-100 dark:border-stone-700"
                : ""
            }`}
          >
            <div className={`w-7 h-7 rounded-lg ${ev.coverColor} opacity-70 shrink-0 mt-0.5`} aria-hidden />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-stone-800 dark:text-stone-100">
                  {ev.game}
                </span>
                <span className="text-xs text-stone-400 dark:text-stone-500">
                  {ev.event}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {ev.impact}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-stone-400 dark:text-stone-500">
                {ev.daysAgo}d ago
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Survived ✓
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
