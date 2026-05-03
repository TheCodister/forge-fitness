import { NextRequest, NextResponse } from "next/server";
import { getExerciseImageUrl } from "@/lib/exercise-images";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.redirect(getExerciseImageUrl(id), 302);
}
