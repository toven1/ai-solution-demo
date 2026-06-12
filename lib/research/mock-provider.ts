import type { CompetitorBundle, ResearchBundle, ResearchProvider } from "./types";

function demoSources(query: string) {
  const slug = encodeURIComponent(query.toLowerCase().replace(/\s+/g, "-"));

  return [
    {
      title: `${query} 시장 동향 리포트`,
      url: `https://example.com/demo-research/${slug}/market-trends`,
      publisher: "FounderOS Demo Research",
      notes: "데모 출처: 실제 리서치 API 연결 전까지 사용하는 mock source입니다.",
      isDemo: true
    },
    {
      title: `${query} 고객 문제 인터뷰 요약`,
      url: `https://example.com/demo-research/${slug}/customer-problems`,
      publisher: "FounderOS Demo Interview Lab",
      notes: "데모 출처: 가상의 인터뷰 요약 링크입니다.",
      isDemo: true
    },
    {
      title: `${query} 검증 방법 벤치마크`,
      url: `https://example.com/demo-research/${slug}/validation-benchmark`,
      publisher: "FounderOS Demo Benchmark",
      notes: "데모 출처: 외부 검색 provider 교체를 위한 placeholder입니다.",
      isDemo: true
    }
  ];
}

function marketBundle(query: string): ResearchBundle {
  const sources = demoSources(query);

  return {
    sources,
    insights: [
      {
        category: "keyword",
        title: "시장 키워드",
        content: `${query}, 업무 자동화, 반복 리포트, 고객 응대 품질, 구독형 SaaS가 초기 검색 키워드 후보입니다.`,
        confidenceLevel: "medium",
        isAssumption: false,
        sourceUrls: [sources[0].url]
      },
      {
        category: "trend",
        title: "시장 트렌드",
        content: "소규모 조직도 AI 요약과 자동 리포팅을 업무 도구에 붙이는 흐름이 강해지고 있습니다.",
        confidenceLevel: "medium",
        isAssumption: false,
        sourceUrls: [sources[0].url, sources[2].url]
      },
      {
        category: "customer_problem",
        title: "고객 문제",
        content: "운영자가 상담 기록, 진행 상황, 후속 안내를 수동으로 정리하면서 시간이 누수되고 품질 편차가 발생합니다.",
        confidenceLevel: "high",
        isAssumption: false,
        sourceUrls: [sources[1].url]
      },
      {
        category: "opportunity",
        title: "기회 요인",
        content: "초기에는 리포트 자동 생성처럼 반복 빈도가 높고 결과물이 명확한 작업을 좁게 공략하는 것이 유리합니다.",
        confidenceLevel: "medium",
        isAssumption: false,
        sourceUrls: [sources[2].url]
      },
      {
        category: "risk",
        title: "리스크 요인",
        content: "입력 데이터 품질이 낮거나 사용자가 기존 업무 습관을 바꾸지 않으면 반복 사용률이 낮아질 수 있습니다.",
        confidenceLevel: "low",
        isAssumption: true,
        sourceUrls: []
      }
    ]
  };
}

export const mockResearchProvider: ResearchProvider = {
  name: "mock-research",

  async searchMarket(query) {
    return marketBundle(query);
  },

  async searchTrends(query) {
    const bundle = marketBundle(query);
    return {
      sources: bundle.sources,
      insights: bundle.insights.filter((insight) => insight.category === "trend" || insight.category === "opportunity")
    };
  },

  async searchCustomerProblems(query) {
    const bundle = marketBundle(query);
    return {
      sources: bundle.sources,
      insights: bundle.insights.filter((insight) => insight.category === "customer_problem" || insight.category === "risk")
    };
  },

  async searchCompetitors(query): Promise<CompetitorBundle> {
    const sources = [
      {
        title: `${query} 경쟁 제품 비교`,
        url: `https://example.com/demo-research/${encodeURIComponent(query)}/competitor-compare`,
        publisher: "FounderOS Demo Research",
        notes: "데모 출처: 경쟁사 비교 mock source입니다.",
        isDemo: true
      },
      {
        title: `${query} 가격 정책 벤치마크`,
        url: `https://example.com/demo-research/${encodeURIComponent(query)}/pricing-benchmark`,
        publisher: "FounderOS Demo Benchmark",
        notes: "데모 출처: 가격 벤치마크 mock source입니다.",
        isDemo: true
      }
    ];

    return {
      sources,
      competitors: [
        {
          name: "ReportFlow AI",
          website: "https://example.com/reportflow-ai",
          targetCustomer: "리포트 작성 시간이 많은 중소형 운영팀",
          coreFeatures: ["상담 요약", "리포트 템플릿", "이메일 발송"],
          pricing: "월 99,000원부터",
          strengths: ["리포트 생성 UX가 단순함", "템플릿 적용이 빠름"],
          weaknesses: ["업종별 세부 워크플로우가 약함", "초기 설정 지원이 제한적"],
          differentiation: "FounderOS 프로젝트는 사업화 검증 산출물과 연결된다는 점을 차별화할 수 있습니다.",
          sourceUrls: [sources[0].url]
        },
        {
          name: "ClassOps CRM",
          website: "https://example.com/classops-crm",
          targetCustomer: "학원과 교육기관 관리자",
          coreFeatures: ["학생 CRM", "상담 기록", "수납 관리"],
          pricing: "기관 규모별 견적",
          strengths: ["교육기관 기능 폭이 넓음", "관리 기능이 풍부함"],
          weaknesses: ["AI 리포트 자동화는 제한적", "소규모 학원에는 복잡할 수 있음"],
          differentiation: "AI 상담 리포트 자동화를 좁고 깊게 제공하면 빠른 도입을 만들 수 있습니다.",
          sourceUrls: [sources[0].url, sources[1].url]
        },
        {
          name: "Manual Template Stack",
          website: "https://example.com/manual-template-stack",
          targetCustomer: "비용을 아끼려는 초기 운영자",
          coreFeatures: ["노션 템플릿", "스프레드시트", "수동 복붙"],
          pricing: "무료 또는 일회성 구매",
          strengths: ["도입 비용이 낮음", "기존 업무와 익숙함"],
          weaknesses: ["자동화가 없고 품질 편차가 큼", "확장성이 낮음"],
          differentiation: "시간 절감과 품질 표준화를 수치로 보여줘야 대체재를 이길 수 있습니다.",
          sourceUrls: []
        }
      ]
    };
  }
};
