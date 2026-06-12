import { mockAIProvider } from "./mock-provider";
import { openAIProvider } from "./openai-provider";
import type { AIProvider } from "./types";

export function getAIProvider(): AIProvider {
  if (process.env.OPENAI_API_KEY?.trim()) {
    return openAIProvider;
  }

  return mockAIProvider;
}
