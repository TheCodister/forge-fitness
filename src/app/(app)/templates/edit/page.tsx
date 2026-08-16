"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { TemplateForm } from "@/features/templates/components/template-form";
import { useTemplate } from "@/features/templates/api/use-templates";

function TemplateEditor() {
  const id = useSearchParams().get("id") ?? "";
  const { data: template, isLoading, error } = useTemplate(id);
  if (!id) return <p className="text-zinc-400">No template was selected.</p>;
  if (isLoading) return <p className="text-zinc-400">Loading template…</p>;
  if (error || !template) return <p className="text-red-400">This template could not be loaded.</p>;
  return <div className="space-y-8"><PageHeader title={template.name} description="Adjust exercise order, targets, and notes for future scheduled sessions." /><TemplateForm template={template} /></div>;
}

export default function TemplateEditPage() {
  return <Suspense fallback={<p className="text-zinc-400">Loading template…</p>}><TemplateEditor /></Suspense>;
}
