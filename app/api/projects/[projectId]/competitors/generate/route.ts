import { NextResponse } from "next/server";

import { InsufficientCreditsError, insufficientCreditsMessage, withCredits } from "@/lib/credits/service";
import { generateCompetitorMatrix } from "@/lib/research/service";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  try {
    await withCredits(projectId, "generate-competitor-matrix", () => generateCompetitorMatrix(projectId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: insufficientCreditsMessage(error) }, { status: 402 });
    }
    console.error(error);
    return NextResponse.json({ error: "경쟁사 분석 생성에 실패했습니다." }, { status: 500 });
  }
}
