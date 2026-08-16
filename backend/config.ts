import type { FastifyRequest } from "fastify";

const DEFAULT_FRONTEND_ORIGIN = "http://localhost:3000";

export function allowedOrigins() {
  return (process.env.FRONTEND_URL ?? DEFAULT_FRONTEND_ORIGIN)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function frontendUrl(path = "") {
  return new URL(path, allowedOrigins()[0] ?? DEFAULT_FRONTEND_ORIGIN).toString();
}

export function clientIp(request: FastifyRequest) {
  return request.ip || "unknown";
}
