"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useExercises } from "@/features/exercises/api/use-exercises";
import { useTemplates } from "@/features/templates/api/use-templates";
import {
  useCreateWorkoutSession,
  useUpdateWorkoutSession,
} from "@/features/workouts/api/use-workouts";
import type { WorkoutSession } from "@/types/domain";

type WorkoutFormValues = {
  templateId: string;
  name: string;
  scheduledAt: string;
  comments: string;
  status: WorkoutSession["status"];
  exercises: Array<{
    exerciseId: string;
    sortOrder: number;
    plannedSets: number;
    plannedReps: number;
    plannedWeight: number;
    actualSets?: number | null;
    actualReps?: number | null;
    actualWeight?: number | null;
    notes?: string | null;
  }>;
};

function toDateInputValue(dateValue?: string | Date | null) {
  if (!dateValue) {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16);
  }

  const date = new Date(dateValue);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export function WorkoutForm({ session }: { session?: WorkoutSession }) {
  const router = useRouter();
  const { data: templates } = useTemplates();
  const { data: exercises } = useExercises();
  const createSession = useCreateWorkoutSession();
  const updateSession = useUpdateWorkoutSession(session?.id ?? "");

  const form = useForm<WorkoutFormValues>({
    defaultValues: {
      templateId: session?.templateId ?? "",
      name: session?.name ?? "",
      scheduledAt: toDateInputValue(session?.scheduledAt),
      comments: session?.comments ?? "",
      status: session?.status ?? "scheduled",
      exercises:
        session?.exercises.map((exercise, index) => ({
          exerciseId: exercise.exerciseId,
          sortOrder: index,
          plannedSets: exercise.plannedSets,
          plannedReps: exercise.plannedReps,
          plannedWeight: exercise.plannedWeight,
          actualSets: exercise.actualSets ?? null,
          actualReps: exercise.actualReps ?? null,
          actualWeight: exercise.actualWeight ?? null,
          notes: exercise.notes ?? "",
        })) ?? [
          {
            exerciseId: "",
            sortOrder: 0,
            plannedSets: 3,
            plannedReps: 10,
            plannedWeight: 0,
            actualSets: null,
            actualReps: null,
            actualWeight: null,
            notes: "",
          },
        ],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "exercises",
  });
  const templateId = useWatch({
    control: form.control,
    name: "templateId",
  });
  const useTemplate = Boolean(templateId);

  async function onSubmit(values: WorkoutFormValues) {
    const payload = {
      name: values.name,
      scheduledAt: new Date(values.scheduledAt).toISOString(),
      comments: values.comments || null,
      status: values.status,
      templateId: values.templateId || null,
      exercises: values.templateId
        ? undefined
        : values.exercises.map((exercise, index) => ({
            ...exercise,
            sortOrder: index,
            notes: exercise.notes || null,
            actualSets: exercise.actualSets || null,
            actualReps: exercise.actualReps || null,
            actualWeight: exercise.actualWeight || null,
          })),
    };

    if (session) {
      await updateSession.mutateAsync(payload);
      toast.success("Workout updated.");
    } else {
      await createSession.mutateAsync(payload);
      toast.success("Workout scheduled.");
    }

    router.push("/workouts");
    router.refresh();
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="border-white/10 bg-zinc-950/70 text-white">
        <CardHeader>
          <CardTitle>{session ? "Edit workout session" : "Schedule a workout"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-zinc-300" htmlFor="session-name">
              Session name
            </label>
            <Input
              id="session-name"
              className="border-white/10 bg-white/5 text-white"
              {...form.register("name", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-300" htmlFor="scheduled-at">
              Scheduled time
            </label>
            <Input
              id="scheduled-at"
              type="datetime-local"
              className="border-white/10 bg-white/5 text-white"
              {...form.register("scheduledAt", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Use template</label>
            <select
              className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white"
              {...form.register("templateId")}
            >
              <option value="">Custom workout</option>
              {templates?.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Status</label>
            <select
              className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white"
              {...form.register("status")}
            >
              <option value="scheduled">scheduled</option>
              <option value="in_progress">in_progress</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm text-zinc-300" htmlFor="session-comments">
              Comments
            </label>
            <Textarea
              id="session-comments"
              className="border-white/10 bg-white/5 text-white"
              {...form.register("comments")}
            />
          </div>
        </CardContent>
      </Card>

      {!useTemplate ? (
        <Card className="border-white/10 bg-zinc-950/70 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Exercises</CardTitle>
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-transparent text-white hover:bg-white/5"
              onClick={() =>
                fieldArray.append({
                  exerciseId: "",
                  sortOrder: fieldArray.fields.length,
                  plannedSets: 3,
                  plannedReps: 10,
                  plannedWeight: 0,
                  actualSets: null,
                  actualReps: null,
                  actualWeight: null,
                  notes: "",
                })
              }
            >
              Add exercise
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fieldArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-6"
              >
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-sm text-zinc-300">Exercise</label>
                  <select
                    className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white"
                    {...form.register(`exercises.${index}.exerciseId` as const, {
                      required: true,
                    })}
                  >
                    <option value="">Select exercise</option>
                    {exercises?.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Sets</label>
                  <Input
                    type="number"
                    className="border-white/10 bg-white/5 text-white"
                    {...form.register(`exercises.${index}.plannedSets` as const, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Reps</label>
                  <Input
                    type="number"
                    className="border-white/10 bg-white/5 text-white"
                    {...form.register(`exercises.${index}.plannedReps` as const, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Weight</label>
                  <Input
                    type="number"
                    className="border-white/10 bg-white/5 text-white"
                    {...form.register(`exercises.${index}.plannedWeight` as const, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-zinc-300 hover:bg-white/5 hover:text-white"
                    onClick={() => fieldArray.remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-white/10 bg-zinc-950/70 text-white">
          <CardContent className="pt-6 text-sm text-zinc-400">
            This session will copy exercises from the selected template when it is created.
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="bg-orange-500 text-black hover:bg-orange-400">
          {session ? "Save workout" : "Schedule workout"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-white/10 bg-transparent text-white hover:bg-white/5"
          onClick={() => router.push("/workouts")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
