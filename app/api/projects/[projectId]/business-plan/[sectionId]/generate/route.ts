import { NextResponse } from "next/server";

import { generateBusinessPlanDraftForSection } from "@/lib/ai/service";
import { InsufficientCreditsError, insufficientCreditsMessage, withCredits } from "@/lib/credits/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; sectionId: string }> }
) {
  const { projectId, sectionId } = await params;

  try {
    await withCredits(projectId, "generate-business-plan-section", () =>
      generateBusinessPlanDraftForSection(projectId, sectionId)
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: insufficientCreditsMessage(error) }, { status: 402 });
    }
    console.error(error);
    return NextResponse.json({ error: "문항 초안 생성에 실패했습니다." }, { status: 500 });
  }
}
