import { NextRequest, NextResponse } from "next/server";
import { verifyCallback } from "@/lib/steamOpenId";

// Steam redirects here after sign-in. We verify the assertion, then hand the
// resolved SteamID back to the client via a query param so the existing
// localStorage-based import flow can pick it up. The app's own STEAM_API_KEY
// does the actual library read — the user never supplies a key.
export async function GET(req: NextRequest) {
  const origin = appOrigin(req);
  const steamId = await verifyCallback(req.nextUrl.searchParams);

  if (!steamId) {
    return NextResponse.redirect(`${origin}/?steam_error=auth`);
  }

  return NextResponse.redirect(`${origin}/?steam_connect=${steamId}`);
}

function appOrigin(req: NextRequest): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) return `${proto}://${host}`;
  return req.nextUrl.origin;
}
