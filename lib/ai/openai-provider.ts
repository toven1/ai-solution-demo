import { z } from "zod";

import {
  bmCanvasDraftSchema,
  businessPlanDraftsSchema,
  followUpQuestionsSchema,
  irOnePagerDraftSchema,
  marketingCopyDraftSchema,
  mvpFeatureDraftsSchema,
  personaDraftsSchema,
  readinessScoreSchema,
  validationExperimentDraftsSchema
} from "@/lib/ai/schemas";
import type {
  AIProvider,
  AllArtifactsInput,
  BMCanvasDraft,
  BusinessPlanDraft,
  IndustryTemplateInput,
  MarketInsightInput,
  MarketingCopyDraft,
  MVPFeatureDraft,
  PersonaDraft,
  ProjectArtifactsInput,
  ProjectInput,
  ReadinessScore,
  ValidationExperimentDraft
} from "@/lib/ai/types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

function model() {
  return process.env.OPENAI_MODEL || "gpt-4.1-mini";
}

function extractText(payload: any) {
  if (typeof payload.output_text === "string") return payload.output_text;
  const chunks = payload.output
    ?.flatMap((item: any) => item.content ?? [])
    ?.map((content: any) => content.text)
    ?.filter(Boolean);
  return chunks?.join("\n") ?? "";
}

function parseJson(text: string) {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(trimmed);
}

async function callOpenAI<T>(schema: z.ZodSchema<T>, name: string, prompt: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(OPENAI_RESPONSES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: model(),
          instructions:
            "You are FounderOS AI. Return only valid JSON matching the requested contract. Do not wrap JSON in markdown.",
          input: `${prompt}\n\nReturn JSON for contract: ${name}.`,
          temperature: 0.4
        })
      });

      if (!res.ok) {
        throw new Error(`OPENAI_HTTP_${res.status}: ${await res.text()}`);
      }

      const payload = await res.json();
      return schema.parse(parseJson(extractText(payload)));
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`OpenAIProvider output validation failed for ${name}: ${lastError instanceof Error ? lastError.message : "unknown error"}`);
}

function context(project: ProjectInput, extra?: unknown) {
  return JSON.stringify({ project, extra }, null, 2);
}

export const openAIProvider: AIProvider = {
  name: "openai",

  generateFollowupQuestions(projectInput) {
    return callOpenAI(followUpQuestionsSchema, "FollowUpQuestion[]", `${context(projectInput)}\nGenerate 5-7 follow-up questions for founder validation.`);
  },

  generateBusinessPlanSections(project, industryTemplate): Promise<BusinessPlanDraft[]> {
    return callOpenAI(
      businessPlanDraftsSchema,
      "BusinessPlanDraft[]",
      `${context(project, { industryTemplate })}\nGenerate Korean business plan section drafts with sectionKey, title, draft, completenessScore.`
    );
  },

  scoreProjectReadiness(project: ProjectInput, allArtifacts: ProjectArtifactsInput): Promise<ReadinessScore> {
    return callOpenAI(readinessScoreSchema, "ReadinessScore", `${context(project, allArtifacts)}\nScore readiness and progress from 0 to 100.`);
  },

  generatePersonas(project: ProjectInput, marketInsights: MarketInsightInput[], industryTemplate: IndustryTemplateInput | null): Promise<PersonaDraft[]> {
    return callOpenAI(personaDraftsSchema, "PersonaDraft[3]", `${context(project, { marketInsights, industryTemplate })}\nGenerate exactly 3 Korean personas.`);
  },

  generateBMCanvas(project: ProjectInput, personas: PersonaDraft[], industryTemplate: IndustryTemplateInput | null): Promise<BMCanvasDraft> {
    return callOpenAI(bmCanvasDraftSchema, "BMCanvasDraft", `${context(project, { personas, industryTemplate })}\nGenerate a business model canvas.`);
  },

  generateMVPFeatures(project: ProjectInput, bmCanvas: BMCanvasDraft | null, industryTemplate: IndustryTemplateInput | null): Promise<MVPFeatureDraft[]> {
    return callOpenAI(mvpFeatureDraftsSchema, "MVPFeatureDraft[]", `${context(project, { bmCanvas, industryTemplate })}\nGenerate MVP feature candidates with RICE scores.`);
  },

  generateValidationExperiments(project: ProjectInput, mvpFeatures: MVPFeatureDraft[], personas: PersonaDraft[]): Promise<ValidationExperimentDraft[]> {
    return callOpenAI(
      validationExperimentDraftsSchema,
      "ValidationExperimentDraft[]",
      `${context(project, { mvpFeatures, personas })}\nGenerate validation experiments.`
    );
  },

  generateIROnePager(project: ProjectInput, allArtifacts: AllArtifactsInput) {
    return callOpenAI(irOnePagerDraftSchema, "IROnePagerDraft", `${context(project, allArtifacts)}\nGenerate an IR one-pager in Korean.`);
  },

  generateMarketingCopy(project: ProjectInput, personas: PersonaDraft[], industryTemplate: IndustryTemplateInput | null): Promise<MarketingCopyDraft> {
    return callOpenAI(
      marketingCopyDraftSchema,
      "MarketingCopyDraft",
      `${context(project, { personas, industryTemplate })}\nGenerate landing page copy and ad copy. Reflect marketingToneGuide.`
    );
  }
};
