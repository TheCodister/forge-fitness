import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
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
};
