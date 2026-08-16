import { fastifyCookie } from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import Fastify from "fastify";

import { registerAuth } from "./auth";
import { allowedOrigins } from "./config";
import { registerErrorHandler } from "./plugins/error-handler";
import { aiRoutes } from "./routes/ai";
import { authRoutes } from "./routes/auth";
import { exerciseRoutes } from "./routes/exercises";
import { healthRoutes } from "./routes/health";
import { reportRoutes } from "./routes/reports";
import { workoutRoutes } from "./routes/workouts";
import { prisma } from "./database/prisma";

export async function buildApp() {
  const app = Fastify({
    logger: true,
    trustProxy: true,
    bodyLimit: 32 * 1024,
  });

  await app.register(fastifyCookie);
  await app.register(fastifyCors, {
    origin: allowedOrigins(),
    credentials: true,
  });
  await app.register(fastifyHelmet, { contentSecurityPolicy: false });
  await registerAuth(app);

  registerErrorHandler(app);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(exerciseRoutes);
  await app.register(workoutRoutes);
  await app.register(reportRoutes);
  await app.register(aiRoutes, { allowedOrigins: allowedOrigins() });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
