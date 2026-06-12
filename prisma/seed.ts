import { PrismaClient, ProjectStage, UsageEventType, CreditLedgerType } from "@prisma/client";

const prisma = new PrismaClient();

const templates = [
  {
    industryName: "SaaS",
    commonCustomerSegments: ["초기 스타트업", "중소기업 실무팀", "운영 자동화가 필요한 B2B 팀"],
    commonBusinessModels: ["월 구독", "사용량 기반 과금", "좌석당 과금"],
    keyMetrics: ["MRR", "Activation rate", "Churn", "CAC payback"],
    commonRisks: ["도입 전환 장벽", "낮은 사용 빈도", "긴 B2B 세일즈 사이클"],
    recommendedValidationMethods: ["문제 인터뷰", "컨시어지 MVP", "파일럿 계약"],
    businessPlanWritingGuide: "반복 사용 문제, 구매자와 사용자 분리, 도입 후 ROI를 수치로 설명한다.",
    marketingToneGuide: "명확하고 실무적인 톤. 절감 시간, 비용, 리스크 감소를 강조한다."
  },
  {
    industryName: "커머스",
    commonCustomerSegments: ["니치 취향 고객", "재구매 가능 소비자", "선물 구매자"],
    commonBusinessModels: ["직접 판매", "구독 박스", "마켓플레이스 수수료"],
    keyMetrics: ["AOV", "Repeat purchase rate", "Gross margin", "ROAS"],
    commonRisks: ["재고 부담", "광고비 상승", "차별화 약화"],
    recommendedValidationMethods: ["랜딩페이지 선주문", "소량 테스트 판매", "크리에이터 협업"],
    businessPlanWritingGuide: "고객 세그먼트, 반복 구매 이유, 원가와 마진 구조를 선명하게 쓴다.",
    marketingToneGuide: "구체적인 사용 장면과 구매 이유를 앞세운다."
  },
  {
    industryName: "교육",
    commonCustomerSegments: ["학부모", "성인 직무 학습자", "교육기관"],
    commonBusinessModels: ["강의 판매", "구독형 학습", "기관 라이선스"],
    keyMetrics: ["Completion rate", "Learning outcome", "Retention", "LTV"],
    commonRisks: ["학습 지속률 저하", "성과 입증 어려움", "콘텐츠 제작 비용"],
    recommendedValidationMethods: ["무료 코호트", "학습성과 테스트", "교육기관 파일럿"],
    businessPlanWritingGuide: "학습 전후 변화와 측정 가능한 성과를 중심으로 작성한다.",
    marketingToneGuide: "신뢰감 있고 구체적인 성과 중심 톤을 사용한다."
  },
  {
    industryName: "헬스케어",
    commonCustomerSegments: ["만성질환 관리 고객", "병의원", "웰니스 사용자"],
    commonBusinessModels: ["B2B 라이선스", "개인 구독", "케어 프로그램"],
    keyMetrics: ["Engagement", "Clinical adherence", "Retention", "Referral rate"],
    commonRisks: ["규제 리스크", "개인정보 보호", "의학적 근거 부족"],
    recommendedValidationMethods: ["전문가 검토", "비의료 웰니스 MVP", "기관 파일럿"],
    businessPlanWritingGuide: "규제 범위, 데이터 보호, 근거 수준을 보수적으로 설명한다.",
    marketingToneGuide: "과장 없이 안전성과 신뢰를 강조한다."
  },
  {
    industryName: "로컬서비스",
    commonCustomerSegments: ["지역 주민", "소상공인", "예약 기반 고객"],
    commonBusinessModels: ["예약 수수료", "월 관리비", "방문 서비스 판매"],
    keyMetrics: ["Booking conversion", "Repeat rate", "Utilization", "Local CAC"],
    commonRisks: ["지역 확장 한계", "공급 품질 편차", "운영 복잡도"],
    recommendedValidationMethods: ["한 지역 수동 운영", "전화 예약 MVP", "파트너 인터뷰"],
    businessPlanWritingGuide: "초기 지역 선택 이유와 운영 표준화 계획을 설명한다.",
    marketingToneGuide: "가깝고 믿을 수 있는 실용적 톤을 사용한다."
  },
  {
    industryName: "콘텐츠/미디어",
    commonCustomerSegments: ["구독 독자", "브랜드 광고주", "팬 커뮤니티"],
    commonBusinessModels: ["멤버십", "광고", "스폰서십", "IP 확장"],
    keyMetrics: ["Subscriber growth", "Engagement", "Watch time", "ARPU"],
    commonRisks: ["콘텐츠 생산 지속성", "플랫폼 의존", "수익화 지연"],
    recommendedValidationMethods: ["뉴스레터 MVP", "커뮤니티 테스트", "스폰서 제안서"],
    businessPlanWritingGuide: "차별화된 관점, 배포 채널, 수익화 시점을 분리해서 작성한다.",
    marketingToneGuide: "명확한 관점과 커뮤니티 소속감을 드러낸다."
  },
  {
    industryName: "AI/데이터",
    commonCustomerSegments: ["데이터 보유 기업", "반복 분석 업무팀", "AI 도입 검토 조직"],
    commonBusinessModels: ["API 과금", "엔터프라이즈 라이선스", "성과 기반 과금"],
    keyMetrics: ["Model accuracy", "Time saved", "API usage", "Expansion revenue"],
    commonRisks: ["데이터 품질", "보안 검토", "모델 성능 불확실성"],
    recommendedValidationMethods: ["샘플 데이터 PoC", "휴먼 인 더 루프 MVP", "전후 업무시간 비교"],
    businessPlanWritingGuide: "모델 자체보다 업무 성과, 데이터 흐름, 보안 체계를 설명한다.",
    marketingToneGuide: "기술 과시보다 실무 효용과 검증 결과를 강조한다."
  },
  {
    industryName: "제조/하드웨어",
    commonCustomerSegments: ["현장 운영팀", "유통 파트너", "특정 장비 사용자"],
    commonBusinessModels: ["제품 판매", "유지보수 계약", "장비+소프트웨어 번들"],
    keyMetrics: ["Unit margin", "Defect rate", "Lead time", "After-sales cost"],
    commonRisks: ["개발 비용", "공급망", "인증과 품질관리"],
    recommendedValidationMethods: ["3D 목업 테스트", "소량 생산", "현장 파일럿"],
    businessPlanWritingGuide: "제조 가능성, 단가, 인증, 유통 경로를 구체적으로 작성한다.",
    marketingToneGuide: "견고함, 비용 절감, 현장 적합성을 강조한다."
  }
];

const businessPlanSections = [
  ["problem", "문제 정의", "고객이 겪는 핵심 문제와 현재 대안의 한계를 설명하세요."],
  ["customer", "목표 고객", "가장 먼저 공략할 고객 세그먼트와 구매 의사결정자를 구분하세요."],
  ["solution", "솔루션", "제품이 문제를 어떻게 해결하는지 핵심 기능 중심으로 설명하세요."],
  ["market", "시장 규모", "시장 범위, 초기 진입 시장, 성장 가능성을 근거와 함께 작성하세요."],
  ["competition", "경쟁 환경", "직접/간접 경쟁자와 차별화 포인트를 설명하세요."],
  ["business_model", "비즈니스 모델", "과금 방식, 가격 가정, 매출 발생 구조를 설명하세요."],
  ["gtm", "시장 진입 전략", "초기 고객 획득 채널과 반복 가능한 판매 방식을 설명하세요."],
  ["mvp", "MVP 범위", "초기 검증에 필요한 최소 기능과 제외할 기능을 정리하세요."],
  ["validation", "검증 계획", "가설, 실험 방법, 성공 기준을 연결해서 작성하세요."],
  ["operations", "운영 계획", "서비스 제공, 고객지원, 품질관리 방식을 설명하세요."],
  ["team", "팀 역량", "현재 팀의 강점과 필요한 보완 역량을 작성하세요."],
  ["financials", "재무 가정", "초기 비용, 매출 가정, 손익분기 조건을 설명하세요."],
  ["risks", "리스크와 대응", "시장, 제품, 운영, 규제 리스크와 대응책을 작성하세요."],
  ["roadmap", "로드맵", "3개월, 6개월, 12개월 단위 실행 계획을 정리하세요."]
] as const;

async function main() {
  const organization = await prisma.organization.upsert({
    where: { id: "demo-org" },
    update: {},
    create: {
      id: "demo-org",
      name: "FounderOS Demo Studio"
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "demo@founderos.ai" },
    update: {
      name: "Demo Founder",
      organizationId: organization.id
    },
    create: {
      email: "demo@founderos.ai",
      name: "Demo Founder",
      organizationId: organization.id
    }
  });

  for (const template of templates) {
    await prisma.industryTemplate.upsert({
      where: { industryName: template.industryName },
      update: template,
      create: template
    });
  }

  const educationTemplate = await prisma.industryTemplate.findUniqueOrThrow({
    where: { industryName: "교육" }
  });

  const project = await prisma.project.upsert({
    where: { id: "demo-project-ai-academy" },
    update: {
      industryTemplateId: educationTemplate.id,
      progress: 18,
      readinessScore: 42
    },
    create: {
      id: "demo-project-ai-academy",
      userId: user.id,
      organizationId: organization.id,
      industryTemplateId: educationTemplate.id,
      title: "동네 학원을 위한 AI 상담·학습 리포트 자동화 SaaS",
      ideaSummary: "학원 상담 기록과 학습 데이터를 바탕으로 학부모 상담 리포트와 학생별 학습 피드백을 자동 생성하는 SaaS",
      ideaDescription:
        "중소형 동네 학원은 학부모 상담, 학생별 피드백, 재등록 관리에 많은 시간을 쓰지만 체계적인 리포트 도구가 부족하다. FounderOS 데모 프로젝트는 상담 내용을 구조화하고 학습 현황을 요약해 원장과 강사가 반복 업무를 줄일 수 있는 SaaS를 검증한다.",
      industry: "교육",
      targetCustomer: "초중등 보습학원 원장과 상담 실장",
      stage: ProjectStage.IDEA,
      goal: "4주 안에 문제 인터뷰 15건과 리포트 MVP 파일럿 3곳을 확보한다.",
      teamSize: 2,
      availableResources: "교육업 지인 네트워크, 상담 스크립트 샘플, 노션 기반 수동 리포트 템플릿",
      mainConcern: "학원들이 실제로 월 구독료를 낼 만큼 상담 자동화 문제를 크게 느끼는지 검증이 필요하다.",
      progress: 18,
      readinessScore: 42
    }
  });

  const demoQuestions = [
    {
      question: "학원 상담 리포트가 가장 많이 필요한 순간은 언제인가요?",
      answer: "신규 상담 직후와 월말 학습 피드백 시점",
      order: 1
    },
    {
      question: "구매 의사결정자는 누구인가요?",
      answer: "원장 또는 상담 실장",
      order: 2
    }
  ];

  for (const question of demoQuestions) {
    await prisma.projectQuestion.upsert({
      where: {
        projectId_order: {
          projectId: project.id,
          order: question.order
        }
      },
      update: question,
      create: {
        projectId: project.id,
        ...question
      }
    });
  }

  for (const [index, [sectionKey, title, guide]] of businessPlanSections.entries()) {
    await prisma.businessPlanSection.upsert({
      where: {
        projectId_sectionKey: {
          projectId: project.id,
          sectionKey
        }
      },
      update: {
        title,
        guide,
        order: index + 1
      },
      create: {
        projectId: project.id,
        sectionKey,
        title,
        guide,
        aiDraft: "",
        userContent: "",
        evidenceSourceIds: [],
        completenessScore: 0,
        order: index + 1
      }
    });
  }

  await prisma.bMCanvas.upsert({
    where: { projectId: project.id },
    update: {},
    create: {
      projectId: project.id,
      customerSegments: "초중등 보습학원 원장, 상담 실장, 학부모 관리가 중요한 공부방",
      valuePropositions: "상담 리포트 작성 시간을 줄이고 학부모 신뢰를 높인다.",
      channels: "학원장 커뮤니티, 교육 세미나, 지인 소개",
      customerRelationships: "초기 온보딩과 리포트 템플릿 커스터마이징",
      revenueStreams: "월 구독료와 학원 규모별 좌석 과금",
      keyResources: "상담 템플릿, 학습 리포트 포맷, AI 요약 파이프라인",
      keyActivities: "상담 데이터 구조화, 리포트 생성, 파일럿 운영",
      keyPartners: "교육 컨설턴트, 학원 커뮤니티 운영자",
      costStructure: "AI 사용량, 고객지원, 템플릿 제작"
    }
  });

  const existingSeedUsage = await prisma.usageLog.findFirst({
    where: {
      projectId: project.id,
      provider: "seed",
      eventType: UsageEventType.PROJECT_CREATE
    }
  });

  if (!existingSeedUsage) {
    await prisma.usageLog.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        projectId: project.id,
        eventType: UsageEventType.PROJECT_CREATE,
        provider: "seed",
        creditsUsed: 0,
        metadata: { phase: "phase-1" }
      }
    });
  }

  const existingSeedCredit = await prisma.creditLedger.findFirst({
    where: {
      projectId: project.id,
      type: CreditLedgerType.GRANT,
      reason: "Demo workspace seed credits"
    }
  });

  if (!existingSeedCredit) {
    await prisma.creditLedger.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        projectId: project.id,
        type: CreditLedgerType.GRANT,
        amount: 1000,
        balanceAfter: 1000,
        reason: "Demo workspace seed credits"
      }
    });
  }

  console.log("Seed complete: 8 industry templates and demo project created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
