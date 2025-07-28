import { NextResponse } from "next/server"

export async function GET() {
  const status = {
    groq: !!process.env.GROQ_API_KEY,
    gemini: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    langSearch: !!process.env.LANGSEARCH_API_KEY,
    brave: !!process.env.BRAVE_API_KEY,
  }

  return NextResponse.json(status)
}
