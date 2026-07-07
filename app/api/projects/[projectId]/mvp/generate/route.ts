import { NextResponse } from "next/server";

import { generateMVPFeatures } from "@/lib/artifacts/service";
import { InsufficientCreditsError, insufficientCreditsMessage, withCredits } from "@/lib/credits/service";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  try {
    await withCredits(projectId, "generate-mvp-features", () => generateMVPFeatures(projectId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json({ error: insufficientCreditsMessage(error) }, { status: 402 });
    }
    console.error(error);
    return NextResponse.json({ error: "MVP 기능 생성에 실패했습니다." }, { status: 500 });
  }
}
