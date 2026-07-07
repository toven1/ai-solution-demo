import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileDown,
  FileText,
  Layers3,
  Network,
  Share2,
  Sparkles,
  Users
} from "lucide-react";

import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Layers3,
    title: "프로젝트 구조화",
    description: "아이디어, 목표 고객, 검증 목표를 업종 템플릿 기준으로 정리해 저장합니다."
  },
  {
    icon: BarChart3,
    title: "시장조사 리포트",
    description: "출처가 남는 시장조사와 신뢰도·AI 추정 표시로 근거를 구분합니다."
  },
  {
    icon: Network,
    title: "경쟁사 매트릭스",
    description: "타깃, 기능, 가격, 강약점, 차별화 포인트를 표로 비교합니다."
  },
  {
    icon: Users,
    title: "페르소나 · BM Canvas",
    description: "페르소나 3종과 9블록 캔버스를 생성하고 직접 수정해 저장합니다."
  },
  {
    icon: FileText,
    title: "문항별 사업계획서",
    description: "14개 고정 문항별로 AI 초안과 사용자 수정본을 나눠 관리합니다."
  },
  {
    icon: FileDown,
    title: "Export · 멘토 공유",
    description: "Markdown/DOCX 패키지 다운로드와 읽기 전용 멘토 공유 링크를 제공합니다."
  }
];

const flow = [
  ["01", "아이디어 등록", "업종 템플릿을 고르고 기본 정보를 저장합니다."],
  ["02", "AI 산출물 생성", "질문, 시장조사, 경쟁사, 사업계획서 초안을 생성합니다."],
  ["03", "수정하고 저장", "문항 단위로 초안을 다듬어 내 버전으로 저장합니다."],
  ["04", "Export와 공유", "패키지 문서를 내려받고 멘토에게 링크로 공유합니다."]
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="fixed inset-x-0 top-0 z-50 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accentSoft">
              <Sparkles className="h-4 w-4 text-accentStrong" />
            </span>
            <span className="text-base font-semibold text-text">FounderOS AI</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard">데모 보기</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">시작하기</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="pt-16">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1fr_460px] lg:pt-24">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-semibold text-accent">
              <span aria-hidden className="text-[10px]">●</span>
              초기 창업자용 AI 사업화 워크스페이스
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-text md:text-[54px] md:leading-[1.15]">
              아이디어에서 <span className="text-accent">사업계획서</span>까지,
              <br />
              하나의 워크스페이스
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-textSub">
              창업 아이디어를 프로젝트로 만들고 시장조사, 경쟁사 분석, 페르소나, 사업계획서, IR, 마케팅 카피까지
              단계별 산출물을 생성하고 수정해 저장하세요.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/projects/new">
                  새 프로젝트 만들기 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/dashboard">데모 프로젝트 보기</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-textFaint">데모 계정 제공 · PG 연동 전까지 결제 없이 사용</p>
          </div>

          <div className="relative mx-auto hidden h-[440px] w-full max-w-[460px] lg:block" aria-hidden>
            <div
              className="absolute -right-6 top-2 h-[300px] w-[300px] rounded-full"
              style={{ background: "rgba(37,99,235,0.08)" }}
            />
            <div
              className="absolute bottom-6 left-0 h-[190px] w-[190px] rounded-full"
              style={{ background: "rgba(37,99,235,0.07)" }}
            />

            <div className="absolute left-0 top-6 w-[290px] -rotate-2">
              <div className="animate-float-a rounded-xl bg-white p-5 shadow-mock">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text">시장조사 리포트</span>
                  <span className="rounded-md bg-accentSoft px-2 py-1 text-xs font-medium text-accentStrong">
                    출처 6
                  </span>
                </div>
                <div className="mt-4 grid gap-2.5">
                  <div className="h-2.5 w-full rounded-sm bg-surfaceStrong" />
                  <div className="h-2.5 w-4/5 rounded-sm bg-surface" />
                  <div className="h-2.5 w-3/5 rounded-sm bg-surface" />
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="rounded-md bg-surface px-2 py-1 text-xs font-medium text-success">높은 신뢰</span>
                  <span className="rounded-md bg-surface px-2 py-1 text-xs font-medium text-textSub">AI 추정</span>
                </div>
              </div>
            </div>

            <div className="absolute right-0 top-[150px] w-[280px] rotate-2">
              <div className="animate-float-b rounded-xl bg-white p-5 shadow-mock">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text">사업계획서</span>
                  <span className="text-xs font-medium text-textFaint">9/14 문항</span>
                </div>
                <div className="mt-4 h-2 w-full rounded-sm bg-surfaceStrong">
                  <div className="h-full w-2/3 rounded-sm bg-accent" />
                </div>
                <div className="mt-4 grid gap-2">
                  <div className="flex items-center gap-2 text-xs text-textSub">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 문제 정의 · 저장됨
                  </div>
                  <div className="flex items-center gap-2 text-xs text-textSub">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 시장 규모 · 저장됨
                  </div>
                  <div className="flex items-center gap-2 text-xs text-textFaint">
                    <span className="h-1.5 w-1.5 rounded-full bg-surfaceStrong" /> 수익 모델 · 초안
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-10 w-[270px] -rotate-1">
              <div className="animate-float-c rounded-xl bg-white p-5 shadow-mock">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text">Export · 공유</span>
                  <Share2 className="h-4 w-4 text-accentStrong" />
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="rounded-md bg-accentSoft px-2 py-1 text-xs font-medium text-accentStrong">DOCX</span>
                  <span className="rounded-md bg-accentSoft px-2 py-1 text-xs font-medium text-accentStrong">Markdown</span>
                  <span className="rounded-md bg-surface px-2 py-1 text-xs font-medium text-textSub">멘토 링크</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-textSub">전체 산출물을 패키지 문서로 내려받고 멘토 코멘트를 받으세요.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-bgSoft py-20">
          <div className="mx-auto w-full max-w-6xl px-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-accent">
              <span aria-hidden className="text-[10px]">●</span>
              기능
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-text">사업화에 필요한 산출물을 한 곳에서</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-textSub">
              단계별 메뉴를 따라가면 검증에 필요한 문서가 순서대로 쌓입니다. 모든 산출물은 수정하고 저장할 수 있습니다.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-lg border border-cardBorder bg-card p-6 shadow-card">
                  <span className="flex h-[42px] w-[42px] items-center justify-center rounded-md bg-accentSoft">
                    <Icon className="h-5 w-5 text-accentStrong" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-text">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-textSub">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto w-full max-w-6xl px-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-accent">
              <span aria-hidden className="text-[10px]">●</span>
              진행 방식
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-text">네 단계로 끝나는 검증 준비</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {flow.map(([step, title, description]) => (
                <div key={step} className="rounded-lg border border-cardBorder bg-card p-6 shadow-card">
                  <div className="text-sm font-semibold text-accent">{step}</div>
                  <h3 className="mt-3 text-base font-semibold text-text">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-textSub">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-bgSoft py-20">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-text">지금 아이디어를 등록해 보세요</h2>
              <p className="mt-3 text-base leading-7 text-textSub">
                seed 데모 프로젝트로 전체 흐름을 먼저 살펴볼 수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/projects/new">
                  새 프로젝트 만들기 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/signup">회원가입</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-bg">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-textFaint md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-textSub">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-accentSoft">
              <Sparkles className="h-3.5 w-3.5 text-accentStrong" />
            </span>
            <span className="font-medium">FounderOS AI</span>
          </div>
          <p>초기 창업자를 위한 AI 사업화 워크스페이스 데모</p>
        </div>
      </footer>
    </div>
  );
}
