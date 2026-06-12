import { prisma } from "@/lib/db";
import { industryFallback } from "@/lib/demo";
import { ProjectCreateForm } from "@/components/project/project-create-form";

export const dynamic = "force-dynamic";

async function getIndustries() {
  try {
    const templates = await prisma.industryTemplate.findMany({
      orderBy: { industryName: "asc" },
      select: { industryName: true }
    });

    return templates.length > 0 ? templates.map((template) => template.industryName) : industryFallback;
  } catch {
    return industryFallback;
  }
}

export default async function NewProjectPage() {
  const industries = await getIndustries();

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-teal-800">New Project</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">창업 아이디어 등록</h1>
        <p className="mt-2 text-sm text-slate-600">
          업종 템플릿과 기본 정보를 저장하고 FounderOS AI 워크스페이스로 연결합니다.
        </p>
      </div>
      <ProjectCreateForm industries={industries} />
    </main>
  );
}
