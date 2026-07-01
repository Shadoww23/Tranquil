import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  if (!rateLimit(`resolve:${clientIp(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const apiKey = req.headers.get("x-steam-key") || process.env.STEAM_API_KEY;
  const vanity = req.nextUrl.searchParams.get("vanity");

  if (!apiKey || !vanity) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Steam vanity names are 1–32 chars of letters, digits, _ and -.
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(vanity)) {
    return NextResponse.json({ error: "Invalid vanity URL." }, { status: 400 });
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
