import type { ProjectStage } from "@prisma/client";

export const demoProjectFallback = {
  id: "demo-project-ai-academy",
  title: "동네 학원을 위한 AI 상담·학습 리포트 자동화 SaaS",
  ideaSummary: "학원 상담 기록과 학습 데이터를 바탕으로 학부모 상담 리포트와 학생별 학습 피드백을 자동 생성하는 SaaS",
  industry: "교육",
  targetCustomer: "초중등 보습학원 원장과 상담 실장",
  stage: "IDEA" as ProjectStage,
  progress: 18,
  readinessScore: 42,
  updatedAt: new Date()
};

export const industryFallback = [
  "SaaS",
  "커머스",
  "교육",
  "헬스케어",
  "로컬서비스",
  "콘텐츠/미디어",
  "AI/데이터",
  "제조/하드웨어"
];
