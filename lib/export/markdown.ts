import type { ExportProjectPackage } from "@/lib/export/package";

function text(value?: string | null) {
  return value?.trim() || "작성된 내용이 없습니다.";
}

function list(values?: string[] | null) {
  if (!values || values.length === 0) return "- 작성된 내용이 없습니다.";
  return values.map((value) => `- ${value}`).join("\n");
}

function table(headers: string[], rows: string[][]) {
  const header = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map((cell) => cell.replace(/\n/g, "<br />")).join(" | ")} |`);
  return [header, divider, ...body].join("\n");
}

function planContent(section: ExportProjectPackage["businessPlan"][number]) {
  return text(section.userContent || section.aiDraft);
}

export function createPackageMarkdown(project: ExportProjectPackage) {
  const landingCopy = project.marketingCopy.find((copy) => copy.channel === "landing-page");
  const adCopies = project.marketingCopy.filter((copy) => copy.channel !== "landing-page");
  const faqItems = Array.isArray(landingCopy?.faqs) ? landingCopy.faqs : [];

  const parts = [
    `# ${project.title}`,
    "## 프로젝트 개요",
    table(
      ["항목", "내용"],
      [
        ["업종", project.industry],
        ["타깃 고객", project.targetCustomer],
        ["단계", project.stage],
        ["팀 규모", `${project.teamSize}명`],
        ["진행률", `${project.progress}%`],
        ["Readiness Score", `${project.readinessScore}%`],
        ["목표", text(project.goal)]
      ]
    ),
    "## 아이디어 요약",
    text(project.ideaSummary),
    "## 문제 정의",
    text(project.mainConcern),
    "## 상세 설명",
    text(project.ideaDescription),
    "## 시장조사 리포트",
    project.marketInsights.length
      ? project.marketInsights
          .map((insight) =>
            [
              `### ${insight.title}`,
              `- 분류: ${insight.category}`,
              `- 신뢰도: ${insight.confidenceLevel}`,
              `- AI 추정 여부: ${insight.isAssumption || insight.isAiAssumed ? "AI 추정" : "출처 기반"}`,
              "",
              text(insight.content)
            ].join("\n")
          )
          .join("\n\n")
      : "시장조사 리포트가 없습니다.",
    "## 근거 출처 목록",
    project.researchSources.length
      ? table(
          ["제목", "발행처", "URL", "메모"],
          project.researchSources.map((source) => [source.title, source.publisher ?? "-", source.url, source.notes ?? "-"])
        )
      : "저장된 출처가 없습니다.",
    "## 경쟁사 분석",
    project.competitors.length
      ? table(
          ["경쟁사", "웹사이트", "타깃 고객", "핵심 기능", "가격", "강점", "약점", "차별화"],
          project.competitors.map((competitor) => [
            competitor.name,
            competitor.url ?? "-",
            competitor.targetCustomer ?? "-",
            competitor.coreFeatures.join(", ") || "-",
            competitor.pricing ?? "-",
            competitor.strengths.join(", ") || "-",
            competitor.weaknesses.join(", ") || "-",
            competitor.differentiation ?? "-"
          ])
        )
      : "경쟁사 분석이 없습니다.",
    "## 고객 페르소나",
    project.personas.length
      ? project.personas
          .map((persona) =>
            [
              `### ${persona.name}`,
              `- 세그먼트: ${persona.segment}`,
              `- 설명: ${text(persona.description)}`,
              "",
              "#### Job-to-be-Done",
              list(persona.jobsToBeDone),
              "#### Pain Point",
              list(persona.pains),
              "#### Gain",
              list(persona.gains),
              "#### 구매 동기",
              list(persona.buyingTriggers),
              "#### 반대 이유",
              list(persona.objections),
              "#### 인터뷰 질문",
              list(persona.interviewQuestions)
            ].join("\n")
          )
          .join("\n\n")
      : "고객 페르소나가 없습니다.",
    "## BM Canvas",
    project.bmCanvas
      ? table(
          ["블록", "내용"],
          [
            ["Customer Segments", project.bmCanvas.customerSegments],
            ["Value Propositions", project.bmCanvas.valuePropositions],
            ["Channels", project.bmCanvas.channels],
            ["Customer Relationships", project.bmCanvas.customerRelationships],
            ["Revenue Streams", project.bmCanvas.revenueStreams],
            ["Key Resources", project.bmCanvas.keyResources],
            ["Key Activities", project.bmCanvas.keyActivities],
            ["Key Partners", project.bmCanvas.keyPartners],
            ["Cost Structure", project.bmCanvas.costStructure]
          ]
        )
      : "BM Canvas가 없습니다.",
    "## MVP 계획",
    project.mvpFeatures.length
      ? table(
          ["우선순위", "기능", "설명", "Reach", "Impact", "Confidence", "Effort", "RICE", "MoSCoW"],
          project.mvpFeatures.map((feature) => [
            `${feature.priority}`,
            feature.title,
            feature.description ?? "-",
            `${feature.reach}`,
            `${feature.impact}`,
            `${feature.confidence}`,
            `${feature.effort}`,
            `${feature.riceScore}`,
            feature.moscowCategory
          ])
        )
      : "MVP 계획이 없습니다.",
    "## 검증 실험 계획",
    project.hypotheses.length
      ? project.hypotheses
          .map((hypothesis, index) =>
            [
              `### 실험 ${index + 1}`,
              `- 가설: ${hypothesis.hypothesis}`,
              `- 방법: ${hypothesis.method}`,
              `- 성공 기준: ${hypothesis.successMetric}`,
              `- 필요한 데이터: ${hypothesis.requiredData}`,
              `- 예상 비용: ${hypothesis.estimatedCost}`,
              `- 실패 시 피벗 기준: ${hypothesis.pivotCriteria}`,
              `- 일정: ${hypothesis.timeline}`
            ].join("\n")
          )
          .join("\n\n")
      : "검증 실험 계획이 없습니다.",
    "## 사업계획서 초안",
    project.businessPlan.length
      ? project.businessPlan
          .map((section) => [`### ${section.order}. ${section.title}`, planContent(section)].join("\n\n"))
          .join("\n\n")
      : "사업계획서 초안이 없습니다.",
    "## IR One-Pager",
    project.irOnePager
      ? table(
          ["항목", "내용"],
          [
            ["Problem", text(project.irOnePager.problem)],
            ["Solution", text(project.irOnePager.solution)],
            ["Customer", text(project.irOnePager.customer)],
            ["Market", text(project.irOnePager.market)],
            ["Product", text(project.irOnePager.product)],
            ["Business Model", text(project.irOnePager.businessModel)],
            ["Competition", text(project.irOnePager.competition)],
            ["Go-to-Market", text(project.irOnePager.goToMarket)],
            ["Traction or Validation Plan", text(project.irOnePager.validationPlan || project.irOnePager.traction)],
            ["Team", text(project.irOnePager.team)],
            ["Ask", text(project.irOnePager.ask)]
          ]
        )
      : "IR One-Pager가 없습니다.",
    "## 랜딩페이지 카피",
    landingCopy
      ? [
          `### Hero headline\n${text(landingCopy.headline)}`,
          `### Hero subheadline\n${text(landingCopy.subheadline)}`,
          `### CTA\n${text(landingCopy.cta)}`,
          `### Problem section\n${text(landingCopy.problemSection)}`,
          `### Solution section\n${text(landingCopy.solutionSection)}`,
          `### Feature section\n${text(landingCopy.featureSection)}`,
          `### Social proof placeholder\n${text(landingCopy.socialProof)}`,
          `### Pricing section copy\n${text(landingCopy.pricingCopy)}`,
          "### FAQ",
          faqItems.length
            ? faqItems
                .map((faq) => {
                  if (!faq || typeof faq !== "object" || !("question" in faq) || !("answer" in faq)) return "";
                  return `- Q. ${String(faq.question)}\n  A. ${String(faq.answer)}`;
                })
                .filter(Boolean)
                .join("\n")
            : "FAQ가 없습니다."
        ].join("\n\n")
      : "랜딩페이지 카피가 없습니다.",
    "## 광고 문구",
    adCopies.length
      ? adCopies
          .map((copy) => {
            const variants = Array.isArray(copy.variants) ? copy.variants.map(String) : copy.body.split("\n");
            return [`### ${copy.channel}`, list(variants)].join("\n");
          })
          .join("\n\n")
      : "광고 문구가 없습니다.",
    "## 면책 문구",
    "본 문서는 FounderOS AI 데모 워크스페이스에서 생성된 초안입니다. 시장 규모, 경쟁사 정보, 고객 반응, 재무적 효과는 실제 고객 인터뷰와 검증 데이터로 보완해야 하며, 출처가 없는 내용은 AI 추정으로 간주해야 합니다."
  ];

  return `${parts.join("\n\n")}\n`;
}
