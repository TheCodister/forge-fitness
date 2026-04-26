import { getCurrentUser } from "@/lib/server/auth";
import { jsonOk } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  return jsonOk(
    { user },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
