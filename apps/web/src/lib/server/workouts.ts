import {
  WorkoutStatus,
  type Prisma,
  type WorkoutSessionExercise,
  type WorkoutTemplateExercise,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/http";
import {
  progressQuerySchema,
  workoutSessionCreateSchema,
  workoutSessionUpdateSchema,
  workoutSessionsQuerySchema,
  workoutTemplateSchema,
  workoutTemplateUpdateSchema,
} from "@/lib/schemas/workouts";

const templateInclude = {
  exercises: {
    orderBy: { sortOrder: "asc" as const },
    include: { exercise: true },
  },
} satisfies Prisma.WorkoutTemplateInclude;

const sessionInclude = {
  template: true,
  exercises: {
    orderBy: { sortOrder: "asc" as const },
    include: { exercise: true },
  },
} satisfies Prisma.WorkoutSessionInclude;

function toSessionExerciseCreateMany(exercises: WorkoutTemplateExercise[]) {
  return exercises.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    sortOrder: exercise.sortOrder,
    plannedSets: exercise.targetSets,
    plannedReps: exercise.targetReps,
    plannedWeight: exercise.targetWeight,
    notes: exercise.notes,
  }));
}

export async function listWorkoutTemplates(userId: string) {
  return prisma.workoutTemplate.findMany({
    where: { userId },
    include: templateInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getWorkoutTemplate(userId: string, id: string) {
  const template = await prisma.workoutTemplate.findFirst({
    where: { id, userId },
    include: templateInclude,
  });

  if (!template) {
    throw new ApiError(404, "TEMPLATE_NOT_FOUND", "Workout template not found.");
  }

  return template;
}

export async function createWorkoutTemplate(userId: string, input: unknown) {
  const parsed = workoutTemplateSchema.parse(input);

  return prisma.workoutTemplate.create({
    data: {
      userId,
      name: parsed.name,
      description: parsed.description ?? null,
      isArchived: parsed.isArchived ?? false,
      exercises: {
        create: parsed.exercises.map((exercise) => ({
          ...exercise,
          restSeconds: exercise.restSeconds ?? null,
          notes: exercise.notes ?? null,
        })),
      },
    },
    include: templateInclude,
  });
}

export async function updateWorkoutTemplate(userId: string, id: string, input: unknown) {
  const parsed = workoutTemplateUpdateSchema.parse(input);
  await getWorkoutTemplate(userId, id);

  if (parsed.exercises) {
    await prisma.workoutTemplateExercise.deleteMany({
      where: { templateId: id },
    });
  }

  return prisma.workoutTemplate.update({
    where: { id },
    data: {
      name: parsed.name,
      description: parsed.description ?? undefined,
      isArchived: parsed.isArchived,
      exercises: parsed.exercises
        ? {
            create: parsed.exercises.map((exercise) => ({
              ...exercise,
              restSeconds: exercise.restSeconds ?? null,
              notes: exercise.notes ?? null,
            })),
          }
        : undefined,
    },
    include: templateInclude,
  });
}

export async function deleteWorkoutTemplate(userId: string, id: string) {
  await getWorkoutTemplate(userId, id);
  await prisma.workoutTemplate.delete({ where: { id } });
}

export async function listWorkoutSessions(userId: string, query: unknown) {
  const parsed = workoutSessionsQuerySchema.parse(query);

  return prisma.workoutSession.findMany({
    where: {
      userId,
      status: parsed.status,
      scheduledAt: {
        gte: parsed.from ? new Date(parsed.from) : undefined,
        lte: parsed.to ? new Date(parsed.to) : undefined,
      },
    },
    include: sessionInclude,
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getWorkoutSession(userId: string, id: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id, userId },
    include: sessionInclude,
  });

  if (!session) {
    throw new ApiError(404, "SESSION_NOT_FOUND", "Workout session not found.");
  }

  return session;
}

export async function createWorkoutSession(userId: string, input: unknown) {
  const parsed = workoutSessionCreateSchema.parse(input);

  if (parsed.templateId) {
    const template = await prisma.workoutTemplate.findFirst({
      where: { id: parsed.templateId, userId },
      include: { exercises: true },
    });

    if (!template) {
      throw new ApiError(404, "TEMPLATE_NOT_FOUND", "Workout template not found.");
    }

    return prisma.workoutSession.create({
      data: {
        userId,
        templateId: template.id,
        name: parsed.name,
        comments: parsed.comments ?? null,
        scheduledAt: new Date(parsed.scheduledAt),
        exercises: {
          create: toSessionExerciseCreateMany(template.exercises),
        },
      },
      include: sessionInclude,
    });
  }

  return prisma.workoutSession.create({
    data: {
      userId,
      name: parsed.name,
      comments: parsed.comments ?? null,
      scheduledAt: new Date(parsed.scheduledAt),
      exercises: {
        create: (parsed.exercises ?? []).map((exercise) => ({
          ...exercise,
          actualSets: exercise.actualSets ?? null,
          actualReps: exercise.actualReps ?? null,
          actualWeight: exercise.actualWeight ?? null,
          notes: exercise.notes ?? null,
        })),
      },
    },
    include: sessionInclude,
  });
}

function resolveSessionTimestamps(status?: WorkoutStatus) {
  const now = new Date();

  if (status === WorkoutStatus.in_progress) {
    return { startedAt: now };
  }

  if (status === WorkoutStatus.completed) {
    return { startedAt: now, completedAt: now };
  }

  if (status === WorkoutStatus.cancelled) {
    return { completedAt: null, startedAt: null };
  }

  return {};
}

export async function updateWorkoutSession(userId: string, id: string, input: unknown) {
  const parsed = workoutSessionUpdateSchema.parse(input);
  await getWorkoutSession(userId, id);

  if (parsed.exercises) {
    await prisma.workoutSessionExercise.deleteMany({
      where: { sessionId: id },
    });
  }

  return prisma.workoutSession.update({
    where: { id },
    data: {
      name: parsed.name,
      scheduledAt: parsed.scheduledAt ? new Date(parsed.scheduledAt) : undefined,
      status: parsed.status,
      comments: parsed.comments ?? undefined,
      ...resolveSessionTimestamps(parsed.status),
      exercises: parsed.exercises
        ? {
            create: parsed.exercises.map((exercise) => ({
              ...exercise,
              actualSets: exercise.actualSets ?? null,
              actualReps: exercise.actualReps ?? null,
              actualWeight: exercise.actualWeight ?? null,
              notes: exercise.notes ?? null,
            })),
          }
        : undefined,
    },
    include: sessionInclude,
  });
}

export async function deleteWorkoutSession(userId: string, id: string) {
  await getWorkoutSession(userId, id);
  await prisma.workoutSession.delete({ where: { id } });
}

export function calculateVolume(exercises: WorkoutSessionExercise[]) {
  return exercises.reduce((total, exercise) => {
    const sets = exercise.actualSets ?? exercise.plannedSets;
    const reps = exercise.actualReps ?? exercise.plannedReps;
    const weight = exercise.actualWeight ?? exercise.plannedWeight;
    return total + sets * reps * weight;
  }, 0);
}

export function calculateStreak(dates: Date[]) {
  if (!dates.length) {
    return 0;
  }

  const uniqueDays = Array.from(
    new Set(
      dates.map((date) =>
        new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())).getTime(),
      ),
    ),
  ).sort((a, b) => b - a);

  let streak = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const difference = uniqueDays[index - 1] - uniqueDays[index];
    if (difference === 24 * 60 * 60 * 1000) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export async function getSummaryReport(userId: string) {
  const completedSessions = await prisma.workoutSession.findMany({
    where: { userId, status: WorkoutStatus.completed },
    include: {
      exercises: true,
    },
    orderBy: { completedAt: "desc" },
  });

  const upcomingSessions = await prisma.workoutSession.count({
    where: {
      userId,
      status: { in: [WorkoutStatus.scheduled, WorkoutStatus.in_progress] },
      scheduledAt: { gte: new Date() },
    },
  });

  const totalVolume = completedSessions.reduce(
    (total, session) => total + calculateVolume(session.exercises),
    0,
  );

  return {
    completedSessions: completedSessions.length,
    upcomingSessions,
    totalVolume,
    currentStreak: calculateStreak(
      completedSessions
        .map((session) => session.completedAt)
        .filter((value): value is Date => Boolean(value)),
    ),
    recentSessions: completedSessions.slice(0, 5),
  };
}

export async function getProgressReport(userId: string, query: unknown) {
  const parsed = progressQuerySchema.parse(query);

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: WorkoutStatus.completed,
      completedAt: {
        gte: parsed.from ? new Date(parsed.from) : undefined,
        lte: parsed.to ? new Date(parsed.to) : undefined,
      },
      exercises: parsed.exerciseId
        ? {
            some: { exerciseId: parsed.exerciseId },
          }
        : undefined,
    },
    include: {
      exercises: {
        include: { exercise: true },
      },
    },
    orderBy: { completedAt: "asc" },
  });

  const metrics = new Map<
    string,
    {
      exerciseId: string;
      exerciseName: string;
      bestWeight: number;
      bestVolume: number;
      lastPerformedAt: Date;
      totalSessions: number;
    }
  >();

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      const volume =
        (exercise.actualSets ?? exercise.plannedSets) *
        (exercise.actualReps ?? exercise.plannedReps) *
        (exercise.actualWeight ?? exercise.plannedWeight);

      const current = metrics.get(exercise.exerciseId);

      if (!current) {
        metrics.set(exercise.exerciseId, {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exercise.name,
          bestWeight: exercise.actualWeight ?? exercise.plannedWeight,
          bestVolume: volume,
          lastPerformedAt: session.completedAt ?? session.updatedAt,
          totalSessions: 1,
        });
        continue;
      }

      current.bestWeight = Math.max(current.bestWeight, exercise.actualWeight ?? exercise.plannedWeight);
      current.bestVolume = Math.max(current.bestVolume, volume);
      current.lastPerformedAt = session.completedAt ?? session.updatedAt;
      current.totalSessions += 1;
    }
  }

  return Array.from(metrics.values()).sort(
    (left, right) => right.lastPerformedAt.getTime() - left.lastPerformedAt.getTime(),
  );
}
