// Simple in-memory rate limiter. Good enough to blunt casual abuse on a
// personal, low-volume tool. Limitation worth knowing: on serverless
// hosting (Vercel) this resets whenever a fresh instance spins up, so it
// is not a perfectly distributed limit under heavy multi-instance load.
// If this ever needs to be bulletproof, swap it for a shared store like
// Upstash Redis. For a one-person booking page, this is a reasonable
// deterrent without adding another external service.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
