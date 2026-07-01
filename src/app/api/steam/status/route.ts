import { NextResponse } from "next/server";

// Temporary diagnostic: reports whether this deployment can see STEAM_API_KEY.
// It never returns the key itself — only whether it's present and its length,
// so we can tell a missing/misscoped env var apart from a stale deployment.
// `marker` confirms you're hitting the new build; `force-dynamic` avoids caching.
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.STEAM_API_KEY;
  return NextResponse.json({
    marker: "steam-status-v1",
    steamKeyConfigured: !!key && key.trim().length > 0,
    steamKeyLength: key ? key.length : 0,
  });
}
