import type { FastifyPluginAsync } from "fastify";

import { requireUser } from "../auth";
import type { StringQuery } from "../types";
import { getProgressReport, getSummaryReport } from "../domain/workouts";

export const reportRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/reports/summary", async (request) => {
    const user = await requireUser(request);
    return getSummaryReport(user.id);
  });

  app.get<{ Querystring: StringQuery }>("/api/reports/progress", async (request) => {
    const user = await requireUser(request);
    return getProgressReport(user.id, request.query);
  });
};
