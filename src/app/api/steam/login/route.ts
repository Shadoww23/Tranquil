import { NextRequest, NextResponse } from "next/server";
import { buildLoginUrl } from "@/lib/steamOpenId";

// Kicks off "Sign in through Steam": redirects the user to Steam's OpenID page.
// Requires a server-side STEAM_API_KEY (used later to read the library); if it's
// missing we send the user back to the manual-key flow instead of dead-ending.
export async function GET(req: NextRequest) {
  const origin = appOrigin(req);

  if (!process.env.STEAM_API_KEY) {
    return NextResponse.redirect(`${origin}/?steam_error=noserverkey`);
  }

  return NextResponse.redirect(buildLoginUrl(origin));
}

// Prefer an explicitly configured public URL (safest behind proxies), otherwise
// derive the origin from the forwarded headers Vercel/Next set.
function appOrigin(req: NextRequest): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) return `${proto}://${host}`;
  return req.nextUrl.origin;
}
