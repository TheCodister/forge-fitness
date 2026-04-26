import { ApiError } from "@/lib/http";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getNow() {
  return Date.now();
}

function cleanupExpired(now: number) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function assertRateLimit(
  key: string,
  {
    maxRequests,
    windowMs,
    message,
  }: {
    maxRequests: number;
    windowMs: number;
    message: string;
  },
) {
  const now = getNow();
  cleanupExpired(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (existing.count >= maxRequests) {
    throw new ApiError(429, "RATE_LIMITED", message);
  }

  existing.count += 1;
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() ?? "unknown";
}
