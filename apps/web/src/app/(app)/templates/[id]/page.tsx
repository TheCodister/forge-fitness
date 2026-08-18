import { TemplateDetailClient } from "./template-detail-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function TemplateDetailPage() {
  return <TemplateDetailClient />;
}
