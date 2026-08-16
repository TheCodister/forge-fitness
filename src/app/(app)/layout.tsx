import { ProtectedApp } from "@/components/auth/protected-app";

export default function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedApp>{children}</ProtectedApp>;
}
