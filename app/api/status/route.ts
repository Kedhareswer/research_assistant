import { NextResponse } from "next/server"

export async function GET() {
  const status = {
    groq: !!process.env.GROQ_API_KEY,
    gemini: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    langSearch: !!process.env.LANGSEARCH_API_KEY,
    brave: !!process.env.BRAVE_API_KEY,
    googleSearch: !!process.env.GOOGLE_SEARCH_API_KEY && !!process.env.GOOGLE_SEARCH_CSE_ID,
    openalex: !!process.env.OPENALEX_MAILTO,
    crossref: !!process.env.CROSSREF_MAILTO,
    arxiv: true, // public API, no key required
    europepmc: true, // public API, no key required
  }

  return NextResponse.json(status)
}
