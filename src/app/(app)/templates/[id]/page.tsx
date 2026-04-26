import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { TemplateForm } from "@/features/templates/components/template-form";
import { getCurrentUser } from "@/lib/server/auth";
import { getWorkoutTemplate } from "@/lib/server/workouts";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    notFound();
  }

  const template = await getWorkoutTemplate(user.id, id).catch(() => null);

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader title={template.name} description="Adjust exercise order, targets, and notes for future scheduled sessions." />
      <TemplateForm template={template} />
    </div>
  );
}
