"use client";

import { useState } from "react";
import type { Game } from "@/lib/types";

// Steam serves each game's header art at a predictable CDN path keyed by appid,
// so we can show real covers without any extra API call.
export function steamHeaderUrl(appid: number): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
}

type CoverGame = Pick<Game, "coverColor" | "steamAppId" | "coverImage" | "title">;

interface Props {
  game: CoverGame;
  /** Sizing / rounding classes, applied to both the image and the colour fallback. */
  className?: string;
}

/**
 * Shows a game's cover art (from Steam's CDN when we have an appid), falling back
 * to the coloured placeholder square if there's no image or it fails to load.
 */
export default function GameCover({ game, className = "" }: Props) {
  const url = game.coverImage ?? (game.steamAppId ? steamHeaderUrl(game.steamAppId) : null);
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return <div className={`${game.coverColor} ${className}`} aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      aria-hidden
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover bg-stone-200 dark:bg-stone-700 ${className}`}
    />
  );
}
