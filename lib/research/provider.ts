import { mockResearchProvider } from "./mock-provider";
import { serperProvider } from "./serper-provider";
import { tavilyProvider } from "./tavily-provider";
import type { ResearchProvider } from "./types";

export function getResearchProvider(): ResearchProvider {
  const provider = process.env.RESEARCH_PROVIDER?.toLowerCase() ?? "mock";

  if (provider === "tavily" && (process.env.TAVILY_API_KEY || process.env.RESEARCH_API_KEY)) {
    return tavilyProvider;
  }

  if (provider === "serper" && (process.env.SERPER_API_KEY || process.env.RESEARCH_API_KEY)) {
    return serperProvider;
  }

  return mockResearchProvider;
}
