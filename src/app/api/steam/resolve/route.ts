import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-steam-key") || process.env.STEAM_API_KEY;
  const vanity = req.nextUrl.searchParams.get("vanity");

  if (!apiKey || !vanity) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const url = new URL("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("vanityurl", vanity);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const json = await res.json();
    return NextResponse.json(json.response ?? {});
  } catch {
    return NextResponse.json({ error: "Could not reach Steam." }, { status: 502 });
  }
}
