import { NextResponse } from "next/server";

import { generateFollowupQuestionsForProject, refreshProjectReadiness } from "@/lib/ai/service";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  try {
    await generateFollowupQuestionsForProject(projectId);
    await refreshProjectReadiness(projectId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "추가 질문 생성에 실패했습니다." }, { status: 500 });
  }
}
