"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { useCurrentUser } from "@/hooks/use-current-user";

export function ProtectedApp({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !data?.user) router.replace("/login");
  }, [data?.user, isLoading, router]);

  if (isLoading || !data?.user) {
    return <div className="grid min-h-svh place-items-center bg-black text-sm text-zinc-400">Loading your training dashboard…</div>;
  }

  return <AppShell user={data.user}>{children}</AppShell>;
}
