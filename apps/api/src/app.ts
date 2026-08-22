import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import Fastify, { type FastifyInstance } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { env } from "./config.js";
import { authPlugin } from "./plugins/auth.js";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { aiConversationRoutes, aiSettingsRoutes } from "./routes/ai.js";
import { authRoutes } from "./routes/auth.js";
import { googleOAuthRoutes } from "./routes/oauth.js";
import {
  exerciseImageRoutes,
  exerciseRedirectRoutes,
  exerciseRoutes,
} from "./routes/exercises.js";
import { healthRoutes } from "./routes/health.js";
import {
  reportRoutes,
  workoutSessionRoutes,
  workoutTemplateRoutes,
} from "./routes/workouts.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(sensible);
  await app.register(cookie);
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (origin.startsWith("chrome-extension://")) return cb(null, true);
      if (env.CORS_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error("CORS: origin not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: "ff_token", signed: false },
  });
  await app.register(authPlugin);

  registerErrorHandler(app);

  await app.register(healthRoutes, { prefix: "/health" });
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(googleOAuthRoutes);
  await app.register(workoutTemplateRoutes, { prefix: "/workout-templates" });
  await app.register(workoutSessionRoutes, { prefix: "/workout-sessions" });
  await app.register(reportRoutes, { prefix: "/reports" });
  await app.register(exerciseRoutes, { prefix: "/exercises" });
  await app.register(exerciseImageRoutes, { prefix: "/exercises/image" });
  await app.register(exerciseRedirectRoutes, { prefix: "/exercise-image" });
  await app.register(aiSettingsRoutes, { prefix: "/ai/settings" });
  await app.register(aiConversationRoutes, { prefix: "/ai/conversations" });

  return app;
}
