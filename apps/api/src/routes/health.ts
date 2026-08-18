import type { FastifyInstance } from "fastify";
import { z } from "zod";

export async function healthRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      schema: {
        response: {
          200: z.object({ status: z.literal("ok"), uptime: z.number() }),
        },
      },
    },
    async () => ({ status: "ok" as const, uptime: process.uptime() }),
  );
}
