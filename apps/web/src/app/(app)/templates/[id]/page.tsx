"use client";

import { PageHeader } from "@/components/shared/page-header";

// TODO(task-8): fetch template client-side via React Query and render
// <TemplateForm template={template} />. Stubbed while the auth swap lands.
export default function TemplateDetailPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Template" description="Loading…" />
    </div>
  );
}
