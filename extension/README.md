# Tranquil for Steam (browser extension)

Overlays Tranquil's **Design Risk** and **Joy** scores onto Steam store pages, so
you can see how predatory a game's monetisation is before you buy — right on the
store page.

It reuses the **exact scoring engine** from the web app (shared source in
`../src/lib/engines`), so a game's score is identical here and on the site. On a
store app page it fetches Steam's `appdetails` (same-origin), infers the game's
mechanics, scores it, and injects a compact card near the title.

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

## Scope (v0.1)

- Runs on `store.steampowered.com/app/*` (store app pages).
- Manifest V3, no special permissions (only a same-origin fetch on the page).

## Roadmap

- Library / wishlist / search-result badges.
- Sync the user's "For you" preference profile from the web app.
- Firefox packaging (MV3-compatible).
- Store icons + polished styling.
