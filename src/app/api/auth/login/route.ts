import { loginUser } from "@/lib/server/auth";
import { assertRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { handleRouteError, jsonOk, parseJsonBody } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    assertRateLimit(`auth:login:${clientIp}`, {
      maxRequests: 10,
      windowMs: 5 * 60 * 1000,
      message: "Too many login attempts. Please try again shortly.",
    });

    const body = await parseJsonBody(request, 4 * 1024);
    const user = await loginUser(body);
    return jsonOk(user, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
