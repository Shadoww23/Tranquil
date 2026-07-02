# Tranquil for Steam (browser extension)

Overlays Tranquil's **Design Risk** and **Joy** scores onto Steam store pages, so
you can see how predatory a game's monetisation is before you buy — right on the
store page.

It reuses the **exact scoring engine** from the web app (shared source in
`../src/lib/engines`), so a game's score is identical here and on the site.

- **Store app pages** — injects a full card near the title (scores, verdict, and
  the top contributing factors with their reasons on hover).
- **Browse / search / wishlist pages** — pins a compact **R / J** badge onto each
  game tile, so scores follow you as you browse, not just on the store page.

Tiles are scored lazily as they scroll into view, and every game's Steam
`appdetails` is fetched once, **throttled** (so we never trip Steam's rate
limiting) and **cached** locally — so browsing stays fast. The cache stores the
raw store data, not the score, so any improvement to the scoring engine takes
effect immediately.

## Build

From the repo root:

```bash
npm run build:ext        # outputs extension/dist/
npm run build:ext -- --minify   # minified build
```

## Load it in Chrome / Edge (unpacked)

1. Build (above) — this creates `extension/dist/`.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select the **`extension/dist`** folder.
5. Visit any Steam store page, e.g. `https://store.steampowered.com/app/1145360/Hades/`
   — a **Tranquil** card should appear near the top with the game's scores.

Reload the extension (the ↻ on the extensions page) after each rebuild.

## Scope (v0.2)

- Runs on `store.steampowered.com/*` — app pages (full card) and browse / search
  / wishlist pages (per-tile badges).
- Manifest V3. One permission: `storage`, for the local score cache. Data comes
  from a same-origin `appdetails` fetch on the page.

## Roadmap

- ~~Library / wishlist / search-result badges.~~ ✅ shipped in v0.2
- **Publish to the Chrome Web Store** so users can install in one click instead
  of loading unpacked. One-time ~$5 developer registration + a review
  submission; needs store icons and listing copy. (Deferred — revisit later.)
- Sync the user's "For you" preference profile from the web app.
- Firefox packaging (MV3-compatible).
- Store icons + polished styling.
