import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-steam-key");
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
    return NextResponse.json(json.response ?? {});
  } catch {
    return NextResponse.json({ error: "Could not reach Steam. Check your network." }, { status: 502 });
  }
}
