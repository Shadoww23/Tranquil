import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  // A single import fetches details for up to 150 games (5 at a time), so this
  // limit is high enough for legitimate imports but caps sustained abuse.
  if (!rateLimit(`appdetails:${clientIp(req)}`, 300, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const appid = req.nextUrl.searchParams.get("appid");
  if (!appid) {
    return NextResponse.json({ error: "Missing appid" }, { status: 400 });
  }

  // Steam appids are numeric (up to 7 digits) — reject anything else.
  if (!/^\d{1,7}$/.test(appid)) {
    return NextResponse.json({ error: "Invalid appid" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&l=en`,
      { next: { revalidate: 3600 } }
    );
    const json = await res.json();
    const entry = json[appid];
    if (!entry?.success) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }
    return NextResponse.json(entry.data);
  } catch {
    return NextResponse.json({ error: "Failed to reach Steam Store" }, { status: 502 });
  }
}
