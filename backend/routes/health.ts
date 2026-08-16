import type { FastifyPluginAsync, FastifyReply } from "fastify";

import { prisma } from "../database/prisma";

async function readiness(reply: FastifyReply) {
  const startedAt = performance.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: "up",
          latencyMs: Math.round(performance.now() - startedAt),
        },
        env: { status: "up", missing: [] },
      },
    };
  } catch (error) {
    reply.log.error({ err: error }, "Readiness database check failed");
    return reply.status(503).send({
      status: "degraded",
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: "down",
          latencyMs: Math.round(performance.now() - startedAt),
        },
      },
    });
  }
}

export const healthRoutes: FastifyPluginAsync = async (app) => {
  // ECS container health check: process is alive and accepting HTTP requests.
  app.get("/api/health/live", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  // ALB target health check: the API can reach its required database.
  app.get("/api/health/ready", async (_request, reply) => readiness(reply));

  // Backward-compatible readiness endpoint.
  app.get("/api/health", async (_request, reply) => readiness(reply));
};
