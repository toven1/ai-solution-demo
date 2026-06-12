import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from "docx";

import type { ExportProjectPackage } from "@/lib/export/package";

function value(text?: string | null) {
  return text?.trim() || "작성된 내용이 없습니다.";
}

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_2) {
  return new Paragraph({
    heading: level,
    spacing: { before: 280, after: 120 },
    children: [new TextRun(text)]
  });
}

function paragraph(text: string) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun(value(text))]
  });
}

function bullet(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new TextRun(value(text))]
  });
}

function cell(text: string, bold = false) {
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [new TextRun({ text: value(text), bold })]
      })
    ]
  });
}

function table(headers: string[], rows: string[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: headers.map((header) => cell(header, true))
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map((item) => cell(item))
          })
      )
    ]
  });
}

function listParagraphs(values?: string[] | null) {
  if (!values || values.length === 0) return [bullet("작성된 내용이 없습니다.")];
  return values.map((item) => bullet(item));
}

function planContent(section: ExportProjectPackage["businessPlan"][number]) {
  return value(section.userContent || section.aiDraft);
}

export async function createPackageDocx(project: ExportProjectPackage) {
  const landingCopy = project.marketingCopy.find((copy) => copy.channel === "landing-page");
  const adCopies = project.marketingCopy.filter((copy) => copy.channel !== "landing-page");
  const faqItems = Array.isArray(landingCopy?.faqs) ? landingCopy.faqs : [];

  const children = [
    heading(project.title, HeadingLevel.TITLE),
    heading("프로젝트 개요"),
    table(
      ["항목", "내용"],
      [
        ["업종", project.industry],
        ["타깃 고객", project.targetCustomer],
        ["단계", project.stage],
        ["팀 규모", `${project.teamSize}명`],
        ["진행률", `${project.progress}%`],
        ["Readiness Score", `${project.readinessScore}%`],
        ["목표", value(project.goal)]
      ]
    ),
    heading("아이디어 요약"),
    paragraph(project.ideaSummary),
    heading("문제 정의"),
    paragraph(project.mainConcern),
    heading("시장조사 리포트"),
    ...(project.marketInsights.length
      ? project.marketInsights.flatMap((insight) => [
          heading(insight.title, HeadingLevel.HEADING_3),
          bullet(`분류: ${insight.category}`),
          bullet(`신뢰도: ${insight.confidenceLevel}`),
          bullet(`AI 추정 여부: ${insight.isAssumption || insight.isAiAssumed ? "AI 추정" : "출처 기반"}`),
          paragraph(insight.content)
        ])
      : [paragraph("시장조사 리포트가 없습니다.")]),
    heading("근거 출처 목록"),
    project.researchSources.length
      ? table(
          ["제목", "발행처", "URL", "메모"],
          project.researchSources.map((source) => [source.title, source.publisher ?? "-", source.url, source.notes ?? "-"])
        )
      : paragraph("저장된 출처가 없습니다."),
    heading("경쟁사 분석"),
    project.competitors.length
      ? table(
          ["경쟁사", "웹사이트", "타깃 고객", "가격", "차별화"],
          project.competitors.map((competitor) => [
            competitor.name,
            competitor.url ?? "-",
            competitor.targetCustomer ?? "-",
            competitor.pricing ?? "-",
            competitor.differentiation ?? "-"
          ])
        )
      : paragraph("경쟁사 분석이 없습니다."),
    heading("고객 페르소나"),
    ...(project.personas.length
      ? project.personas.flatMap((persona) => [
          heading(persona.name, HeadingLevel.HEADING_3),
          bullet(`세그먼트: ${persona.segment}`),
          paragraph(persona.description),
          heading("Job-to-be-Done", HeadingLevel.HEADING_4),
          ...listParagraphs(persona.jobsToBeDone),
          heading("Pain Point", HeadingLevel.HEADING_4),
          ...listParagraphs(persona.pains),
          heading("Gain", HeadingLevel.HEADING_4),
          ...listParagraphs(persona.gains),
          heading("인터뷰 질문", HeadingLevel.HEADING_4),
          ...listParagraphs(persona.interviewQuestions)
        ])
      : [paragraph("고객 페르소나가 없습니다.")]),
    heading("BM Canvas"),
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
      : paragraph("BM Canvas가 없습니다."),
    heading("MVP 계획"),
    project.mvpFeatures.length
      ? table(
          ["우선순위", "기능", "설명", "RICE", "MoSCoW"],
          project.mvpFeatures.map((feature) => [
            `${feature.priority}`,
            feature.title,
            feature.description ?? "-",
            `${feature.riceScore}`,
            feature.moscowCategory
          ])
        )
      : paragraph("MVP 계획이 없습니다."),
    heading("검증 실험 계획"),
    ...(project.hypotheses.length
      ? project.hypotheses.flatMap((hypothesis, index) => [
          heading(`실험 ${index + 1}`, HeadingLevel.HEADING_3),
          bullet(`가설: ${hypothesis.hypothesis}`),
          bullet(`방법: ${hypothesis.method}`),
          bullet(`성공 기준: ${hypothesis.successMetric}`),
          bullet(`필요한 데이터: ${hypothesis.requiredData}`),
          bullet(`예상 비용: ${hypothesis.estimatedCost}`),
          bullet(`실패 시 피벗 기준: ${hypothesis.pivotCriteria}`)
        ])
      : [paragraph("검증 실험 계획이 없습니다.")]),
    heading("사업계획서 초안"),
    ...(project.businessPlan.length
      ? project.businessPlan.flatMap((section) => [heading(`${section.order}. ${section.title}`, HeadingLevel.HEADING_3), paragraph(planContent(section))])
      : [paragraph("사업계획서 초안이 없습니다.")]),
    heading("IR One-Pager"),
    project.irOnePager
      ? table(
          ["항목", "내용"],
          [
            ["Problem", value(project.irOnePager.problem)],
            ["Solution", value(project.irOnePager.solution)],
            ["Customer", value(project.irOnePager.customer)],
            ["Market", value(project.irOnePager.market)],
            ["Product", value(project.irOnePager.product)],
            ["Business Model", value(project.irOnePager.businessModel)],
            ["Competition", value(project.irOnePager.competition)],
            ["Go-to-Market", value(project.irOnePager.goToMarket)],
            ["Traction or Validation Plan", value(project.irOnePager.validationPlan || project.irOnePager.traction)],
            ["Team", value(project.irOnePager.team)],
            ["Ask", value(project.irOnePager.ask)]
          ]
        )
      : paragraph("IR One-Pager가 없습니다."),
    heading("랜딩페이지 카피"),
    ...(landingCopy
      ? [
          heading("Hero headline", HeadingLevel.HEADING_3),
          paragraph(landingCopy.headline),
          heading("Hero subheadline", HeadingLevel.HEADING_3),
          paragraph(value(landingCopy.subheadline)),
          heading("CTA", HeadingLevel.HEADING_3),
          paragraph(value(landingCopy.cta)),
          heading("Problem section", HeadingLevel.HEADING_3),
          paragraph(value(landingCopy.problemSection)),
          heading("Solution section", HeadingLevel.HEADING_3),
          paragraph(value(landingCopy.solutionSection)),
          heading("Feature section", HeadingLevel.HEADING_3),
          paragraph(value(landingCopy.featureSection)),
          heading("FAQ", HeadingLevel.HEADING_3),
          ...(faqItems.length
            ? faqItems.map((faq) => {
                if (!faq || typeof faq !== "object" || !("question" in faq) || !("answer" in faq)) return bullet("FAQ 형식을 확인하세요.");
                return bullet(`Q. ${String(faq.question)} / A. ${String(faq.answer)}`);
              })
            : [paragraph("FAQ가 없습니다.")])
        ]
      : [paragraph("랜딩페이지 카피가 없습니다.")]),
    heading("광고 문구"),
    ...(adCopies.length
      ? adCopies.flatMap((copy) => {
          const variants = Array.isArray(copy.variants) ? copy.variants.map(String) : copy.body.split("\n");
          return [heading(copy.channel, HeadingLevel.HEADING_3), ...listParagraphs(variants)];
        })
      : [paragraph("광고 문구가 없습니다.")]),
    heading("면책 문구"),
    paragraph("본 문서는 FounderOS AI 데모 워크스페이스에서 생성된 초안입니다. 시장 규모, 경쟁사 정보, 고객 반응, 재무적 효과는 실제 고객 인터뷰와 검증 데이터로 보완해야 하며, 출처가 없는 내용은 AI 추정으로 간주해야 합니다.")
  ];

  const document = new Document({
    sections: [
      {
        properties: {},
        children
      }
    ]
  });

  return Packer.toBuffer(document);
}
