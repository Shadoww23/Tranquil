import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const appid = req.nextUrl.searchParams.get("appid");
  if (!appid) {
    return NextResponse.json({ error: "Missing appid" }, { status: 400 });
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
