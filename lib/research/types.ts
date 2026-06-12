export type ConfidenceLevel = "high" | "medium" | "low";

export type ResearchSourceInput = {
  title: string;
  url: string;
  publisher?: string;
  publishedAt?: string;
  notes?: string;
  isDemo?: boolean;
};

export type MarketResearchInsight = {
  category: "keyword" | "trend" | "customer_problem" | "opportunity" | "risk";
  title: string;
  content: string;
  confidenceLevel: ConfidenceLevel;
  isAssumption: boolean;
  sourceUrls: string[];
};

export type CompetitorResearchResult = {
  name: string;
  website?: string;
  targetCustomer: string;
  coreFeatures: string[];
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  differentiation: string;
  sourceUrls: string[];
};

export type ResearchBundle = {
  sources: ResearchSourceInput[];
  insights: MarketResearchInsight[];
};

export type CompetitorBundle = {
  sources: ResearchSourceInput[];
  competitors: CompetitorResearchResult[];
};

export interface ResearchProvider {
  name: string;
  searchMarket(query: string): Promise<ResearchBundle>;
  searchCompetitors(query: string): Promise<CompetitorBundle>;
  searchTrends(query: string): Promise<ResearchBundle>;
  searchCustomerProblems(query: string): Promise<ResearchBundle>;
}
