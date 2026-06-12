import { notFound } from "next/navigation";

import { MentorCommentForm } from "@/components/share/mentor-comment-form";
import { getShareByToken } from "@/lib/shares/service";

export const dynamic = "force-dynamic";

function section(title: string, children: React.ReactNode) {
  return (
    <section className="grid gap-3 border-t py-6">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function list(values?: string[] | null) {
  if (!values || values.length === 0) return <p className="text-sm text-slate-500">작성된 내용이 없습니다.</p>;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
      {values.map((value, index) => (
        <li key={index}>{value}</li>
      ))}
    </ul>
  );
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const share = await getShareByToken(token);

  if (!share || share.revokedAt || (share.expiresAt && share.expiresAt < new Date())) {
    notFound();
  }

  const project = share.project;
  const landingCopy = project.marketingCopy.find((copy) => copy.channel === "landing-page");

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-5xl gap-5 px-5 py-8">
        <div className="rounded-md border bg-white p-6">
          <div className="text-sm font-medium text-teal-800">FounderOS AI Mentor Share</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">{project.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{project.ideaSummary}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-teal-50 px-2 py-1 font-medium text-teal-800">{project.industry}</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">{project.targetCustomer}</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">Readiness {project.readinessScore}%</span>
          </div>
        </div>

        <MentorCommentForm token={token} />

        <div className="rounded-md border bg-white p-6">
          {section(
            "프로젝트 개요",
            <div className="grid gap-2 text-sm text-slate-700">
              <p>목표: {project.goal}</p>
              <p>핵심 우려: {project.mainConcern}</p>
              <p>보유 자원: {project.availableResources}</p>
            </div>
          )}
          {section(
            "시장조사",
            <div className="grid gap-3">
              {project.marketInsights.map((insight) => (
                <div key={insight.id} className="rounded-md bg-slate-50 p-3 text-sm">
                  <div className="font-medium text-slate-950">{insight.title}</div>
                  <p className="mt-1 text-slate-700">{insight.content}</p>
                </div>
              ))}
            </div>
          )}
          {section("근거 출처", list(project.researchSources.map((source) => `${source.title} (${source.url})`)))}
          {section(
            "경쟁사",
            <div className="grid gap-3">
              {project.competitors.map((competitor) => (
                <div key={competitor.id} className="rounded-md bg-slate-50 p-3 text-sm">
                  <div className="font-medium text-slate-950">{competitor.name}</div>
                  <p className="mt-1 text-slate-700">{competitor.differentiation}</p>
                </div>
              ))}
            </div>
          )}
          {section("페르소나", list(project.personas.map((persona) => `${persona.name}: ${persona.description}`)))}
          {section(
            "사업계획서",
            <div className="grid gap-4">
              {project.businessPlan.map((plan) => (
                <div key={plan.id}>
                  <h3 className="font-medium text-slate-950">{plan.order}. {plan.title}</h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{plan.userContent || plan.aiDraft || "작성된 내용이 없습니다."}</p>
                </div>
              ))}
            </div>
          )}
          {section(
            "IR One-Pager",
            project.irOnePager ? (
              <div className="grid gap-2 text-sm text-slate-700">
                <p>Problem: {project.irOnePager.problem}</p>
                <p>Solution: {project.irOnePager.solution}</p>
                <p>Ask: {project.irOnePager.ask}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">IR One-Pager가 없습니다.</p>
            )
          )}
          {section(
            "마케팅 카피",
            landingCopy ? (
              <div className="text-sm text-slate-700">
                <div className="font-medium text-slate-950">{landingCopy.headline}</div>
                <p className="mt-1">{landingCopy.subheadline}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">마케팅 카피가 없습니다.</p>
            )
          )}
          {section(
            "멘토 코멘트",
            share.mentorComments.length ? (
              <div className="grid gap-3">
                {share.mentorComments.map((comment) => (
                  <div key={comment.id} className="rounded-md bg-slate-50 p-3 text-sm">
                    <div className="font-medium text-slate-950">{comment.authorName || "익명 멘토"} · {comment.sectionKey || "overall"}</div>
                    <p className="mt-1 text-slate-700">{comment.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">아직 코멘트가 없습니다.</p>
            )
          )}
        </div>
      </div>
    </main>
  );
}
