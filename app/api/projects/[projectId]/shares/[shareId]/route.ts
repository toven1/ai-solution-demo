import { NextResponse } from "next/server";
import { z } from "zod";

import { setMentorShareActive } from "@/lib/shares/service";

const schema = z.object({
  active: z.boolean()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string; shareId: string }> }) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "입력값을 확인해주세요." }, { status: 400 });

  try {
    const { projectId, shareId } = await params;
    const share = await setMentorShareActive(shareId, projectId, parsed.data.active);
    return NextResponse.json({ share });
  } catch (error) {
    if (error instanceof Error && error.message === "SHARE_NOT_FOUND") {
      return NextResponse.json({ error: "해당 프로젝트의 공유 링크를 찾을 수 없습니다." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "공유 링크 상태 변경에 실패했습니다." }, { status: 500 });
  }
}
