import { Prisma, UsageEventType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/provider";
import { businessPlanDraftsSchema, followUpQuestionsSchema, readinessScoreSchema } from "@/lib/ai/schemas";
import type { IndustryTemplateInput, ProjectArtifactsInput, ProjectInput } from "@/lib/ai/types";

function toProjectInput(project: {
  id: string;
  title: string;
  ideaSummary: string;
  ideaDescription: string;
  industry: string;
  targetCustomer: string;
  goal: string;
  teamSize: number;
  availableResources: string;
  mainConcern: string;
}): ProjectInput {
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

function toIndustryTemplateInput(template: IndustryTemplateInput | null): IndustryTemplateInput | null {
  return template
    ? {
        industryName: template.industryName,
        commonCustomerSegments: template.commonCustomerSegments,
        commonBusinessModels: template.commonBusinessModels,
        keyMetrics: template.keyMetrics,
        commonRisks: template.commonRisks,
        recommendedValidationMethods: template.recommendedValidationMethods,
        businessPlanWritingGuide: template.businessPlanWritingGuide,
        marketingToneGuide: template.marketingToneGuide
      }
    : null;
}

async function loadProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      industryTemplate: true,
      questions: true,
      businessPlan: true
    }
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  return project;
}

async function logUsage(project: { id: string; userId: string; organizationId: string }, metadata: Prisma.InputJsonObject) {
  await prisma.usageLog.create({
    data: {
      userId: project.userId,
      organizationId: project.organizationId,
      projectId: project.id,
      eventType: UsageEventType.MOCK_AI,
      provider: getAIProvider().name,
      operation: String(metadata.action ?? "ai"),
      status: "success",
      estimatedTokens: 500,
      estimatedCostCents: getAIProvider().name === "openai" ? 1 : 0,
      creditsUsed: 0,
      metadata
    }
  });
}

export async function generateFollowupQuestionsForProject(projectId: string) {
  const project = await loadProject(projectId);
  const provider = getAIProvider();
  const raw = await provider.generateFollowupQuestions(toProjectInput(project));
  const questions = followUpQuestionsSchema.parse(raw);

  await prisma.$transaction(async (tx) => {
    await tx.projectQuestion.deleteMany({ where: { projectId: project.id } });
    await tx.projectQuestion.createMany({
      data: questions.map((item, index) => ({
        projectId: project.id,
        question: item.question,
        answer: "",
        order: index + 1
      }))
    });
    await tx.usageLog.create({
      data: {
        userId: project.userId,
        organizationId: project.organizationId,
        projectId: project.id,
        eventType: UsageEventType.MOCK_AI,
        provider: provider.name,
        operation: "generate-followup-questions",
        status: "success",
        estimatedTokens: questions.length * 180,
        estimatedCostCents: provider.name === "openai" ? 1 : 0,
        creditsUsed: 0,
        metadata: { action: "generate-followup-questions", count: questions.length }
      }
    });
  });

  return questions;
}

export async function generateBusinessPlanDraftsForProject(projectId: string) {
  const project = await loadProject(projectId);
  const provider = getAIProvider();
  const raw = await provider.generateBusinessPlanSections(
    toProjectInput(project),
    toIndustryTemplateInput(project.industryTemplate)
  );
  const drafts = businessPlanDraftsSchema.parse(raw);

  await prisma.$transaction(async (tx) => {
    for (const draft of drafts) {
      await tx.businessPlanSection.updateMany({
        where: {
          projectId: project.id,
          sectionKey: draft.sectionKey
        },
        data: {
          title: draft.title,
          aiDraft: draft.draft,
          completenessScore: draft.completenessScore
        }
      });
    }

    await tx.usageLog.create({
      data: {
        userId: project.userId,
        organizationId: project.organizationId,
        projectId: project.id,
        eventType: UsageEventType.MOCK_AI,
        provider: provider.name,
        operation: "generate-business-plan-sections",
        status: "success",
        estimatedTokens: drafts.length * 300,
        estimatedCostCents: provider.name === "openai" ? Math.max(1, drafts.length) : 0,
        creditsUsed: 0,
        metadata: { action: "generate-business-plan-sections", count: drafts.length }
      }
    });
  });

  await refreshProjectReadiness(project.id);
  return drafts;
}

export async function generateBusinessPlanDraftForSection(projectId: string, sectionId: string) {
  const project = await loadProject(projectId);
  const section = project.businessPlan.find((item) => item.id === sectionId);

  if (!section) {
    throw new Error("SECTION_NOT_FOUND");
  }

  const provider = getAIProvider();
  const raw = await provider.generateBusinessPlanSections(
    toProjectInput(project),
    toIndustryTemplateInput(project.industryTemplate)
  );
  const drafts = businessPlanDraftsSchema.parse(raw);
  const draft = drafts.find((item) => item.sectionKey === section.sectionKey);

  if (!draft) {
    throw new Error("DRAFT_NOT_FOUND");
  }

  await prisma.businessPlanSection.update({
    where: { id: section.id },
    data: {
      aiDraft: draft.draft,
      completenessScore: draft.completenessScore
    }
  });

  await logUsage(project, { action: "generate-business-plan-section", sectionKey: section.sectionKey });
  await refreshProjectReadiness(project.id);
  return draft;
}

export async function refreshProjectReadiness(projectId: string) {
  const project = await loadProject(projectId);
  const provider = getAIProvider();
  const artifacts: ProjectArtifactsInput = {
    questionsAnswered: project.questions.filter((question) => question.answer && question.answer.trim().length > 0).length,
    businessPlanSectionsCompleted: project.businessPlan.filter(
      (section) => (section.userContent && section.userContent.trim().length > 20) || (section.aiDraft && section.aiDraft.trim().length > 40)
    ).length,
    totalBusinessPlanSections: project.businessPlan.length
  };
  const raw = await provider.scoreProjectReadiness(toProjectInput(project), artifacts);
  const score = readinessScoreSchema.parse(raw);

  await prisma.project.update({
    where: { id: project.id },
    data: {
      readinessScore: score.score,
      progress: score.progress
    }
  });

  return score;
}
