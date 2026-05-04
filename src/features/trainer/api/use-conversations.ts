"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";

export type Conversation = {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConversationWithMessages = Conversation & {
  messages: Array<{ id: string; role: string; content: string; createdAt: string }>;
};

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiFetch<Conversation[]>("/api/ai/conversations"),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => apiFetch<ConversationWithMessages>(`/api/ai/conversations/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<Conversation>("/api/ai/conversations", { method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/ai/conversations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
