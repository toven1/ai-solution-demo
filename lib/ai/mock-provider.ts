import { businessPlanSectionTemplates } from "@/lib/plan-sections";

import type { AIProvider, BusinessPlanDraft } from "./types";

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export const mockAIProvider: AIProvider = {
  name: "mock-ai",

  async generateFollowupQuestions(project) {
    return [
      {
        question: `${project.targetCustomer}가 지금 이 문제를 해결하기 위해 쓰는 가장 흔한 대안은 무엇인가요?`,
        reason: "현재 대안을 알아야 차별화와 지불 의사를 판단할 수 있습니다.",
        answerPlaceholder: "예: 엑셀, 수기 관리, 기존 SaaS, 외주 인력 등"
      },
      {
        question: `첫 유료 고객으로 가장 가능성이 높은 ${project.industry} 세부 세그먼트는 어디인가요?`,
        reason: "초기 고객 범위가 좁을수록 빠른 검증과 메시지 테스트가 가능합니다.",
        answerPlaceholder: "예: 매출 5억 이하 학원, 10인 이하 B2B 팀 등"
      },
      {
        question: `고객이 ${project.title}에 비용을 지불할 명확한 순간은 언제인가요?`,
        reason: "구매 트리거가 선명해야 랜딩페이지와 영업 메시지가 강해집니다.",
        answerPlaceholder: "예: 월말 리포트 작성, 신규 상담 직후, 고객 이탈 위험 시점"
      },
      {
        question: "MVP에서 반드시 포함해야 할 기능 1개와 제외해도 되는 기능 1개는 무엇인가요?",
        reason: "범위를 줄여야 검증 실험을 실제로 실행할 수 있습니다.",
        answerPlaceholder: "예: 포함: 자동 요약, 제외: 결제/권한 관리"
      },
      {
        question: "4주 안에 성공 여부를 판단할 수 있는 숫자 지표는 무엇인가요?",
        reason: "검증 목표를 행동 가능한 실험 기준으로 바꿉니다.",
        answerPlaceholder: "예: 인터뷰 15건, 파일럿 3곳, 유료 전환 1건"
      },
      {
        question: "이 아이디어가 실패한다면 가장 가능성 높은 이유는 무엇인가요?",
        reason: "초기 리스크를 먼저 드러내면 사업계획서와 실험 설계가 더 현실적입니다.",
        answerPlaceholder: "예: 고객이 직접 할 수 있다고 느낀다, 데이터 입력이 번거롭다"
      }
    ];
  },

  async generateBusinessPlanSections(project, industryTemplate) {
    const industryGuide = industryTemplate
      ? `${industryTemplate.industryName} 업종에서는 ${industryTemplate.keyMetrics.slice(0, 2).join(", ")} 같은 지표를 우선 확인해야 합니다.`
      : `${project.industry} 업종 특성을 반영해야 합니다.`;

    return businessPlanSectionTemplates.map(([sectionKey, title, guide], index): BusinessPlanDraft => {
      const sectionFocus = [
        `${project.targetCustomer}가 겪는 반복적 문제를 ${project.ideaSummary} 관점에서 정리합니다.`,
        `${project.title}은 ${project.goal}을 목표로 초기 검증을 진행합니다.`,
        `${project.availableResources}를 활용해 초기 실행 가능성을 높입니다.`,
        `${project.mainConcern}을 핵심 리스크로 두고 검증 계획에 반영합니다.`
      ][index % 4];

      return {
        sectionKey,
        title,
        draft: `${title}: ${guide} ${sectionFocus} ${industryGuide} 현재 초안은 MockAIProvider가 생성한 데모 문안이며, 창업자가 실제 인터뷰와 시장 근거를 반영해 수정해야 합니다.`,
        completenessScore: clampScore(38 + index * 3)
      };
    });
  },

  async scoreProjectReadiness(_project, artifacts) {
    const questionScore = Math.min(30, artifacts.questionsAnswered * 5);
    const planScore = artifacts.totalBusinessPlanSections
      ? Math.round((artifacts.businessPlanSectionsCompleted / artifacts.totalBusinessPlanSections) * 50)
      : 0;
    const base = 15;
    const score = clampScore(base + questionScore + planScore);
    const progress = clampScore(Math.round(score * 0.85));

    return {
      score,
      progress,
      rationale: "추가 질문 답변 수와 사업계획서 섹션 완성도를 기준으로 계산한 Mock readiness score입니다."
    };
  },

  async generatePersonas(project, _marketInsights, industryTemplate) {
    const baseSegment = project.targetCustomer;
    const metric = industryTemplate?.keyMetrics[0] ?? "반복 사용률";

    return [
      {
        name: "효율 중시 운영자",
        segment: `${baseSegment} 중 반복 업무가 많은 팀`,
        description: "운영 시간을 줄이고 고객 응대 품질을 표준화하려는 실무형 의사결정자입니다.",
        jobsToBeDone: ["반복 리포트 작성 시간을 줄인다", "고객 응대 품질을 일정하게 유지한다"],
        pains: ["수동 정리 시간이 길다", "담당자별 결과물 품질이 다르다"],
        gains: ["주간 업무시간 절감", `${metric} 개선 가능성`],
        buyingTriggers: ["월말 보고 시즌", "고객 이탈 징후 증가"],
        objections: ["초기 세팅이 번거로울 수 있다", "AI 결과를 신뢰할 수 있을지 걱정한다"],
        interviewQuestions: ["현재 가장 오래 걸리는 반복 업무는 무엇인가요?", "자동화 결과물을 검토하는 데 허용 가능한 시간은 얼마인가요?"]
      },
      {
        name: "성장 지향 대표",
        segment: `${project.industry}에서 신규 고객 전환을 늘리고 싶은 대표`,
        description: "서비스 품질을 높여 전환율과 재구매를 개선하려는 사업 책임자입니다.",
        jobsToBeDone: ["고객에게 더 설득력 있는 결과물을 제공한다", "팀 규모를 늘리지 않고 운영량을 키운다"],
        pains: ["성장할수록 운영 병목이 커진다", "고객에게 보여줄 정리된 산출물이 부족하다"],
        gains: ["고객 신뢰 증가", "영업 자료로 재활용 가능한 리포트 확보"],
        buyingTriggers: ["신규 고객 상담 증가", "경쟁 서비스와 차별화 필요"],
        objections: ["월 구독료 대비 효과가 불명확하다", "기존 도구와 중복될 수 있다"],
        interviewQuestions: ["유료 전환에 가장 크게 영향을 주는 자료는 무엇인가요?", "운영 자동화에 월 얼마까지 지불할 수 있나요?"]
      },
      {
        name: "품질 관리 실무자",
        segment: `${baseSegment} 중 고객 커뮤니케이션을 직접 담당하는 사용자`,
        description: "매일 고객과 소통하며 누락 없는 기록과 빠른 후속 조치를 원하는 실무 사용자입니다.",
        jobsToBeDone: ["상담 후속 조치를 놓치지 않는다", "고객별 상태를 빠르게 파악한다"],
        pains: ["기록이 여러 곳에 흩어져 있다", "후속 안내 문구를 매번 새로 작성한다"],
        gains: ["응대 속도 향상", "업무 누락 감소"],
        buyingTriggers: ["고객 문의가 몰리는 시기", "업무 인수인계가 필요한 시점"],
        objections: ["새 도구 학습이 부담스럽다", "입력해야 할 데이터가 많으면 쓰지 않을 수 있다"],
        interviewQuestions: ["하루에 고객 기록을 몇 번 업데이트하나요?", "자동 생성된 문구에서 꼭 수정해야 하는 부분은 무엇인가요?"]
      }
    ];
  },

  async generateBMCanvas(project, personas, industryTemplate) {
    const personaSegments = personas.map((persona) => persona.segment).join(", ") || project.targetCustomer;
    const models = industryTemplate?.commonBusinessModels.join(", ") ?? "월 구독";

    return {
      customerSegments: personaSegments,
      valuePropositions: `${project.ideaSummary}를 통해 반복 업무 시간을 줄이고 결과물 품질을 표준화합니다.`,
      channels: "초기 고객 인터뷰, 업종 커뮤니티, 지인 소개, 문제 중심 랜딩페이지",
      customerRelationships: "초기 온보딩, 템플릿 맞춤 설정, 월간 성과 리뷰",
      revenueStreams: `${models} 기반으로 시작하고, 사용량 또는 팀 규모에 따라 확장합니다.`,
      keyResources: "업종 템플릿, 고객 인터뷰 데이터, AI 초안 생성 워크플로우",
      keyActivities: "MVP 운영, 고객 피드백 반영, 리포트 품질 개선, 세일즈 자료 제작",
      keyPartners: "업종 전문가, 초기 파일럿 고객, 데이터/AI 인프라 파트너",
      costStructure: "AI 사용량, 제품 개발, 고객지원, 초기 세일즈와 온보딩 비용"
    };
  },

  async generateMVPFeatures(project, _bmCanvas, _industryTemplate) {
    const features = [
      ["프로젝트 입력 온보딩", "아이디어, 고객, 목표를 구조화해 이후 산출물의 기준 데이터로 저장합니다.", 80, 4, 5, 2, "Must"],
      ["AI 리포트 초안 생성", `${project.targetCustomer}가 바로 검토할 수 있는 초안 산출물을 생성합니다.`, 60, 5, 4, 3, "Must"],
      ["수정본 저장과 버전 관리", "사용자가 수정한 내용을 원본 AI 초안과 분리해 저장합니다.", 45, 4, 4, 2, "Should"],
      ["검증 실험 대시보드", "가설, 성공 기준, 결과를 한곳에서 관리합니다.", 35, 3, 3, 3, "Should"],
      ["공유 링크", "멘토나 파일럿 고객에게 읽기 전용 산출물을 공유합니다.", 25, 3, 3, 2, "Could"]
    ] as const;

    return features.map(([title, description, reach, impact, confidence, effort, moscowCategory], index) => ({
      title,
      description,
      reach,
      impact,
      confidence,
      effort,
      riceScore: Math.round(((reach * impact * confidence) / effort) * 10) / 10,
      priority: index + 1,
      moscowCategory
    }));
  },

  async generateValidationExperiments(project, mvpFeatures, personas) {
    const persona = personas[0]?.segment ?? project.targetCustomer;
    const feature = mvpFeatures[0]?.title ?? "핵심 MVP 기능";

    return [
      {
        hypothesis: `${persona}는 ${feature}가 있으면 현재 수동 업무보다 빠르게 문제를 해결할 것이다.`,
        method: "컨시어지 MVP로 실제 입력을 받아 수동+AI 보조 결과물을 제공한다.",
        successMetric: "파일럿 5곳 중 3곳 이상이 두 번째 사용을 요청한다.",
        requiredData: "고객 인터뷰 기록, 기존 업무 샘플, 결과물 피드백",
        estimatedCost: "30만원 이하",
        pivotCriteria: "두 번째 사용 의향이 40% 미만이면 타깃 세그먼트 또는 문제를 재정의한다.",
        timeline: "2주"
      },
      {
        hypothesis: `${project.targetCustomer}는 자동 생성 결과물을 수정해도 전체 업무 시간이 50% 이상 줄면 비용을 지불할 것이다.`,
        method: "전후 업무시간 비교 테스트를 진행한다.",
        successMetric: "평균 작성 시간이 50% 이상 감소하고 유료 의향 1건 이상 확보",
        requiredData: "기존 작성 시간, 자동화 후 작성 시간, 유료 의향 응답",
        estimatedCost: "10만원 이하",
        pivotCriteria: "시간 절감이 30% 미만이면 기능 범위와 입력 UX를 재설계한다.",
        timeline: "1주"
      },
      {
        hypothesis: "문제 중심 랜딩페이지는 초기 상담 신청을 만들 수 있다.",
        method: "랜딩페이지와 콜드 메시지로 신청 전환율을 측정한다.",
        successMetric: "방문자 100명 중 상담 신청 5건 이상",
        requiredData: "방문자 수, CTA 클릭, 상담 신청 수, 유입 채널",
        estimatedCost: "20만원 이하",
        pivotCriteria: "전환율 2% 미만이면 메시지와 고객 세그먼트를 수정한다.",
        timeline: "2주"
      }
    ];
  },

  async generateIROnePager(project, allArtifacts) {
    return {
      problem: `${project.targetCustomer}는 ${project.mainConcern} 때문에 반복 업무와 고객 설득에서 병목을 겪고 있습니다.`,
      solution: `${project.title}은 ${project.ideaSummary}를 중심으로 문제를 구조화하고 실행 가능한 산출물을 만듭니다.`,
      customer: `초기 고객은 ${project.targetCustomer}이며, 반복 업무가 많고 빠른 검증 의지가 있는 세그먼트를 우선 공략합니다.`,
      market: `${project.industry} 시장에서 자동화, 검증, 문서화 수요가 증가하고 있으며 현재 ${allArtifacts.marketInsightsCount}개의 시장 인사이트가 정리되어 있습니다.`,
      product: `프로젝트 생성, 질문 답변, 리서치, 페르소나, BM Canvas, MVP, 검증 실험을 하나의 워크스페이스에서 연결합니다.`,
      businessModel: "초기에는 월 구독 모델로 시작하고, 프로젝트 수와 팀 규모에 따라 상위 플랜으로 확장합니다.",
      competition: `${allArtifacts.competitorsCount}개 경쟁/대체재를 기준으로 차별화 포인트를 검토합니다.`,
      goToMarket: "문제 인터뷰, 파일럿 고객, 업종 커뮤니티, 랜딩페이지 전환 실험을 순서대로 실행합니다.",
      validationPlan: `${allArtifacts.experimentsCount}개 검증 실험을 통해 지불 의사, 반복 사용, 핵심 기능 가치를 확인합니다.`,
      team: `${project.teamSize}명 팀과 현재 자원(${project.availableResources})을 활용해 MVP를 빠르게 검증합니다.`,
      ask: "초기 파일럿 고객, 멘토 피드백, 검증 실험 실행을 위한 리소스를 요청합니다."
    };
  },

  async generateMarketingCopy(project, personas, industryTemplate) {
    const tone = industryTemplate?.marketingToneGuide ?? "명확하고 실용적인 톤을 사용합니다.";
    const persona = personas[0]?.segment ?? project.targetCustomer;
    const headline = `${project.targetCustomer}의 반복 업무를 줄이는 AI 사업화 워크스페이스`;

    return {
      landingPage: {
        heroHeadline: headline,
        heroSubheadline: `${project.ideaSummary}. ${tone}`,
        cta: "무료로 프로젝트 만들기",
        problemSection: `${persona}는 반복되는 정리, 보고, 고객 설득 업무에 시간을 쓰고 있습니다.`,
        solutionSection: `${project.title}은 아이디어를 실행 가능한 사업화 산출물로 바꾸고 저장합니다.`,
        featureSection: "시장조사, 페르소나, BM Canvas, MVP, 검증 실험, 사업계획서를 한 흐름에서 관리합니다.",
        socialProofPlaceholder: "초기 파일럿 고객의 검증 결과와 멘토 피드백이 이 영역에 표시됩니다.",
        pricingSectionCopy: "초기 팀은 무료 데모로 시작하고, 프로젝트와 export 사용량에 따라 확장할 수 있습니다.",
        faqs: [
          { question: "AI API 키가 필요한가요?", answer: "데모는 MockAIProvider로 작동하며 실제 API 키 없이 사용할 수 있습니다." },
          { question: "생성된 내용을 수정할 수 있나요?", answer: "모든 주요 산출물은 사용자가 수정하고 저장할 수 있습니다." },
          { question: "시장조사 출처는 저장되나요?", answer: "ResearchSource로 저장되며 출처 없는 내용은 AI 추정으로 표시됩니다." },
          { question: "사업계획서는 어떻게 관리되나요?", answer: "하나의 긴 textarea가 아니라 문항별 editor로 관리됩니다." },
          { question: "멘토 공유가 가능한가요?", answer: "공유 링크 기능은 후속 Phase에서 구현됩니다." }
        ]
      },
      ads: {
        meta: [
          "창업 아이디어, 어디서부터 정리할지 막막하다면 FounderOS AI로 시작하세요.",
          `${project.targetCustomer}를 위한 사업화 산출물 워크스페이스.`,
          "시장조사부터 MVP 검증까지 한 곳에서 정리하세요.",
          "사업계획서 초안을 문항별로 만들고 직접 수정하세요.",
          "AI 추정과 근거 링크를 구분하는 창업 워크스페이스."
        ],
        googleSearch: [
          "AI 사업계획서 워크스페이스 | FounderOS AI",
          "초기 창업자 시장조사 도구 | 프로젝트 저장 가능",
          "BM Canvas MVP 검증 자동화 | FounderOS AI",
          "창업 아이디어 검증 SaaS | Mock AI 데모",
          `${project.industry} 사업화 템플릿 | FounderOS AI`
        ],
        instagram: [
          "아이디어만 있고 다음 단계가 막혔다면.",
          "시장조사, 페르소나, MVP를 한 흐름으로.",
          "창업 준비를 문서가 아니라 워크스페이스로.",
          "수정 가능한 AI 초안으로 시작하세요.",
          "FounderOS AI로 오늘 첫 검증 계획을 만드세요."
        ],
        linkedIn: [
          "FounderOS AI helps early founders turn raw ideas into structured commercialization artifacts.",
          "Build research, personas, BM Canvas, MVP priorities, and validation plans in one workspace.",
          "Designed for founders who need editable outputs, not one-off chatbot answers.",
          "Separate sourced insights from AI assumptions for more trustworthy planning.",
          "Create a project, pick an industry template, and move toward validation."
        ],
        emailOutreach: [
          `안녕하세요, ${project.targetCustomer}의 반복 사업화 작업을 줄이는 FounderOS AI를 소개드립니다.`,
          "초기 아이디어를 시장조사, 페르소나, MVP 검증 계획으로 정리하는 데 도움을 드립니다.",
          "현재 MockAI 기반 데모를 운영 중이며 실제 사용 피드백을 받고 있습니다.",
          "15분 정도 제품 흐름을 보여드리고 초기 검증에 맞는 템플릿을 함께 확인드리고 싶습니다.",
          "관심 있으시면 이번 주 편한 시간을 알려주세요."
        ]
      }
    };
  }
};
