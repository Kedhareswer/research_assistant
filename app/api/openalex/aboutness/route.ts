import { NextRequest, NextResponse } from 'next/server'
import { searchService } from '@/lib/search-service'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const title = searchParams.get('title') || undefined
    const abstract = searchParams.get('abstract') || undefined
    const fulltext = searchParams.get('fulltext') || undefined

    if (!title && !abstract && !fulltext) {
      return NextResponse.json({ error: 'Provide at least one of: title, abstract, fulltext' }, { status: 400 })
    }

    const result = await searchService.openAlexAboutness({ title, abstract, fulltext })
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('OpenAlex aboutness route error:', err)
    return NextResponse.json({ error: err?.message || 'OpenAlex aboutness error' }, { status: 500 })
  }
}
