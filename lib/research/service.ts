import { UsageEventType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getResearchProvider } from "@/lib/research/provider";
import type { CompetitorBundle, ResearchBundle, ResearchSourceInput } from "@/lib/research/types";

async function loadProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      userId: true,
      organizationId: true,
      title: true,
      ideaSummary: true,
      industry: true,
      targetCustomer: true,
      goal: true
    }
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  return project;
}

function buildQuery(project: Awaited<ReturnType<typeof loadProject>>) {
  return `${project.industry} ${project.targetCustomer} ${project.ideaSummary}`;
}

async function upsertSources(
  projectId: string,
  sources: ResearchSourceInput[]
): Promise<Map<string, { id: string; title: string; url: string }>> {
  const sourceMap = new Map<string, { id: string; title: string; url: string }>();

  for (const source of sources) {
    const saved = await prisma.researchSource.upsert({
      where: {
        id: `${projectId}:${source.url}`
      },
      update: {
        title: source.title,
        publisher: source.publisher,
        notes: source.isDemo ? `데모 출처 · ${source.notes ?? ""}`.trim() : source.notes
      },
      create: {
        id: `${projectId}:${source.url}`,
        projectId,
        title: source.title,
        url: source.url,
        publisher: source.publisher,
        publishedAt: source.publishedAt ? new Date(source.publishedAt) : undefined,
        notes: source.isDemo ? `데모 출처 · ${source.notes ?? ""}`.trim() : source.notes
      }
    });

    sourceMap.set(source.url, { id: saved.id, title: saved.title, url: saved.url });
  }

  return sourceMap;
}

async function saveUsage(project: Awaited<ReturnType<typeof loadProject>>, action: string, count: number) {
  await prisma.usageLog.create({
    data: {
      userId: project.userId,
      organizationId: project.organizationId,
      projectId: project.id,
      eventType: UsageEventType.MOCK_RESEARCH,
      provider: getResearchProvider().name,
      operation: action,
      status: "success",
      estimatedTokens: count * 120,
      estimatedCostCents: getResearchProvider().name === "mock-research" ? 0 : Math.max(1, count),
      creditsUsed: 0,
      metadata: { action, count }
    }
  });
}

async function persistResearchBundle(project: Awaited<ReturnType<typeof loadProject>>, bundle: ResearchBundle) {
  const sourceMap = await upsertSources(project.id, bundle.sources);

  await prisma.marketInsight.deleteMany({
    where: { projectId: project.id }
  });

  for (const insight of bundle.insights) {
    const evidenceSourceIds = insight.sourceUrls
      .map((url) => sourceMap.get(url)?.id)
      .filter((id): id is string => Boolean(id));

    const saved = await prisma.marketInsight.create({
      data: {
        projectId: project.id,
        category: insight.category,
        title: insight.title,
        content: insight.content,
        confidenceLevel: insight.confidenceLevel,
        evidenceSourceIds,
        isAssumption: insight.isAssumption || evidenceSourceIds.length === 0,
        isAiAssumed: insight.isAssumption || evidenceSourceIds.length === 0
      }
    });

    if (evidenceSourceIds.length > 0) {
      await prisma.marketInsight.update({
        where: { id: saved.id },
        data: {
          sources: {
            connect: evidenceSourceIds.map((id) => ({ id }))
          }
        }
      });
    }
  }

  await saveUsage(project, "generate-market-research", bundle.insights.length);
}

async function persistCompetitorBundle(project: Awaited<ReturnType<typeof loadProject>>, bundle: CompetitorBundle) {
  const sourceMap = await upsertSources(project.id, bundle.sources);

  await prisma.competitor.deleteMany({
    where: { projectId: project.id }
  });

  for (const competitor of bundle.competitors) {
    const sourceIds = competitor.sourceUrls
      .map((url) => sourceMap.get(url)?.id)
      .filter((id): id is string => Boolean(id));

    await prisma.competitor.create({
      data: {
        projectId: project.id,
        name: competitor.name,
        url: competitor.website,
        targetCustomer: competitor.targetCustomer,
        coreFeatures: competitor.coreFeatures,
        pricing: competitor.pricing,
        positioning: competitor.targetCustomer,
        strengths: competitor.strengths,
        weaknesses: competitor.weaknesses,
        differentiation: competitor.differentiation,
        sourceUrl: competitor.sourceUrls[0],
        sourceTitle: competitor.sourceUrls[0] ? sourceMap.get(competitor.sourceUrls[0])?.title : undefined,
        sourceIds
      }
    });
  }

  await saveUsage(project, "generate-competitor-matrix", bundle.competitors.length);
}

export async function generateMarketResearch(projectId: string) {
  const project = await loadProject(projectId);
  const provider = getResearchProvider();
  const query = buildQuery(project);
  const [market, trends, problems] = await Promise.all([
    provider.searchMarket(query),
    provider.searchTrends(query),
    provider.searchCustomerProblems(query)
  ]);

  const merged: ResearchBundle = {
    sources: [...market.sources, ...trends.sources, ...problems.sources].filter(
      (source, index, all) => all.findIndex((candidate) => candidate.url === source.url) === index
    ),
    insights: [...market.insights, ...trends.insights, ...problems.insights].filter(
      (insight, index, all) => all.findIndex((candidate) => candidate.category === insight.category && candidate.title === insight.title) === index
    )
  };

  await persistResearchBundle(project, merged);
  return merged;
}

export async function generateCompetitorMatrix(projectId: string) {
  const project = await loadProject(projectId);
  const provider = getResearchProvider();
  const bundle = await provider.searchCompetitors(buildQuery(project));
  await persistCompetitorBundle(project, bundle);
  return bundle;
}
