import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Tier 1 (Sign in through Steam) sends no key and relies on the app's own
  // server-side STEAM_API_KEY. Tier 2 (manual) supplies the user's key via header.
  const apiKey = req.headers.get("x-steam-key") || process.env.STEAM_API_KEY;
  const steamId = req.nextUrl.searchParams.get("steamid");

  if (!apiKey || !steamId) {
    return NextResponse.json({ error: "Missing API key or Steam ID" }, { status: 400 });
  }

  const url = new URL("https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("steamid", steamId);
  url.searchParams.set("include_appinfo", "true");
  url.searchParams.set("include_played_free_games", "true");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Steam API returned ${res.status}. Check your API key and Steam ID.` },
        { status: 502 }
      );
    }
    const json = await res.json();
    const response = json.response ?? {};
    // A private "Game details" profile comes back as an empty object (no
    // game_count key), which is different from a public profile that owns no
    // games. Flag it so the client can show the right guidance.
    const isPrivate = response.game_count === undefined && !response.games;
    return NextResponse.json({ ...response, private: isPrivate });
  } catch {
    return NextResponse.json({ error: "Could not reach Steam. Check your network." }, { status: 502 });
  }
}
