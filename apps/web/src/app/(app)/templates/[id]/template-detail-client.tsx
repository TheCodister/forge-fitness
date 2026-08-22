"use client";

import { useParams } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { TemplateForm } from "@/features/templates/components/template-form";
import { useTemplate } from "@/features/templates/api/use-templates";

export function TemplateDetailClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { data, isLoading, error } = useTemplate(id);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Template" description="Loading…" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-8">
        <PageHeader title="Template" description="Not found." />
      </div>
    );
  }

  return <TemplateForm template={data} />;
}
