"use client";

import Link from "next/link";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteTemplate, useTemplates } from "@/features/templates/api/use-templates";
import { cn } from "@/lib/utils";

export function TemplateList() {
  const { data: templates } = useTemplates();
  const deleteTemplate = useDeleteTemplate();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workout Templates"
        description="Build repeatable structures for upper-body days, recovery circuits, or any custom split you want to schedule later."
        actions={
          <Link
            href="/templates/new"
            className={cn(
              buttonVariants({ className: "bg-orange-500 text-black hover:bg-orange-400" }),
            )}
          >
            New template
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {templates?.map((template) => (
          <Card key={template.id} className="border-white/10 bg-zinc-950/70 text-white">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{template.name}</CardTitle>
                <p className="mt-2 text-sm text-zinc-400">{template.description ?? "No description yet."}</p>
              </div>
              <Badge className="bg-orange-500/15 text-orange-300">
                {template.exercises.length} exercises
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {template.exercises.slice(0, 4).map((exercise) => (
                  <Badge key={`${template.id}-${exercise.sortOrder}`} variant="outline" className="border-white/10 text-zinc-300">
                    {exercise.exercise?.name ?? "Exercise"}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/templates/${template.id}`}
                  className={cn(
                    buttonVariants({ className: "bg-orange-500 text-black hover:bg-orange-400" }),
                  )}
                >
                  Edit
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 bg-transparent text-white hover:bg-white/5"
                  onClick={async () => {
                    await deleteTemplate.mutateAsync(template.id);
                    toast.success("Template deleted.");
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
