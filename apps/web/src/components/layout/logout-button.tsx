"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/fetcher";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <Button
      type="button"
      variant="outline"
      className="border-white/15 bg-transparent text-white hover:bg-white/5"
      onClick={async () => {
        await apiFetch("/auth/logout", { method: "POST" });
        queryClient.setQueryData(["auth", "me"], { user: null });
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        router.replace("/login");
      }}
    >
      Log out
    </Button>
  );
}
