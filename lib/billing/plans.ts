export const billingPlans = [
  {
    key: "starter",
    name: "Starter",
    priceKrw: 29000,
    credits: 500,
    description: "초기 아이디어 검증과 문서 export를 시작하는 개인 창업자용",
    features: ["프로젝트 3개", "Mock/AI 생성", "Markdown/DOCX Export", "멘토 공유 링크"]
  },
  {
    key: "pro",
    name: "Pro",
    priceKrw: 79000,
    credits: 2000,
    description: "여러 아이디어를 동시에 검증하는 초기 팀용",
    features: ["프로젝트 20개", "고급 리서치 provider", "버전관리", "관리자 대시보드"]
  },
  {
    key: "studio",
    name: "Studio",
    priceKrw: 199000,
    credits: 7000,
    description: "멘토링 조직과 액셀러레이터 데모 운영용",
    features: ["프로젝트 무제한", "팀 단위 관리", "우선 지원", "커스텀 템플릿"]
  }
] as const;

export function getPlan(key: string) {
  return billingPlans.find((plan) => plan.key === key) ?? billingPlans[0];
}
