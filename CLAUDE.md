# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server at localhost:3000
npm run build      # production build (must pass before pushing)
npm run test       # run all tests
npm run lint       # ESLint

# run a single test file
npx vitest run src/lib/engines/__tests__/predatoryScore.test.ts
```

### Tailwind v4 native binding issue (common in Codespaces / containers)

If you see `Cannot find native binding` / `@tailwindcss/oxide-linux-x64-gnu` errors:

```bash
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

## Architecture

### What this is

Anti-FOMO Gaming Insights — a consumer-advocacy web app that scores games on **Design Risk** (how predatory their monetisation is) and **Joy Index** (genuine enjoyment). Users import their Steam library; the app analyses each game and surfaces patterns like gacha loops, FOMO events, and energy systems.

### Scoring engines (`src/lib/engines/`)

The core of the product. Four pure functions, all unit-tested:

| File | Export | Purpose |
|---|---|---|
| `predatoryScore.ts` | `calculateDesignRiskScore(game)` | Weighted sum of mechanics flags → 0–100 |
| `joyIndex.ts` | `calculateJoyIndex(game, riskScore)` | `communityScore × 0.8 − risk × 0.3`, clamped 0–100 |
| `habitLoop.ts` | `detectHabitPatterns(game)` | Returns `DetectedPattern[]` with severity |
| `recommendations.ts` | `generateRecommendation(risk, joy)` | Verdict: `healthy / mindful / caution / red-flag` |

All four are re-exported from `src/lib/engines/index.ts`. The canonical type for the risk score is **`DesignRiskScore`** (not `PredatoryScore`).

### Data flow

```
Steam API (server-side proxy)
  └─ /api/steam/library    → GetOwnedGames (requires x-steam-key header)
  └─ /api/steam/resolve    → ResolveVanityURL (username → 64-bit Steam ID)
  └─ /api/steam/appdetails → store.steampowered.com/api/appdetails (cached 1h)

steamImport.ts (client-side orchestrator)
  ├─ Curated appids (CURATED_APPIDS in steamInference.ts) → use mockGameLibrary data, update hours only
  └─ Other played games → fetch appdetails → inferMechanicsFromSteamData()

userLibrary.ts (localStorage CRUD)
  ├─ tranquil-user-library  → StoredLibrary (meta + games[])
  ├─ tranquil-steam-api-key → user's Steam Web API key
  ├─ tranquil-steam-id      → resolved 64-bit Steam ID
  ├─ tranquil-sessions      → SessionEntry[] (focus timer history)
  └─ tranquil-intention     → string (daily intention text)
```

The Steam API key is **never stored server-side** — it travels as `x-steam-key` header from client → API route → Steam, then is discarded.

### Page routing split

There are **two separate game detail routes**:

- `/game/[id]` — SSG, only for the 20 demo games in `mockGameLibrary`. IDs like `stardew-valley`.
- `/steam/[appid]` — client-only, reads `localStorage`. IDs are numeric Steam app IDs.

`GameCard` and `AppUsageList` route to `/steam/[appid]` when `game.id.startsWith("steam-")`, otherwise `/game/[id]`.

### Dark mode

Dark mode is class-based (`.dark` on `<html>`). Tailwind v4 uses a custom variant:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

A blocking inline `<script>` in `layout.tsx` reads `tranquil-theme` from localStorage before hydration to prevent flash. The Header's `toggleDark` function and SettingsModal's theme picker both write to this key and toggle the class directly.

SVG text/ring colours that can't use Tailwind utilities use CSS variables (`--svg-text-primary`, `--svg-text-secondary`, `--svg-ring-track`) defined in `globals.css`.

### Client vs server components

`src/app/page.tsx` (home) is `"use client"` because it reads localStorage on mount to switch between demo data and the user's Steam library. Most other pages are server components.

Components that touch `localStorage`, browser APIs, or React state are `"use client"`. Components that only receive props and render are server-compatible.

### Cross-component communication

The "Connect Steam →" link on the home page banner and the mobile nav both trigger the Header's `SteamConnect` modal via a custom DOM event:

```ts
document.dispatchEvent(new CustomEvent("open-steam-connect"));
```

The Header listens for this in a `useEffect`. Similarly, `PomodoroTimer` dispatches `tranquil-session-saved` when a session completes so `FocusTimeline` can refresh without a page reload.

### Curated game data

`steamInference.ts` exports `CURATED_APPIDS` — a map of 13 known Steam app IDs (Stardew Valley, Hollow Knight, Hades, etc.) to their `mockGameLibrary` IDs. During import, curated games skip the store API call entirely and use the hand-verified mechanic data, only updating `hoursPlayed` from Steam.

### Key types (`src/lib/types.ts`)

- `Game` — base game object including `mechanics: GameMechanics` and optional `steamAppId?: number`
- `AnalyzedGame extends Game` — adds `designRiskScore`, `joyIndex`, `detectedPatterns`, `recommendation`
- `DesignRiskScore` — `{ total, breakdown: { monetization, manipulation, compulsion }, flags[] }`

### Tests

Tests live in `src/lib/engines/__tests__/` and use Vitest with `globals: true`. The `@` alias resolves to `src/`. Tests run in a Node environment (no DOM), so they only cover pure engine functions — not components or API routes.
