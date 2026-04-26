import { PageHeader } from "@/components/shared/page-header";
import { TemplateForm } from "@/features/templates/components/template-form";

export default function NewTemplatePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Create Template"
        description="Design a repeatable structure you can schedule again and again."
      />
      <TemplateForm />
    </div>
  );
}
