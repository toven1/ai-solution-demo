import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(2, "프로젝트명을 입력하세요."),
  ideaSummary: z.string().min(10, "아이디어 요약을 10자 이상 입력하세요."),
  ideaDescription: z.string().min(20, "아이디어 설명을 20자 이상 입력하세요."),
  industry: z.string().min(1, "업종을 선택하세요."),
  targetCustomer: z.string().min(2, "목표 고객을 입력하세요."),
  goal: z.string().min(5, "이번 검증 목표를 입력하세요."),
  teamSize: z.coerce.number().int().min(1).max(100),
  availableResources: z.string().min(2, "현재 활용 가능한 자원을 입력하세요."),
  mainConcern: z.string().min(2, "가장 큰 걱정이나 리스크를 입력하세요.")
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial().extend({
  progress: z.coerce.number().int().min(0).max(100).optional(),
  readinessScore: z.coerce.number().int().min(0).max(100).optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
