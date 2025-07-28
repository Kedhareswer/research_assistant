import { groq } from "@ai-sdk/groq"
import { google } from "@ai-sdk/google"

export const AI_MODELS = {
  // Updated Groq models (current as of 2024)
  GROQ_LARGE: groq("llama-3.3-70b-versatile"), // For comprehensive analysis
  GROQ_FAST: groq("llama-3.3-70b-specdec"), // For quick tasks with good quality
  GROQ_MEDIUM: groq("llama-3.1-8b-instant"), // For balanced performance

  // Google Gemini models
  GEMINI_PRO: google("gemini-1.5-pro"), // For complex reasoning
  GEMINI_FLASH: google("gemini-1.5-flash"), // For fast responses
} as const

export const AI_TASKS = {
  RESEARCH_SUMMARY: "GROQ_LARGE",
  CITATION_FORMATTING: "GEMINI_PRO",
  INSIGHTS_EXTRACTION: "GROQ_FAST",
  RELATED_TOPICS: "GEMINI_FLASH",
  CONTENT_ANALYSIS: "GROQ_MEDIUM",
} as const

export function getModelForTask(task: keyof typeof AI_TASKS) {
  const modelKey = AI_TASKS[task] as keyof typeof AI_MODELS
  return AI_MODELS[modelKey]
}

export const SEARCH_CONFIG = {
  DEFAULT_RESULTS: 10,
  LANGSEARCH_FRESHNESS: "month" as const,
  RERANK_TOP_K: 10,
  ACADEMIC_DOMAINS: [
    "arxiv.org",
    "scholar.google.com",
    "pubmed.ncbi.nlm.nih.gov",
    "ieee.org",
    "acm.org",
    "springer.com",
    "sciencedirect.com",
    "jstor.org",
    "researchgate.net",
  ],
  EXCLUDED_DOMAINS: ["facebook.com", "twitter.com", "instagram.com", "tiktok.com", "pinterest.com"],
  BRAVE_SEARCH_PARAMS: {
    country: "US",
    search_lang: "en",
    ui_lang: "en-US",
  },
  LANGSEARCH_MODEL: "langsearch-reranker-v1",
}
