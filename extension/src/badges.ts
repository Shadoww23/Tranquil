// Browse-page badges: pins a compact Tranquil pill onto each Steam game tile
// (search results, category rows, "more like this" capsules, wishlist rows).
//
// Tiles are scored lazily as they scroll into view (IntersectionObserver) and
// the fetches are throttled + cached in score.ts, so even a long search page
// stays fast and never trips Steam's rate limiting.

import { scoreApp } from "./score";
import { buildBadge, BADGE_CLASS, BADGE_MARK } from "./ui";

// Clickable Steam capsules that represent a single *game* tile. Kept to known
// game-capsule classes on purpose: a broad "any link to /app/" match also grabs
// event/announcement cards and media links, which we don't want to badge.
const TILE_SELECTOR = [
  "a.search_result_row", // search results
  "a.tab_item", // front-page / category tabs
  "a.store_capsule", // capsule grids
  "a.dailydeal", // featured deals
  "a.wishlist_row", // wishlist rows
  "a.similar_grid_capsule", // "More like this" on app pages
].join(",");

function appidOf(tile: HTMLElement): string | null {
  // Steam capsules carry data-ds-appid (sometimes comma-separated for bundles).
  const ds = tile.getAttribute("data-ds-appid");
  if (ds) {
    const first = ds.split(",")[0].trim();
    if (/^\d+$/.test(first)) return first;
  }
  const href = tile.getAttribute("href") ?? "";
  const m = href.match(/\/app\/(\d+)/);
  return m ? m[1] : null;
}

async function badgeTile(tile: HTMLElement): Promise<void> {
  if (tile.hasAttribute(BADGE_MARK)) return;
  const appid = appidOf(tile);
  if (!appid) return;
  // Mark up-front so re-scans and re-renders don't double-process this tile.
  tile.setAttribute(BADGE_MARK, "1");

  const scored = await scoreApp(appid);
  if (!scored) return;
  if (tile.querySelector(`.${BADGE_CLASS}`)) return; // a re-render may have added one

  // The badge is absolutely positioned; ensure the tile is a positioning parent.
  if (getComputedStyle(tile).position === "static") tile.style.position = "relative";
  tile.appendChild(buildBadge(scored));
}

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const tile = entry.target as HTMLElement;
      observer.unobserve(tile);
      void badgeTile(tile);
    }
  },
  { rootMargin: "200px" } // start scoring just before a tile enters the viewport
);

function scan(): void {
  document.querySelectorAll<HTMLElement>(TILE_SELECTOR).forEach((tile) => {
    if (tile.hasAttribute(BADGE_MARK)) return;
    if (!appidOf(tile)) return;
    observer.observe(tile);
  });
}

/** Start badging tiles on the current store page, including ones added later. */
export function startBadges(): void {
  scan();

  // Steam adds tiles dynamically (infinite scroll, live search filtering,
  // React-rendered wishlist). Re-scan on DOM changes, debounced.
  let pending = 0;
  const mo = new MutationObserver(() => {
    if (pending) return;
    pending = window.setTimeout(() => {
      pending = 0;
      scan();
    }, 300);
  });
  mo.observe(document.body, { childList: true, subtree: true });
}
