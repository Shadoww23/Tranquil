"use client";

import { useState } from "react";
import type { Game } from "@/lib/types";

// The wide header capsule (460×215) — the game's banner with its logo, meant to
// be shown in a landscape thumbnail. Near-universally available.
export function steamCoverUrls(appid: number): string[] {
  return [`https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`];
}

type CoverGame = Pick<Game, "coverColor" | "steamAppId" | "coverImage" | "title">;

interface Props {
  game: CoverGame;
  /** Sizing / rounding classes, applied to both the image and the colour fallback. */
  className?: string;
}

/**
 * Shows a game's cover art (from Steam's CDN when we have an appid), trying
 * portrait box art first, then the wide header, then falling back to the
 * coloured placeholder square if nothing loads.
 */
export default function GameCover({ game, className = "" }: Props) {
  const urls = game.coverImage
    ? [game.coverImage]
    : game.steamAppId
      ? steamCoverUrls(game.steamAppId)
      : [];
  const [idx, setIdx] = useState(0);

  if (urls.length === 0 || idx >= urls.length) {
    // No cover art available (obscure/delisted game, or no appid): show an
    // intentional monogram on the coloured square rather than a blank block.
    // The SVG scales the letter to whatever size the container is.
    const letter = game.title.trim().charAt(0).toUpperCase() || "?";
    return (
      <div className={`${game.coverColor} ${className} flex items-center justify-center overflow-hidden`} aria-hidden>
        <svg viewBox="0 0 24 24" className="w-3/5 h-3/5">
          <text x="12" y="13" textAnchor="middle" dominantBaseline="central" fontSize="17" fontWeight="700" fill="rgba(255,255,255,0.9)">
            {letter}
          </text>
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={urls[idx]}
      alt=""
      aria-hidden
      loading="lazy"
      onError={() => setIdx((i) => i + 1)}
      // object-contain guarantees the whole banner (logo + art) is always in
      // frame — never cropped. The subtle bg fills any letterbox space and
      // blends with the card behind it.
      className={`object-contain bg-stone-100 dark:bg-stone-800 ${className}`}
    />
  );
}
