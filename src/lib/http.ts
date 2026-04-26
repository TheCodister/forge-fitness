import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors?: Record<string, string[] | undefined>,
  ) {
    super(message);
  }
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export async function parseJsonBody<T>(request: Request, maxBytes = 16 * 1024): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.");
  }

  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
    }
  }

  const text = await request.text();
  if (text.length > maxBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Request body is not valid JSON.");
  }
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fieldErrors: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        message: error.message,
        code: error.code,
        fieldErrors: error.fieldErrors,
      },
      { status: error.status },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      message: "Unexpected server error.",
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 },
  );
}
