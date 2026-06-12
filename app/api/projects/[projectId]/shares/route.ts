import { NextResponse } from "next/server";

import { createMentorShare } from "@/lib/shares/service";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const share = await createMentorShare(projectId);
    return NextResponse.json({ share });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "공유 링크 생성에 실패했습니다." }, { status: 500 });
  }
}
