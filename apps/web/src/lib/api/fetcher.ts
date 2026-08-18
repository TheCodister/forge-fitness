"use client";

import type { ApiErrorShape } from "@/types/api";

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

export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
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
