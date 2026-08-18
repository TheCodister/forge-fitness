"use client";

import type { ApiErrorShape } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ClientApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors?: ApiErrorShape["fieldErrors"],
  ) {
    super(message);
  }
}

function resolveUrl(input: RequestInfo): RequestInfo {
  if (typeof input !== "string") return input;
  if (input.startsWith("http://") || input.startsWith("https://")) return input;
  if (!API_BASE_URL) return input;
  if (input.startsWith("/api/")) {
    return `${API_BASE_URL}${input.replace(/^\/api/, "")}`;
  }
  if (input.startsWith("/")) return `${API_BASE_URL}${input}`;
  return input;
}

export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(resolveUrl(input), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiErrorShape;
    throw new ClientApiError(
      response.status,
      error.code ?? "UNKNOWN_ERROR",
      error.message ?? "Request failed.",
      error.fieldErrors,
    );
  }

  return data as T;
}
