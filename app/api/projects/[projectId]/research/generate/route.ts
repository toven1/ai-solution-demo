import { NextResponse } from "next/server";

import { InsufficientCreditsError, insufficientCreditsMessage, withCredits } from "@/lib/credits/service";
import { generateMarketResearch } from "@/lib/research/service";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  try {
    await withCredits(projectId, "generate-market-research", () => generateMarketResearch(projectId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: insufficientCreditsMessage(error) }, { status: 402 });
    }
    console.error(error);
    return NextResponse.json({ error: "시장조사 생성에 실패했습니다." }, { status: 500 });
  }
}
