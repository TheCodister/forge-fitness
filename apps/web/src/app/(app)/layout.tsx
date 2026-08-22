"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !data.user) {
      router.replace("/login");
    }
  }, [isLoading, data.user, router]);

  if (isLoading || !data.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-500">
        Loading…
      </div>
    );
  }

  return <AppShell user={data.user}>{children}</AppShell>;
}
