export type ProjectInput = {
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
};

export type FollowUpQuestion = {
  question: string;
  reason: string;
  answerPlaceholder: string;
};

export interface AIProvider {
  name: string;
  generateFollowupQuestions(projectInput: ProjectInput): Promise<FollowUpQuestion[]>;
  generateBusinessPlanSections(
    project: ProjectInput,
    industryTemplate: IndustryTemplateInput | null
  ): Promise<BusinessPlanDraft[]>;
  scoreProjectReadiness(project: ProjectInput, allArtifacts: ProjectArtifactsInput): Promise<ReadinessScore>;
  generatePersonas(
    project: ProjectInput,
    marketInsights: MarketInsightInput[],
    industryTemplate: IndustryTemplateInput | null
  ): Promise<PersonaDraft[]>;
  generateBMCanvas(
    project: ProjectInput,
    personas: PersonaDraft[],
    industryTemplate: IndustryTemplateInput | null
  ): Promise<BMCanvasDraft>;
  generateMVPFeatures(
    project: ProjectInput,
    bmCanvas: BMCanvasDraft | null,
    industryTemplate: IndustryTemplateInput | null
  ): Promise<MVPFeatureDraft[]>;
  generateValidationExperiments(
    project: ProjectInput,
    mvpFeatures: MVPFeatureDraft[],
    personas: PersonaDraft[]
  ): Promise<ValidationExperimentDraft[]>;
  generateIROnePager(project: ProjectInput, allArtifacts: AllArtifactsInput): Promise<IROnePagerDraft>;
  generateMarketingCopy(
    project: ProjectInput,
    personas: PersonaDraft[],
    industryTemplate: IndustryTemplateInput | null
  ): Promise<MarketingCopyDraft>;
}

export type IndustryTemplateInput = {
  industryName: string;
  commonCustomerSegments: string[];
  commonBusinessModels: string[];
  keyMetrics: string[];
  commonRisks: string[];
  recommendedValidationMethods: string[];
  businessPlanWritingGuide: string;
  marketingToneGuide: string;
};

export type BusinessPlanDraft = {
  sectionKey: string;
  title: string;
  draft: string;
  completenessScore: number;
};

export type ProjectArtifactsInput = {
  questionsAnswered: number;
  businessPlanSectionsCompleted: number;
  totalBusinessPlanSections: number;
};

export type ReadinessScore = {
  score: number;
  progress: number;
  rationale: string;
};

export type MarketInsightInput = {
  title: string;
  content: string;
  category: string;
};

export type PersonaDraft = {
  name: string;
  segment: string;
  description: string;
  jobsToBeDone: string[];
  pains: string[];
  gains: string[];
  buyingTriggers: string[];
  objections: string[];
  interviewQuestions: string[];
};

export type BMCanvasDraft = {
  customerSegments: string;
  valuePropositions: string;
  channels: string;
  customerRelationships: string;
  revenueStreams: string;
  keyResources: string;
  keyActivities: string;
  keyPartners: string;
  costStructure: string;
};

export type MVPFeatureDraft = {
  title: string;
  description: string;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  riceScore: number;
  priority: number;
  moscowCategory: string;
};

export type ValidationExperimentDraft = {
  hypothesis: string;
  method: string;
  successMetric: string;
  requiredData: string;
  estimatedCost: string;
  pivotCriteria: string;
  timeline: string;
};

export type AllArtifactsInput = {
  personasCount: number;
  marketInsightsCount: number;
  competitorsCount: number;
  mvpFeaturesCount: number;
  experimentsCount: number;
  businessPlanCompletedCount: number;
};

export type IROnePagerDraft = {
  problem: string;
  solution: string;
  customer: string;
  market: string;
  product: string;
  businessModel: string;
  competition: string;
  goToMarket: string;
  validationPlan: string;
  team: string;
  ask: string;
};

export type MarketingCopyDraft = {
  landingPage: {
    heroHeadline: string;
    heroSubheadline: string;
    cta: string;
    problemSection: string;
    solutionSection: string;
    featureSection: string;
    socialProofPlaceholder: string;
    pricingSectionCopy: string;
    faqs: Array<{ question: string; answer: string }>;
  };
  ads: {
    meta: string[];
    googleSearch: string[];
    instagram: string[];
    linkedIn: string[];
    emailOutreach: string[];
  };
};
