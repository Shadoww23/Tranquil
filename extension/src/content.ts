// Tranquil for Steam — content script (orchestrator).
//
// Reuses the exact scoring engine from the web app via score.ts, so a game's
// Design Risk / Joy is identical here and on the site. On a store *app* page it
// injects the full card near the title; on every store page it also pins compact
// badges onto game tiles (search, category, wishlist, "more like this").

import { scoreApp } from "./score";
import { buildCard, CARD_ID } from "./ui";
import { startBadges } from "./badges";

// Where the "Open Tranquil" link points. Update if the app is hosted elsewhere.
const SITE_URL = "https://tranquil-tq3i.vercel.app";

function appPageId(): string | null {
  const m = location.pathname.match(/\/app\/(\d+)/);
  return m ? m[1] : null;
}

// Insert the card near the top of the store page's main column.
function mountCardNode(card: HTMLElement): boolean {
  const anchors = [
    ".apphub_HomeHeaderContent",
    ".apphub_AppName",
    "#game_highlights",
    ".page_title_area",
    ".block.game_background_glow",
  ];
  for (const sel of anchors) {
    const node = document.querySelector(sel);
    if (node) {
      const target =
        sel === ".apphub_AppName"
          ? node.closest(".apphub_HeaderStandardTop") ?? node
          : node;
      target.insertAdjacentElement("afterend", card);
      return true;
    }
  }
  return false;
}

async function mountCard(appid: string): Promise<void> {
  if (document.getElementById(CARD_ID)) return;
  const scored = await scoreApp(appid);
  if (!scored) return;
  mountCardNode(buildCard(scored.risk, scored.joy, scored.rec, SITE_URL));
}

function main(): void {
  const appid = appPageId();
  if (appid) void mountCard(appid);
  // Badges apply to any store page with game tiles — including the related-games
  // capsules on an app page — so run them everywhere.
  startBadges();
}

main();
