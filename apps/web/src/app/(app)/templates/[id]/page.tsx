import { TemplateDetailClient } from "./template-detail-client";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function TemplateDetailPage() {
  return <TemplateDetailClient />;
}
