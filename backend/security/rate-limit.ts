import { ApiError } from "../lib/api-error";

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
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    throw new ApiError(429, "RATE_LIMITED", message, undefined, {
      "Retry-After": String(retryAfterSeconds),
    });
  }

  existing.count += 1;
}

type HeaderSource = Headers | Record<string, string | string[] | undefined> | undefined;

function getHeader(headers: HeaderSource, name: string) {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(name);
  }

  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function shouldTrustProxyHeaders() {
  return process.env.TRUST_CLIENT_IP_HEADERS === "true" || process.env.NODE_ENV !== "production";
}

export function getClientIpFromHeaders(headers: HeaderSource) {
  if (!shouldTrustProxyHeaders()) {
    return "unknown";
  }

  const forwardedFor = getHeader(headers, "x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  const realIp = getHeader(headers, "x-real-ip");
  return realIp?.trim() || "unknown";
}

export function getClientIp(request: Request) {
  return getClientIpFromHeaders(request.headers);
}

export function resetRateLimits() {
  buckets.clear();
}
