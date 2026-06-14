import Link from "next/link";
import { ArrowRight, FileText, Layers3, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f7faf8]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6">
        <nav className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="text-lg font-semibold">FounderOS AI</div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_420px]">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium text-teal-800">초기 창업자용 AI 사업화 워크스페이스</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-slate-950 md:text-6xl">
              FounderOS AI
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              창업 아이디어를 프로젝트로 만들고, 시장조사·경쟁사·페르소나·사업계획서·IR·마케팅 카피·Export·멘토 공유까지
              단계별 산출물을 생성하고 저장하는 B2B SaaS입니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/projects/new">
                  새 프로젝트 만들기 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/signup">회원가입 후 결제정보 등록</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/dashboard">데모 프로젝트 보기</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Workspace Flow</span>
              <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800">Delivery Demo</span>
            </div>
            <div className="space-y-3">
              {[
                ["프로젝트 생성", "아이디어, 고객, 목표를 구조화", Layers3],
                ["문항별 사업계획서", "14개 섹션 단위로 초안 생성과 수정 저장", FileText],
                ["공유와 Export", "Markdown/DOCX 다운로드와 멘토 공유 링크", Share2]
              ].map(([title, desc, Icon]) => (
                <div key={title as string} className="flex gap-3 rounded-md border border-slate-100 p-3">
                  <Icon className="mt-0.5 h-5 w-5 text-teal-700" />
                  <div>
                    <div className="text-sm font-medium">{title as string}</div>
                    <div className="text-sm text-slate-500">{desc as string}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
