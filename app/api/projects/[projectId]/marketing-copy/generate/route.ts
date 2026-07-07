import { NextResponse } from "next/server";

import { generateMarketingCopy } from "@/lib/artifacts/service";
import { InsufficientCreditsError, insufficientCreditsMessage, withCredits } from "@/lib/credits/service";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  try {
    await withCredits(projectId, "generate-marketing-copy", () => generateMarketingCopy(projectId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: insufficientCreditsMessage(error) }, { status: 402 });
    }
    console.error(error);
    return NextResponse.json({ error: "마케팅 카피 생성에 실패했습니다." }, { status: 500 });
  }
}
