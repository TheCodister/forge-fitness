import type { FastifyPluginAsync } from "fastify";

import { requireUser } from "../auth";
import type { IdParams, StringQuery } from "../types";
import {
  createWorkoutSession,
  createWorkoutTemplate,
  deleteWorkoutSession,
  deleteWorkoutTemplate,
  getWorkoutSession,
  getWorkoutTemplate,
  listWorkoutSessions,
  listWorkoutTemplates,
  updateWorkoutSession,
  updateWorkoutTemplate,
} from "@/lib/server/workouts";

export const workoutRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/workout-templates", async (request) => {
    const user = await requireUser(request);
    return listWorkoutTemplates(user.id);
  });

  app.post("/api/workout-templates", async (request, reply) => {
    const user = await requireUser(request);
    return reply.status(201).send(await createWorkoutTemplate(user.id, request.body));
  });

  app.get<{ Params: IdParams }>("/api/workout-templates/:id", async (request) => {
    const user = await requireUser(request);
    return getWorkoutTemplate(user.id, request.params.id);
  });

  app.patch<{ Params: IdParams }>("/api/workout-templates/:id", async (request) => {
    const user = await requireUser(request);
    return updateWorkoutTemplate(user.id, request.params.id, request.body);
  });

  app.delete<{ Params: IdParams }>("/api/workout-templates/:id", async (request, reply) => {
    const user = await requireUser(request);
    await deleteWorkoutTemplate(user.id, request.params.id);
    return reply.status(204).send();
  });

  app.get<{ Querystring: StringQuery }>("/api/workout-sessions", async (request) => {
    const user = await requireUser(request);
    return listWorkoutSessions(user.id, request.query);
  });

  app.post("/api/workout-sessions", async (request, reply) => {
    const user = await requireUser(request);
    return reply.status(201).send(await createWorkoutSession(user.id, request.body));
  });

  app.get<{ Params: IdParams }>("/api/workout-sessions/:id", async (request) => {
    const user = await requireUser(request);
    return getWorkoutSession(user.id, request.params.id);
  });

  app.patch<{ Params: IdParams }>("/api/workout-sessions/:id", async (request) => {
    const user = await requireUser(request);
    return updateWorkoutSession(user.id, request.params.id, request.body);
  });

  app.delete<{ Params: IdParams }>("/api/workout-sessions/:id", async (request, reply) => {
    const user = await requireUser(request);
    await deleteWorkoutSession(user.id, request.params.id);
    return reply.status(204).send();
  });
};
