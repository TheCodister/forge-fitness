import { signupSchema } from "@forge/shared";
import { signupUser } from "@/lib/server/auth";
import { assertRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { handleRouteError, jsonOk, parseJsonBody } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const body = await parseJsonBody(request, 4 * 1024);

    if (clientIp !== "unknown") {
      assertRateLimit(`auth:signup:ip:${clientIp}`, {
        maxRequests: 5,
        windowMs: 10 * 60 * 1000,
        message: "Too many signup attempts. Please try again shortly.",
      });
    }

    const parsed = signupSchema.safeParse(body);
    if (parsed.success) {
      assertRateLimit(`auth:signup:email:${parsed.data.email}`, {
        maxRequests: 3,
        windowMs: 60 * 60 * 1000,
        message: "Too many signup attempts for this email. Please try again later.",
      });
    }

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
