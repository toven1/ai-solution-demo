import type { CompetitorBundle, ResearchBundle, ResearchProvider, ResearchSourceInput } from "@/lib/research/types";

const SERPER_URL = "https://google.serper.dev/search";

async function serperSearch(query: string): Promise<ResearchSourceInput[]> {
  const res = await fetch(SERPER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.SERPER_API_KEY || process.env.RESEARCH_API_KEY || ""
    },
    body: JSON.stringify({ q: query, num: 5 })
  });

  if (!res.ok) throw new Error(`SERPER_HTTP_${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data.organic ?? []).map((result: any) => ({
    title: result.title ?? result.link,
    url: result.link,
    publisher: "Serper",
    notes: result.snippet ?? ""
  }));
}

function bundle(query: string, category: ResearchBundle["insights"][number]["category"], sources: ResearchSourceInput[]): ResearchBundle {
  return {
    sources,
    insights: [
      {
        category,
        title: `${query} ${category}`,
        content: sources.map((source) => source.notes).filter(Boolean).join(" ") || `${query} 검색 결과 기반 인사이트입니다.`,
        confidenceLevel: sources.length > 0 ? "medium" : "low",
        isAssumption: sources.length === 0,
        sourceUrls: sources.map((source) => source.url)
      }
    ]
  };
}

export const serperProvider: ResearchProvider = {
  name: "serper",
  async searchMarket(query: string) {
    const sources = await serperSearch(`${query} market size startup trend`);
    return bundle(query, "keyword", sources);
  },
  async searchTrends(query: string) {
    const sources = await serperSearch(`${query} trends`);
    return bundle(query, "trend", sources);
  },
  async searchCustomerProblems(query: string) {
    const sources = await serperSearch(`${query} customer pain points`);
    return bundle(query, "customer_problem", sources);
  },
  async searchCompetitors(query: string): Promise<CompetitorBundle> {
    const sources = await serperSearch(`${query} competitors alternatives pricing`);
    return {
      sources,
      competitors: sources.slice(0, 3).map((source, index) => ({
        name: source.title.slice(0, 60) || `Competitor ${index + 1}`,
        website: source.url,
        targetCustomer: "검색 결과 기반 잠재 고객",
        coreFeatures: ["제품 소개", "대체재", "시장 포지셔닝"],
        pricing: "공개 정보 확인 필요",
        strengths: ["검색 결과 기반 인지도"],
        weaknesses: ["정성 검증 필요"],
        differentiation: "FounderOS 산출물 흐름과 비교해 차별화 가설을 세워야 합니다.",
        sourceUrls: [source.url]
      }))
    };
  }
};
