import { UsageEventType } from "@prisma/client";

import { getAIProvider } from "@/lib/ai/provider";
import {
  bmCanvasDraftSchema,
  irOnePagerDraftSchema,
  marketingCopyDraftSchema,
  mvpFeatureDraftsSchema,
  personaDraftsSchema,
  validationExperimentDraftsSchema
} from "@/lib/ai/schemas";
import { prisma } from "@/lib/db";

async function loadProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      industryTemplate: true,
      marketInsights: true,
      personas: true,
      bmCanvas: true,
      mvpFeatures: true,
      competitors: true,
      businessPlan: true,
      irOnePager: true,
      marketingCopy: true,
      hypotheses: true
    }
  });

  if (!project) throw new Error("PROJECT_NOT_FOUND");
  return project;
}

function toProjectInput(project: Awaited<ReturnType<typeof loadProject>>) {
  return {
    id: project.id,
    title: project.title,
    ideaSummary: project.ideaSummary,
    ideaDescription: project.ideaDescription,
    industry: project.industry,
    targetCustomer: project.targetCustomer,
    goal: project.goal,
    teamSize: project.teamSize,
    availableResources: project.availableResources,
    mainConcern: project.mainConcern
  };
}

async function usage(project: Awaited<ReturnType<typeof loadProject>>, action: string, count: number) {
  await prisma.usageLog.create({
    data: {
      userId: project.userId,
      organizationId: project.organizationId,
      projectId: project.id,
      eventType: UsageEventType.MOCK_AI,
      provider: getAIProvider().name,
      operation: action,
      status: "success",
      estimatedTokens: Math.max(300, count * 250),
      estimatedCostCents: getAIProvider().name === "openai" ? Math.max(1, count) : 0,
      creditsUsed: 0,
      metadata: { action, count }
    }
  });
}

async function updateReadiness(projectId: string) {
  const project = await loadProject(projectId);
  const score =
    20 +
    Math.min(10, project.marketInsights.length * 2) +
    Math.min(10, project.personas.length * 3) +
    (project.bmCanvas ? 10 : 0) +
    Math.min(10, project.mvpFeatures.length * 2) +
    Math.min(10, project.hypotheses.length * 3) +
    Math.min(10, project.businessPlan.filter((section) => section.userContent || section.aiDraft).length) +
    (project.irOnePager ? 10 : 0) +
    (project.marketingCopy.length > 0 ? 10 : 0);
  await prisma.project.update({
    where: { id: projectId },
    data: {
      readinessScore: Math.min(100, score),
      progress: Math.min(100, Math.round(score * 0.9))
    }
  });
}

export async function generatePersonas(projectId: string) {
  const project = await loadProject(projectId);
  const raw = await getAIProvider().generatePersonas(toProjectInput(project), project.marketInsights, project.industryTemplate);
  const personas = personaDraftsSchema.parse(raw);

  await prisma.$transaction(async (tx) => {
    await tx.persona.deleteMany({ where: { projectId } });
    await tx.persona.createMany({
      data: personas.map((persona) => ({
        projectId,
        name: persona.name,
        segment: persona.segment,
        description: persona.description,
        jobsToBeDone: persona.jobsToBeDone,
        pains: persona.pains,
        gains: persona.gains,
        buyingTriggers: persona.buyingTriggers,
        objections: persona.objections,
        interviewQuestions: persona.interviewQuestions
      }))
    });
  });
  await usage(project, "generate-personas", personas.length);
  await updateReadiness(projectId);
}

export async function generateBMCanvas(projectId: string) {
  const project = await loadProject(projectId);
  const raw = await getAIProvider().generateBMCanvas(toProjectInput(project), project.personas, project.industryTemplate);
  const canvas = bmCanvasDraftSchema.parse(raw);

  await prisma.bMCanvas.upsert({
    where: { projectId },
    update: canvas,
    create: { projectId, ...canvas }
  });
  await usage(project, "generate-bm-canvas", 1);
  await updateReadiness(projectId);
}

export async function generateMVPFeatures(projectId: string) {
  const project = await loadProject(projectId);
  const raw = await getAIProvider().generateMVPFeatures(toProjectInput(project), project.bmCanvas, project.industryTemplate);
  const features = mvpFeatureDraftsSchema.parse(raw);

  await prisma.$transaction(async (tx) => {
    await tx.mVPFeature.deleteMany({ where: { projectId } });
    await tx.mVPFeature.createMany({
      data: features.map((feature, index) => ({
        projectId,
        title: feature.title,
        description: feature.description,
        reach: feature.reach,
        impact: feature.impact,
        confidence: feature.confidence,
        effort: feature.effort,
        riceScore: feature.riceScore,
        priority: feature.priority,
        moscowCategory: feature.moscowCategory,
        order: index + 1
      }))
    });
  });
  await usage(project, "generate-mvp-features", features.length);
  await updateReadiness(projectId);
}

export async function generateValidationExperiments(projectId: string) {
  const project = await loadProject(projectId);
  const mvpFeatures = project.mvpFeatures.map((feature) => ({
    title: feature.title,
    description: feature.description ?? "",
    reach: feature.reach,
    impact: feature.impact,
    confidence: feature.confidence,
    effort: feature.effort,
    riceScore: feature.riceScore,
    priority: feature.priority,
    moscowCategory: feature.moscowCategory
  }));
  const raw = await getAIProvider().generateValidationExperiments(toProjectInput(project), mvpFeatures, project.personas);
  const experiments = validationExperimentDraftsSchema.parse(raw);

  await prisma.$transaction(async (tx) => {
    await tx.validationHypothesis.deleteMany({ where: { projectId } });
    await tx.validationHypothesis.createMany({
      data: experiments.map((experiment) => ({
        projectId,
        hypothesis: experiment.hypothesis,
        method: experiment.method,
        successMetric: experiment.successMetric,
        requiredData: experiment.requiredData,
        estimatedCost: experiment.estimatedCost,
        pivotCriteria: experiment.pivotCriteria,
        timeline: experiment.timeline,
        status: "draft"
      }))
    });
  });
  await usage(project, "generate-validation-experiments", experiments.length);
  await updateReadiness(projectId);
}

export async function generateIROnePager(projectId: string) {
  const project = await loadProject(projectId);
  const raw = await getAIProvider().generateIROnePager(toProjectInput(project), {
    personasCount: project.personas.length,
    marketInsightsCount: project.marketInsights.length,
    competitorsCount: project.competitors.length,
    mvpFeaturesCount: project.mvpFeatures.length,
    experimentsCount: project.hypotheses.length,
    businessPlanCompletedCount: project.businessPlan.filter((section) => section.userContent || section.aiDraft).length
  });
  const onePager = irOnePagerDraftSchema.parse(raw);
  await prisma.iROnePager.upsert({
    where: { projectId },
    update: onePager,
    create: { projectId, ...onePager }
  });
  await usage(project, "generate-ir-one-pager", 1);
  await updateReadiness(projectId);
}

export async function generateMarketingCopy(projectId: string) {
  const project = await loadProject(projectId);
  const raw = await getAIProvider().generateMarketingCopy(toProjectInput(project), project.personas, project.industryTemplate);
  const copy = marketingCopyDraftSchema.parse(raw);

  await prisma.$transaction(async (tx) => {
    await tx.marketingCopy.deleteMany({ where: { projectId } });
    await tx.marketingCopy.create({
      data: {
        projectId,
        channel: "landing-page",
        headline: copy.landingPage.heroHeadline,
        subheadline: copy.landingPage.heroSubheadline,
        cta: copy.landingPage.cta,
        body: copy.landingPage.heroSubheadline,
        problemSection: copy.landingPage.problemSection,
        solutionSection: copy.landingPage.solutionSection,
        featureSection: copy.landingPage.featureSection,
        socialProof: copy.landingPage.socialProofPlaceholder,
        pricingCopy: copy.landingPage.pricingSectionCopy,
        faqs: copy.landingPage.faqs
      }
    });
    const channels = [
      ["meta", copy.ads.meta],
      ["google-search", copy.ads.googleSearch],
      ["instagram", copy.ads.instagram],
      ["linkedin", copy.ads.linkedIn],
      ["email-outreach", copy.ads.emailOutreach]
    ] as const;
    for (const [channel, variants] of channels) {
      await tx.marketingCopy.create({
        data: {
          projectId,
          channel,
          headline: `${channel} variants`,
          body: variants.join("\n"),
          variants
        }
      });
    }
  });
  await usage(project, "generate-marketing-copy", 6);
  await updateReadiness(projectId);
}

export { updateReadiness as refreshArtifactReadiness };
