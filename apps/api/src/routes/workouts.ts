import {
  progressQuerySchema,
  workoutSessionCreateSchema,
  workoutSessionUpdateSchema,
  workoutSessionsQuerySchema,
  workoutTemplateSchema,
  workoutTemplateUpdateSchema,
} from "@forge/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import {
  createWorkoutSession,
  createWorkoutTemplate,
  deleteWorkoutSession,
  deleteWorkoutTemplate,
  getProgressReport,
  getSummaryReport,
  getWorkoutSession,
  getWorkoutTemplate,
  listWorkoutSessions,
  listWorkoutTemplates,
  updateWorkoutSession,
  updateWorkoutTemplate,
} from "../services/workouts.js";

const idParamsSchema = z.object({ id: z.string().min(1) });

export const workoutTemplateRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async (request) => listWorkoutTemplates(request.userId));

  app.post(
    "/",
    { schema: { body: workoutTemplateSchema } },
    async (request, reply) => {
      const template = await createWorkoutTemplate(request.userId, request.body);
      return reply.status(201).send(template);
    },
  );

  app.get(
    "/:id",
    { schema: { params: idParamsSchema } },
    async (request) => getWorkoutTemplate(request.userId, request.params.id),
  );

  app.patch(
    "/:id",
    { schema: { params: idParamsSchema, body: workoutTemplateUpdateSchema } },
    async (request) =>
      updateWorkoutTemplate(request.userId, request.params.id, request.body),
  );

  app.delete(
    "/:id",
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      await deleteWorkoutTemplate(request.userId, request.params.id);
      return reply.status(204).send();
    },
  );
};

export const workoutSessionRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get(
    "/",
    { schema: { querystring: workoutSessionsQuerySchema } },
    async (request) => listWorkoutSessions(request.userId, request.query),
  );

  app.post(
    "/",
    { schema: { body: workoutSessionCreateSchema } },
    async (request, reply) => {
      const session = await createWorkoutSession(request.userId, request.body);
      return reply.status(201).send(session);
    },
  );

  app.get(
    "/:id",
    { schema: { params: idParamsSchema } },
    async (request) => getWorkoutSession(request.userId, request.params.id),
  );

  app.patch(
    "/:id",
    { schema: { params: idParamsSchema, body: workoutSessionUpdateSchema } },
    async (request) =>
      updateWorkoutSession(request.userId, request.params.id, request.body),
  );

  app.delete(
    "/:id",
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      await deleteWorkoutSession(request.userId, request.params.id);
      return reply.status(204).send();
    },
  );
};

export const reportRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get("/summary", async (request) => getSummaryReport(request.userId));

  app.get(
    "/progress",
    { schema: { querystring: progressQuerySchema } },
    async (request) => getProgressReport(request.userId, request.query),
  );
};
