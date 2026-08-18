import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { listExercises } from "./exercises";
import { createWorkoutSession, createWorkoutTemplate } from "./workouts";

export function buildTrainerTools(userId: string) {
  const searchExercises = tool(
    async (input) => {
      const results = await listExercises(input);
      return JSON.stringify(
        results.map((e) => ({
          id: e.id,
          name: e.name,
          muscleGroup: e.muscleGroup,
          category: e.category,
          equipment: e.equipment,
          description: e.description,
        })),
      );
    },
    {
      name: "search_exercises",
      description:
        "Search the exercise database by name keyword, muscle group, or category. Returns matching exercises with their IDs. Use this to find exercises before creating a workout template.",
      schema: z.object({
        search: z.string().optional().describe("Exercise name or keyword to search for"),
        muscleGroup: z
          .enum(["chest", "back", "legs", "shoulders", "arms", "core", "full_body"])
          .optional()
          .describe("Filter by muscle group"),
        category: z
          .enum(["cardio", "strength", "flexibility", "mobility", "conditioning"])
          .optional()
          .describe("Filter by exercise category"),
        limit: z.string().optional().describe("Max results, default 10"),
      }),
    },
  );

  const createTemplate = tool(
    async (input) => {
      const template = await createWorkoutTemplate(userId, input);
      return JSON.stringify({
        id: template.id,
        name: template.name,
        exerciseCount: template.exercises.length,
        message: `Workout template "${template.name}" created successfully with ${template.exercises.length} exercise(s).`,
      });
    },
    {
      name: "create_workout_template",
      description:
        "Create a workout template for the user with a list of exercises. Each exercise needs an ID from search_exercises, sets, reps, and weight targets. Call search_exercises first to get valid exercise IDs.",
      schema: z.object({
        name: z.string().min(2).max(80).describe("Name of the workout template"),
        description: z.string().max(400).optional().describe("Optional description"),
        exercises: z
          .array(
            z.object({
              exerciseId: z.string().describe("Exercise ID from search_exercises"),
              sortOrder: z.number().int().min(0).describe("Order in the workout (0-based)"),
              targetSets: z.number().int().min(1).describe("Number of sets"),
              targetReps: z.number().int().min(1).describe("Number of reps per set"),
              targetWeight: z.number().min(0).describe("Target weight in kg (0 for bodyweight)"),
              restSeconds: z
                .number()
                .int()
                .min(0)
                .optional()
                .describe("Rest between sets in seconds"),
              notes: z.string().max(300).optional().describe("Notes for this exercise"),
            }),
          )
          .min(1),
      }),
    },
  );

  const scheduleWorkout = tool(
    async (input) => {
      const session = await createWorkoutSession(userId, {
        templateId: input.templateId,
        name: input.name,
        scheduledAt: input.scheduledAt,
        comments: input.comments,
      });
      return JSON.stringify({
        id: session.id,
        name: session.name,
        scheduledAt: session.scheduledAt,
        message: `Workout "${session.name}" scheduled for ${new Date(session.scheduledAt).toLocaleDateString()}.`,
      });
    },
    {
      name: "schedule_workout",
      description:
        "Schedule a workout session from an existing template for a specific date and time.",
      schema: z.object({
        templateId: z.string().describe("ID of the workout template to use"),
        name: z.string().min(2).max(80).describe("Name for this workout session"),
        scheduledAt: z.string().describe("ISO 8601 datetime for when to schedule, e.g. 2025-01-15T10:00:00Z"),
        comments: z.string().max(400).optional().describe("Optional notes for the session"),
      }),
    },
  );

  return [searchExercises, createTemplate, scheduleWorkout];
}
