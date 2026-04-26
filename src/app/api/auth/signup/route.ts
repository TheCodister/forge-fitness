import { signupUser } from "@/lib/server/auth";
import { assertRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { handleRouteError, jsonOk, parseJsonBody } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    assertRateLimit(`auth:signup:${clientIp}`, {
      maxRequests: 5,
      windowMs: 10 * 60 * 1000,
      message: "Too many signup attempts. Please try again shortly.",
    });

    const body = await parseJsonBody(request, 4 * 1024);
    const user = await signupUser(body);
    return jsonOk(user, {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
