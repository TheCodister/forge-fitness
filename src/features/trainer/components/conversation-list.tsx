"use client";

import { useRouter } from "next/navigation";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConversations, useDeleteConversation } from "@/features/trainer/api/use-conversations";

export function ConversationList({ activeId }: { activeId?: string }) {
  const { data: conversations, isLoading } = useConversations();
  const deleteConversation = useDeleteConversation();
  const router = useRouter();

  function handleNew() {
    router.push("/trainer/new");
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    try {
      await deleteConversation.mutateAsync(id);
      if (activeId === id) router.push("/trainer");
    } catch {
      toast.error("Failed to delete conversation.");
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleNew}
        className="w-full bg-orange-500 text-white hover:bg-orange-600 gap-2"
      >
        <MessageSquarePlus className="h-4 w-4" />
        New Chat
      </Button>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {conversations?.length === 0 && (
        <p className="text-center text-sm text-zinc-500 py-4">No conversations yet.</p>
      )}

      <div className="space-y-1.5">
        {conversations?.map((conv) => (
          <div
            key={conv.id}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/trainer/${conv.id}`)}
            onKeyDown={(e) => e.key === "Enter" && router.push(`/trainer/${conv.id}`)}
            className={`group w-full flex cursor-pointer items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition ${
              activeId === conv.id
                ? "border-orange-500/40 bg-orange-500/10 text-white"
                : "border-white/5 bg-white/3 text-zinc-300 hover:border-white/10 hover:bg-white/5"
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {conv.title ?? "New conversation"}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={(e) => handleDelete(conv.id, e)}
              className="ml-2 shrink-0 rounded p-1 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
              aria-label="Delete conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
