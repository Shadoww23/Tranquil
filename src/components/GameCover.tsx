"use client";

import { useState } from "react";
import type { Game } from "@/lib/types";

// Candidate cover images for a Steam appid, best-fitting first. The portrait
// "library" capsule is box art (2:3) that crops into a square cleanly; the wide
// header is a fallback for games that lack library art.
export function steamCoverUrls(appid: number): string[] {
  const base = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}`;
  return [`${base}/library_600x900.jpg`, `${base}/header.jpg`];
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
    return <div className={`${game.coverColor} ${className}`} aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={urls[idx]}
      alt=""
      aria-hidden
      loading="lazy"
      onError={() => setIdx((i) => i + 1)}
      className={`object-cover object-center bg-stone-200 dark:bg-stone-700 ${className}`}
    />
  );
}
