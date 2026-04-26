import { handleRouteError, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/server/auth";
import { getSummaryReport } from "@/lib/server/workouts";

export async function GET() {
  try {
    const user = await requireUser();
    const report = await getSummaryReport(user.id);
    return jsonOk(report);
  } catch (error) {
    return handleRouteError(error);
  }
}
