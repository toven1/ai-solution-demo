import { AlertTriangle, BarChart3, Coins, FileText, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminMetrics } from "@/lib/admin/metrics";

export const dynamic = "force-dynamic";

function MetricCard({ title, value, description }: { title: string; value: string | number; description: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
        <div className="mt-1 text-xs text-slate-500">{description}</div>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics();

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">FounderOS AI 운영 지표와 provider 사용 현황입니다.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="전체 사용자" value={metrics.users} description="가입 또는 seed 사용자" />
        <MetricCard title="전체 프로젝트" value={metrics.projects} description="생성된 프로젝트" />
        <MetricCard title="생성 문서" value={metrics.documents} description="GeneratedDocument 수" />
        <MetricCard title="AI 호출 성공률" value={`${metrics.aiSuccessRate}%`} description={`${metrics.aiCalls} calls`} />
        <MetricCard title="예상 토큰 비용" value={`$${(metrics.estimatedCostCents / 100).toFixed(2)}`} description={`${metrics.estimatedTokens} tokens`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> 최근 오류 로그</CardTitle>
            <CardDescription>UsageLog status=error 기준</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {metrics.recentErrors.length === 0 ? (
              <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">최근 오류 로그가 없습니다.</div>
            ) : (
              metrics.recentErrors.map((log) => (
                <div key={log.id} className="rounded-md border p-3 text-sm">
                  <div className="font-medium text-slate-950">{log.provider ?? "unknown"} · {log.operation ?? log.eventType}</div>
                  <div className="mt-1 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString("ko-KR")}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> 최근 가입 사용자</CardTitle>
            <CardDescription>최근 생성 순</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {metrics.recentUsers.map((user) => (
              <div key={user.id} className="rounded-md border p-3 text-sm">
                <div className="font-medium text-slate-950">{user.name ?? "이름 없음"}</div>
                <div className="mt-1 text-slate-500">{user.email}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> 최근 생성 프로젝트</CardTitle>
            <CardDescription>프로젝트 생성 순</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {metrics.recentProjects.map((project) => (
              <div key={project.id} className="rounded-md border p-3 text-sm">
                <div className="font-medium text-slate-950">{project.title}</div>
                <div className="mt-1 text-slate-500">{project.industry} · {project.user.email}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5" /> CreditLedger</CardTitle>
            <CardDescription>기본 크레딧 원장 구조</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {metrics.creditLedger.length === 0 ? (
              <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">크레딧 거래가 아직 없습니다.</div>
            ) : (
              metrics.creditLedger.map((ledger) => (
                <div key={ledger.id} className="rounded-md border p-3 text-sm">
                  <div className="font-medium text-slate-950">{ledger.type} {ledger.amount}</div>
                  <div className="mt-1 text-slate-500">잔액 {ledger.balanceAfter} · {ledger.reason}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> 운영 메모</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-slate-600">
          OpenAI API key가 없으면 MockAIProvider를 사용하고, RESEARCH_PROVIDER 또는 API key가 없으면 MockResearchProvider를 사용합니다.
        </CardContent>
      </Card>
    </main>
  );
}
