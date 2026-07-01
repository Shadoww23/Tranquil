// Best-effort in-memory rate limiter. On serverless each instance keeps its own
// counters (and they reset on cold start), so this is a first line of defence
// against a single client hammering an instance — not a distributed guarantee.
// For hard global limits, back this with Vercel KV / Upstash Redis.

type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

/** Returns true if the request is allowed, false if the limit is exceeded. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (now > b.reset) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
