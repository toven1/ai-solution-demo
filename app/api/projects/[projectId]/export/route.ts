import { NextResponse } from "next/server";
import { z } from "zod";

import { createExportPackage, createPdfExportPackage } from "@/lib/export/package";

const schema = z.object({
  format: z.enum(["markdown", "docx", "pdf"])
});

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "export 형식을 확인해주세요." }, { status: 400 });
  }

  if (parsed.data.format === "pdf") {
    await createPdfExportPackage().catch(() => null);
    return NextResponse.json({ error: "PDF export는 TODO 인터페이스만 준비되어 있습니다." }, { status: 501 });
  }

  try {
    const { projectId } = await params;
    const result = await createExportPackage(projectId, parsed.data.format);

    return new NextResponse(new Uint8Array(result.body), {
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(result.filename)}`,
        "X-Generated-Document-Id": result.document.id
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "문서 export 생성에 실패했습니다." }, { status: 500 });
  }
}
