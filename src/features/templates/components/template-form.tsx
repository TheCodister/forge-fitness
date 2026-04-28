"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExercisePickerDialog } from "@/features/exercises/components/exercise-picker-dialog";
import { ExerciseDetailDialog } from "@/features/exercises/components/exercise-detail-dialog";
import { useExercise } from "@/features/exercises/api/use-exercises";
import { useCreateTemplate, useUpdateTemplate } from "@/features/templates/api/use-templates";
import type { Exercise, WorkoutTemplate } from "@/types/domain";

type TemplateFormValues = {
  name: string;
  description: string;
  exercises: Array<{
    exerciseId: string;
    exerciseName: string;
    exerciseGifUrl: string | null;
    sortOrder: number;
    targetSets: number;
    targetReps: number;
    targetWeight: number;
    restSeconds?: number | null;
    notes?: string | null;
  }>;
};

function ExercisePreviewRow({
  exerciseId,
  onView,
}: {
  exerciseId: string;
  onView: (exercise: Exercise) => void;
}) {
  const { data: exercise } = useExercise(exerciseId);
  if (!exercise?.gifUrl) return null;
  return (
    <button
      type="button"
      onClick={() => onView(exercise)}
      className="flex shrink-0 items-center gap-1 text-xs text-orange-400 hover:text-orange-300"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={exercise.gifUrl} alt="" className="h-8 w-8 rounded object-cover" loading="lazy" />
      <span>View</span>
    </button>
  );
}

export function TemplateForm({ template }: { template?: WorkoutTemplate }) {
  const router = useRouter();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate(template?.id ?? "");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);

  const form = useForm<TemplateFormValues>({
    defaultValues: {
      name: template?.name ?? "",
      description: template?.description ?? "",
      exercises:
        template?.exercises.map((exercise, index) => ({
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exercise?.name ?? "",
          exerciseGifUrl: exercise.exercise?.gifUrl ?? null,
          sortOrder: index,
          targetSets: exercise.targetSets,
          targetReps: exercise.targetReps,
          targetWeight: exercise.targetWeight,
          restSeconds: exercise.restSeconds ?? null,
          notes: exercise.notes ?? "",
        })) ?? [
          {
            exerciseId: "",
            exerciseName: "",
            exerciseGifUrl: null,
            sortOrder: 0,
            targetSets: 4,
            targetReps: 8,
            targetWeight: 0,
            restSeconds: 90,
            notes: "",
          },
        ],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  function openPicker(index: number) {
    setPickerIndex(index);
    setPickerOpen(true);
  }

  function handleExerciseSelected(exercise: Exercise) {
    if (pickerIndex === null) return;
    form.setValue(`exercises.${pickerIndex}.exerciseId`, exercise.id);
    form.setValue(`exercises.${pickerIndex}.exerciseName`, exercise.name);
    form.setValue(`exercises.${pickerIndex}.exerciseGifUrl`, exercise.gifUrl);
  }

  async function onSubmit(values: TemplateFormValues) {
    const payload = {
      name: values.name,
      description: values.description || null,
      exercises: values.exercises.map((exercise, index) => ({
        exerciseId: exercise.exerciseId,
        sortOrder: index,
        targetSets: exercise.targetSets,
        targetReps: exercise.targetReps,
        targetWeight: exercise.targetWeight,
        notes: exercise.notes || null,
        restSeconds: exercise.restSeconds || null,
      })),
    };

    if (template) {
      await updateTemplate.mutateAsync(payload);
      toast.success("Template updated.");
    } else {
      await createTemplate.mutateAsync(payload);
      toast.success("Template created.");
    }

    router.push("/templates");
    router.refresh();
  }

  return (
    <>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="border-white/10 bg-zinc-950/70 text-white">
          <CardHeader>
            <CardTitle>{template ? "Edit template" : "New template"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="template-name" className="text-sm text-zinc-300">
                  Template name
                </label>
                <Input
                  id="template-name"
                  className="border-white/10 bg-white/5 text-white"
                  {...form.register("name", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="template-description" className="text-sm text-zinc-300">
                  Description
                </label>
                <Textarea
                  id="template-description"
                  className="border-white/10 bg-white/5 text-white"
                  {...form.register("description")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
                  exerciseName: "",
                  exerciseGifUrl: null,
                  sortOrder: fieldArray.fields.length,
                  targetSets: 3,
                  targetReps: 10,
                  targetWeight: 0,
                  restSeconds: 60,
                  notes: "",
                })
              }
            >
              Add exercise
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fieldArray.fields.map((field, index) => {
              const exerciseName = form.watch(`exercises.${index}.exerciseName`);
              const exerciseGifUrl = form.watch(`exercises.${index}.exerciseGifUrl`);
              const exerciseId = form.watch(`exercises.${index}.exerciseId`);

              return (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 lg:grid-cols-6"
                >
                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-sm text-zinc-300">Exercise</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openPicker(index)}
                        className="flex h-10 flex-1 items-center rounded-md border border-white/10 bg-black px-3 text-left text-sm text-white transition hover:border-orange-400/40 hover:bg-orange-500/5"
                      >
                        {exerciseName || (
                          <span className="text-zinc-500">Pick exercise...</span>
                        )}
                      </button>
                      {exerciseGifUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={exerciseGifUrl}
                          alt=""
                          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg object-cover"
                          onClick={() => exerciseId && setDetailExercise({ id: exerciseId, name: exerciseName, gifUrl: exerciseGifUrl } as Exercise)}
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-300">Sets</label>
                    <Input
                      type="number"
                      className="border-white/10 bg-white/5 text-white"
                      {...form.register(`exercises.${index}.targetSets` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-300">Reps</label>
                    <Input
                      type="number"
                      className="border-white/10 bg-white/5 text-white"
                      {...form.register(`exercises.${index}.targetReps` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-300">Weight</label>
                    <Input
                      type="number"
                      className="border-white/10 bg-white/5 text-white"
                      {...form.register(`exercises.${index}.targetWeight` as const, { valueAsNumber: true })}
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
                  <div className="space-y-2 lg:col-span-6">
                    <label className="text-sm text-zinc-300">Notes</label>
                    <Textarea
                      className="border-white/10 bg-white/5 text-white"
                      {...form.register(`exercises.${index}.notes` as const)}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" className="bg-orange-500 text-black hover:bg-orange-400">
            {template ? "Save template" : "Create template"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-transparent text-white hover:bg-white/5"
            onClick={() => router.push("/templates")}
          >
            Cancel
          </Button>
        </div>
      </form>

      <ExercisePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleExerciseSelected}
      />

      <ExerciseDetailDialog
        exercise={detailExercise}
        open={!!detailExercise}
        onOpenChange={(open) => { if (!open) setDetailExercise(null); }}
      />
    </>
  );
}
