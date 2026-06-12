import { z } from "zod";

export const followUpQuestionSchema = z.object({
  question: z.string().min(8),
  reason: z.string().min(8),
  answerPlaceholder: z.string().min(4)
});

export const followUpQuestionsSchema = z.array(followUpQuestionSchema).min(5).max(7);

export const businessPlanDraftSchema = z.object({
  sectionKey: z.string().min(1),
  title: z.string().min(1),
  draft: z.string().min(40),
  completenessScore: z.number().int().min(0).max(100)
});

export const businessPlanDraftsSchema = z.array(businessPlanDraftSchema).min(1);

export const readinessScoreSchema = z.object({
  score: z.number().int().min(0).max(100),
  progress: z.number().int().min(0).max(100),
  rationale: z.string().min(5)
});

export const personaDraftSchema = z.object({
  name: z.string().min(1),
  segment: z.string().min(1),
  description: z.string().min(10),
  jobsToBeDone: z.array(z.string()).min(1),
  pains: z.array(z.string()).min(1),
  gains: z.array(z.string()).min(1),
  buyingTriggers: z.array(z.string()).min(1),
  objections: z.array(z.string()).min(1),
  interviewQuestions: z.array(z.string()).min(1)
});

export const personaDraftsSchema = z.array(personaDraftSchema).length(3);

export const bmCanvasDraftSchema = z.object({
  customerSegments: z.string().min(1),
  valuePropositions: z.string().min(1),
  channels: z.string().min(1),
  customerRelationships: z.string().min(1),
  revenueStreams: z.string().min(1),
  keyResources: z.string().min(1),
  keyActivities: z.string().min(1),
  keyPartners: z.string().min(1),
  costStructure: z.string().min(1)
});

export const mvpFeatureDraftSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  reach: z.number().int().min(1),
  impact: z.number().int().min(1).max(5),
  confidence: z.number().int().min(1).max(5),
  effort: z.number().int().min(1).max(5),
  riceScore: z.number().min(0),
  priority: z.number().int().min(1),
  moscowCategory: z.string().min(1)
});

export const mvpFeatureDraftsSchema = z.array(mvpFeatureDraftSchema).min(3);

export const validationExperimentDraftSchema = z.object({
  hypothesis: z.string().min(10),
  method: z.string().min(5),
  successMetric: z.string().min(5),
  requiredData: z.string().min(3),
  estimatedCost: z.string().min(1),
  pivotCriteria: z.string().min(5),
  timeline: z.string().min(1)
});

export const validationExperimentDraftsSchema = z.array(validationExperimentDraftSchema).min(3);

export const irOnePagerDraftSchema = z.object({
  problem: z.string().min(5),
  solution: z.string().min(5),
  customer: z.string().min(5),
  market: z.string().min(5),
  product: z.string().min(5),
  businessModel: z.string().min(5),
  competition: z.string().min(5),
  goToMarket: z.string().min(5),
  validationPlan: z.string().min(5),
  team: z.string().min(5),
  ask: z.string().min(5)
});

export const marketingCopyDraftSchema = z.object({
  landingPage: z.object({
    heroHeadline: z.string().min(3),
    heroSubheadline: z.string().min(5),
    cta: z.string().min(1),
    problemSection: z.string().min(5),
    solutionSection: z.string().min(5),
    featureSection: z.string().min(5),
    socialProofPlaceholder: z.string().min(5),
    pricingSectionCopy: z.string().min(5),
    faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).length(5)
  }),
  ads: z.object({
    meta: z.array(z.string()).length(5),
    googleSearch: z.array(z.string()).length(5),
    instagram: z.array(z.string()).length(5),
    linkedIn: z.array(z.string()).length(5),
    emailOutreach: z.array(z.string()).length(5)
  })
});
