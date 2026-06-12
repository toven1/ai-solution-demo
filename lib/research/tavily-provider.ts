import type { CompetitorBundle, ResearchBundle, ResearchProvider, ResearchSourceInput } from "@/lib/research/types";

const TAVILY_URL = "https://api.tavily.com/search";

async function tavilySearch(query: string, topic: string): Promise<ResearchSourceInput[]> {
  const res = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY || process.env.RESEARCH_API_KEY,
      query: `${query} ${topic}`,
      search_depth: "basic",
      max_results: 5,
      include_answer: true
    })
  });

  if (!res.ok) throw new Error(`TAVILY_HTTP_${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.results ?? []).map((result: any) => ({
    title: result.title ?? result.url,
    url: result.url,
    publisher: "Tavily",
    notes: result.content ?? data.answer ?? ""
  }));
}

function insight(query: string, category: ResearchBundle["insights"][number]["category"], sources: ResearchSourceInput[]) {
  return {
    category,
    title: `${query} ${category}`,
    content: sources.map((source) => source.notes).filter(Boolean).join(" ") || `${query} 관련 검색 결과를 기반으로 정리한 인사이트입니다.`,
    confidenceLevel: sources.length > 0 ? ("medium" as const) : ("low" as const),
    isAssumption: sources.length === 0,
    sourceUrls: sources.map((source) => source.url)
  };
}

export const tavilyProvider: ResearchProvider = {
  name: "tavily",
  async searchMarket(query: string): Promise<ResearchBundle> {
    const sources = await tavilySearch(query, "market size trend startup");
    return { sources, insights: [insight(query, "keyword", sources), insight(query, "opportunity", sources)] };
  },
  async searchTrends(query: string): Promise<ResearchBundle> {
    const sources = await tavilySearch(query, "trend report");
    return { sources, insights: [insight(query, "trend", sources)] };
  },
  async searchCustomerProblems(query: string): Promise<ResearchBundle> {
    const sources = await tavilySearch(query, "customer pain point interview");
    return { sources, insights: [insight(query, "customer_problem", sources), insight(query, "risk", [])] };
  },
  async searchCompetitors(query: string): Promise<CompetitorBundle> {
    const sources = await tavilySearch(query, "competitors pricing alternatives");
    return {
      sources,
      competitors: sources.slice(0, 3).map((source, index) => ({
        name: source.title.split("|")[0].slice(0, 60) || `Competitor ${index + 1}`,
        website: source.url,
        targetCustomer: "검색 결과 기반 잠재 고객",
        coreFeatures: ["검색 결과 기반 기능", "제품 소개", "가격/포지셔닝"],
        pricing: "공개 정보 확인 필요",
        strengths: ["검색 노출 또는 자료 존재"],
        weaknesses: ["상세 검증 필요"],
        differentiation: "FounderOS 산출물과 연결해 차별화 포인트를 검증해야 합니다.",
        sourceUrls: [source.url]
      }))
    };
  }
};
