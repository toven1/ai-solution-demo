import { prisma } from "@/lib/db";

export async function getAdminMetrics() {
  const [users, projects, documents, aiCalls, successfulAiCalls, recentErrors, recentUsers, recentProjects, creditLedger] =
    await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.generatedDocument.count(),
      prisma.usageLog.count({
        where: {
          OR: [{ eventType: "MOCK_AI" }, { provider: { in: ["openai", "mock-ai"] } }]
        }
      }),
      prisma.usageLog.count({
        where: {
          OR: [{ eventType: "MOCK_AI" }, { provider: { in: ["openai", "mock-ai"] } }],
          NOT: { status: "error" }
        }
      }),
      prisma.usageLog.findMany({
        where: { status: "error" },
        orderBy: { createdAt: "desc" },
        take: 8
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6
      }),
      prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { user: true }
      }),
      prisma.creditLedger.findMany({
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);

  const estimatedCostCents = await prisma.usageLog.aggregate({
    _sum: { estimatedCostCents: true, estimatedTokens: true }
  });

  return {
    users,
    projects,
    documents,
    aiCalls,
    aiSuccessRate: aiCalls > 0 ? Math.round((successfulAiCalls / aiCalls) * 100) : 100,
    estimatedTokens: estimatedCostCents._sum.estimatedTokens ?? 0,
    estimatedCostCents: estimatedCostCents._sum.estimatedCostCents ?? 0,
    recentErrors,
    recentUsers,
    recentProjects,
    creditLedger
  };
}
