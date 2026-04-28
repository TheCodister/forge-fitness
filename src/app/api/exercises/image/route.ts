import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const exerciseId = request.nextUrl.searchParams.get("exerciseId");

  if (!exerciseId) {
    return new Response("Missing exerciseId", { status: 400 });
  }

  const apiKey = process.env.EXERCISEDB_API_KEY;
  if (!apiKey) {
    return new Response("API key not configured", { status: 500 });
  }

  const upstream = `https://exercisedb.p.rapidapi.com/image?exerciseId=${exerciseId}&resolution=180`;

  try {
    const res = await fetch(upstream, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return new Response("Image not found", { status: res.status });
    }

    const body = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/gif";

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response("Failed to fetch image", { status: 502 });
  }
}
