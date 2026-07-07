import { AlertTriangle, BarChart3, Coins, FileText, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { AdminCreditManager } from "@/components/admin/credit-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdminUser } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { getAdminMetrics } from "@/lib/admin/metrics";
import { getCreditBalances } from "@/lib/credits/service";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getCreditUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      hasUnlimitedCredits: true
    }
  });
  const balances = await getCreditBalances(users.map((user) => user.id));
  return users.map((user) => ({
    ...user,
    balance: balances.get(user.id) ?? 0
  }));
}

function MetricCard({ title, value, description }: { title: string; value: string | number; description: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-textFaint">{title}</div>
        <div className="mt-2 text-2xl font-semibold text-text">{value}</div>
        <div className="mt-1 text-xs text-textFaint">{description}</div>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdminUser(user)) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-danger">접근 권한이 없습니다</CardTitle>
            <CardDescription>관리자 대시보드는 admin 권한 계정만 접근할 수 있습니다.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const [metrics, creditUsers] = await Promise.all([getAdminMetrics(), getCreditUsers()]);

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-text">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-textSub">FounderOS AI 운영 지표와 provider 사용 현황입니다.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="전체 사용자" value={metrics.users} description="가입 또는 seed 사용자" />
        <MetricCard title="전체 프로젝트" value={metrics.projects} description="생성된 프로젝트" />
        <MetricCard title="생성 문서" value={metrics.documents} description="GeneratedDocument 수" />
        <MetricCard title="AI 호출 성공률" value={`${metrics.aiSuccessRate}%`} description={`${metrics.aiCalls} calls`} />
        <MetricCard title="예상 토큰 비용" value={`$${(metrics.estimatedCostCents / 100).toFixed(2)}`} description={`${metrics.estimatedTokens} tokens`} />
        <MetricCard
          title="크레딧 사용량"
          value={metrics.creditsSpent.toLocaleString("ko-KR")}
          description={`지급 ${metrics.creditsGranted.toLocaleString("ko-KR")} 크레딧`}
        />
      </div>

      <AdminCreditManager users={creditUsers} />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" /> 최근 오류 로그</CardTitle>
            <CardDescription>UsageLog status=error 기준</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {metrics.recentErrors.length === 0 ? (
              <div className="rounded-md bg-surface p-3 text-sm text-textFaint">최근 오류 로그가 없습니다.</div>
            ) : (
              metrics.recentErrors.map((log) => (
                <div key={log.id} className="rounded-md border border-border p-3 text-sm">
                  <div className="font-medium text-text">{log.provider ?? "unknown"} · {log.operation ?? log.eventType}</div>
                  <div className="mt-1 text-xs text-textFaint">{new Date(log.createdAt).toLocaleString("ko-KR")}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-accentStrong" /> 최근 가입 사용자</CardTitle>
            <CardDescription>최근 생성 순</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {metrics.recentUsers.map((user) => (
              <div key={user.id} className="rounded-md border border-border p-3 text-sm">
                <div className="font-medium text-text">{user.name ?? "이름 없음"}</div>
                <div className="mt-1 text-textFaint">{user.email}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-accentStrong" /> 최근 생성 프로젝트</CardTitle>
            <CardDescription>프로젝트 생성 순</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {metrics.recentProjects.map((project) => (
              <div key={project.id} className="rounded-md border border-border p-3 text-sm">
                <div className="font-medium text-text">{project.title}</div>
                <div className="mt-1 text-textFaint">{project.industry} · {project.user.email}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5 text-accentStrong" /> CreditLedger</CardTitle>
            <CardDescription>기본 크레딧 원장 구조</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {metrics.creditLedger.length === 0 ? (
              <div className="rounded-md bg-surface p-3 text-sm text-textFaint">크레딧 거래가 아직 없습니다.</div>
            ) : (
              metrics.creditLedger.map((ledger) => (
                <div key={ledger.id} className="rounded-md border border-border p-3 text-sm">
                  <div className="font-medium text-text">{ledger.type} {ledger.amount}</div>
                  <div className="mt-1 text-textFaint">잔액 {ledger.balanceAfter} · {ledger.reason}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-accentStrong" /> 운영 메모</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-textSub">
          OpenAI API key가 없으면 MockAIProvider를 사용하고, RESEARCH_PROVIDER 또는 API key가 없으면 MockResearchProvider를 사용합니다.
        </CardContent>
      </Card>
    </main>
  );
}
