import { Lightbulb } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type IndustryGuidePanelProps = {
  template?: {
    industryName: string;
    commonCustomerSegments: string[];
    commonBusinessModels: string[];
    keyMetrics: string[];
    commonRisks: string[];
    recommendedValidationMethods: string[];
    businessPlanWritingGuide: string;
    marketingToneGuide: string;
  } | null;
};

export function IndustryGuidePanel({ template }: IndustryGuidePanelProps) {
  if (!template) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>업종별 가이드</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-textSub">프로젝트에 연결된 업종 템플릿이 없습니다. 상세 수정에서 업종을 다시 선택하세요.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <aside className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-accentStrong" />
            {template.industryName} 가이드
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <GuideList title="일반적인 고객 세그먼트" items={template.commonCustomerSegments} />
          <GuideList title="일반적인 수익모델" items={template.commonBusinessModels} />
          <GuideList title="핵심 지표" items={template.keyMetrics} />
          <GuideList title="흔한 리스크" items={template.commonRisks} />
          <GuideList title="추천 검증 방법" items={template.recommendedValidationMethods} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">작성 가이드</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm leading-6 text-textSub">
          <div>
            <div className="mb-1 font-medium text-text">사업계획서</div>
            <p>{template.businessPlanWritingGuide}</p>
          </div>
          <div>
            <div className="mb-1 font-medium text-text">마케팅 톤</div>
            <p>{template.marketingToneGuide}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI 사용 팁</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-textSub">
            AI 초안은 업종 템플릿과 프로젝트 상세 정보를 함께 사용합니다. 출처가 없는 분석은 반드시 AI 추정으로 표시합니다.
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}

function GuideList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-textFaint">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-md bg-surface px-2 py-1 text-xs text-textSub">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
