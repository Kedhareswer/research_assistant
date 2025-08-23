import { NextRequest, NextResponse } from 'next/server'
import { searchService } from '@/lib/search-service'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const q = searchParams.get('q') || searchParams.get('query') || ''
    if (!q || q.trim().length === 0) {
      return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 })
    }
    const startParam = searchParams.get('start') || searchParams.get('cursor')
    const start = startParam ? Math.max(0, parseInt(startParam, 10) || 0) : 0
    const maxResultsParam = searchParams.get('maxResults') || searchParams.get('perPage')
    const maxResults = maxResultsParam ? Math.min(200, Math.max(1, parseInt(maxResultsParam, 10) || 25)) : 25
    const sortBy = (searchParams.get('sortBy') as any) || undefined
    const sortOrder = (searchParams.get('sortOrder') as any) || undefined

    const result = await searchService.arxivWorks(q, { start, maxResults, sortBy, sortOrder })
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('arXiv works route error:', err)
    return NextResponse.json({ error: err?.message || 'arXiv works error' }, { status: 500 })
  }
}
