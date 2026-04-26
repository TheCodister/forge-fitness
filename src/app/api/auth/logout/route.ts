import { handleRouteError } from "@/lib/http";
import { logoutUser } from "@/lib/server/auth";

export async function POST() {
  try {
    await logoutUser();
    return new Response(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
