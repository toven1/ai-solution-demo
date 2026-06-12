import { NextResponse } from "next/server";
import { generateIROnePager } from "@/lib/artifacts/service";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    await generateIROnePager((await params).projectId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "IR One-Pager 생성에 실패했습니다." }, { status: 500 });
  }
}
