import type { FastifyRequest } from "fastify";

import { ApiError } from "./errors.js";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function cleanupExpired(now: number) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function assertRateLimit(
  key: string,
  opts: { maxRequests: number; windowMs: number; message: string },
) {
  const now = Date.now();
  cleanupExpired(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return;
  }

  if (existing.count >= opts.maxRequests) {
    throw new ApiError(429, "RATE_LIMITED", opts.message);
  }

  existing.count += 1;
}

function shouldTrustProxyHeaders() {
  return (
    process.env.TRUST_CLIENT_IP_HEADERS === "true" || process.env.NODE_ENV !== "production"
  );
}

export function getClientIp(request: FastifyRequest): string {
  if (!shouldTrustProxyHeaders()) return "unknown";
  const forwardedFor = request.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  const realIp = request.headers["x-real-ip"];
  if (typeof realIp === "string") return realIp.trim() || "unknown";
  return request.ip || "unknown";
}

export function resetRateLimits() {
  buckets.clear();
}
