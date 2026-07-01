# Tranquil — Anti-FOMO Gaming Insights

A consumer-advocacy web app that scores your game library on **Design Risk** (how
predatory a game's monetisation is) and **Joy Index** (genuine enjoyment). Import
your Steam library and Tranquil surfaces the patterns games use to keep you
playing and paying — gacha loops, FOMO events, energy systems, pay-to-win — so
you can make informed choices about how you spend your time and money.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Shadoww23/Tranquil)

---

## What it does

- **Design Risk Score (0–100)** — a weighted count of concern patterns. Gacha,
  pay-to-win, and loot boxes carry the most weight. Lower is better.
- **Joy Index (0–100)** — community satisfaction minus a design-risk penalty.
  Higher is better.
- **Verdict** — every game lands on `healthy · mindful · caution · red-flag`,
  derived from both scores together.
- **Pattern registry** — an evidence-based catalogue of the design patterns that
  influence player behaviour, with how-to-identify notes and research context.
- **Platform breakdown** — compares Steam, Epic, and GOG by average risk so you
  can see which store best serves your wellbeing.
- **"What You Didn't Miss"** — reframes passed limited-time events to defuse FOMO.
- **Mindful Session tools** — a Pomodoro focus timer, breathing exercise, daily
  intention, and a 7-day focus timeline built from your own session history.

## Steam import

Connect your Steam library from the header (**Connect Steam →**). The 4-step
wizard resolves your profile, fetches your owned games, and analyses each one.

Your **Steam Web API key is never stored server-side** — it travels as an
`x-steam-key` header from your browser → the app's proxy route → Steam, then is
discarded. It only ever lives in your own browser's `localStorage`. Curated games
(hand-verified mechanic data) skip the store API entirely; everything else is
inferred from the Steam store listing.

No account, no database, no tracking — all your data lives in your browser.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run test       # run the engine test suite (Vitest)
npm run lint       # ESLint
```

> **Tailwind v4 native binding error?** If you see `Cannot find native binding` /
> `@tailwindcss/oxide-linux-x64-gnu` (common in containers/Codespaces), reinstall
> clean: `rm -rf node_modules package-lock.json .next && npm install`.

## Deploy

The app is a standard Next.js App Router project and deploys on Vercel's
defaults — no environment variables required.

1. Push to GitHub (already done if you're reading this).
2. On [vercel.com](https://vercel.com/new) → **Add New → Project** → import this
   repo.
3. Deploy. You'll get a live URL in ~2 minutes.

Or use the **Deploy with Vercel** button above.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS v4** (class-based dark mode)
- **Recharts** for charts
- **Vitest** for the scoring-engine unit tests

## How scoring works

The four scoring engines live in `src/lib/engines/` as pure, unit-tested
functions:

| Engine | Purpose |
|---|---|
| `calculateDesignRiskScore` | Weighted sum of mechanic flags → 0–100 |
| `calculateJoyIndex` | `community × 0.8 − risk × 0.3`, clamped 0–100 |
| `detectHabitPatterns` | Returns detected patterns with severity |
| `generateRecommendation` | Final verdict from risk + joy |

For a deeper tour of the architecture — data flow, page routing, dark-mode
implementation, and the curated-game system — see [`CLAUDE.md`](./CLAUDE.md).

## License

MIT — open source and community-maintained. Pattern definitions are based on
published research and regulatory findings.
