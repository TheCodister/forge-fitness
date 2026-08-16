"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooks/use-current-user";

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && data?.user) router.replace("/dashboard");
  }, [data?.user, isLoading, router]);

  if (isLoading || data?.user) return null;
  return children;
}
