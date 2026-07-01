// Steam "Sign in through Steam" — OpenID 2.0.
// Steam is the only major platform that still uses OpenID 2.0 (no OAuth), so we
// implement the small dance by hand rather than pull in a dependency.
//
// Flow:
//   1. buildLoginUrl()  → redirect the user to Steam's login page.
//   2. Steam redirects back to `return_to` with a set of openid.* params, one of
//      which (openid.claimed_id) contains the user's 64-bit SteamID.
//   3. verifyCallback() → re-POST those params to Steam with
//      mode=check_authentication to confirm they weren't forged, then extract
//      the SteamID.

const STEAM_OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";
const OPENID_NS = "http://specs.openid.net/auth/2.0";
const IDENTIFIER_SELECT = "http://specs.openid.net/auth/2.0/identifier_select";

/**
 * Build the URL to redirect the user to for Steam sign-in.
 * @param origin  The app's own origin, e.g. "https://tranquil.vercel.app".
 */
export function buildLoginUrl(origin: string): string {
  const returnTo = `${origin}/api/steam/callback`;
  const params = new URLSearchParams({
    "openid.ns": OPENID_NS,
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": origin,
    "openid.identity": IDENTIFIER_SELECT,
    "openid.claimed_id": IDENTIFIER_SELECT,
  });
  return `${STEAM_OPENID_ENDPOINT}?${params.toString()}`;
}

const CLAIMED_ID_RE = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;

/**
 * Verify the openid.* params Steam sent back and return the SteamID64, or null
 * if verification fails or the response is malformed.
 * @param params  The query params from the callback request.
 */
export async function verifyCallback(
  params: URLSearchParams
): Promise<string | null> {
  // Basic sanity: the claimed_id must be a Steam identity URL.
  const claimedId = params.get("openid.claimed_id");
  if (!claimedId) return null;
  const match = claimedId.match(CLAIMED_ID_RE);
  if (!match) return null;
  const steamId = match[1];

  // Re-send everything Steam gave us, but ask it to authenticate the assertion.
  // This is what prevents a caller from forging a claimed_id.
  const verifyBody = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    if (key.startsWith("openid.")) verifyBody.set(key, value);
  }
  verifyBody.set("openid.mode", "check_authentication");

  try {
    const res = await fetch(STEAM_OPENID_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyBody.toString(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const text = await res.text();
    // Response is a set of key:value lines; we need is_valid:true.
    const valid = text
      .split("\n")
      .some((line) => line.trim() === "is_valid:true");
    return valid ? steamId : null;
  } catch {
    return null;
  }
}
