import { NextRequest, NextResponse } from 'next/server'
import { searchService } from '@/lib/search-service'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const q = searchParams.get('q') || searchParams.get('query') || ''
    if (!q || q.trim().length === 0) {
      return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 })
    }
    const cursor = searchParams.get('cursor') || undefined
    const perPageParam = searchParams.get('perPage') || searchParams.get('per-page')
    const perPage = perPageParam ? Math.min(200, Math.max(1, parseInt(perPageParam, 10) || 25)) : 25
    const filter = searchParams.get('filter') || undefined

    const result = await searchService.openAlexWorksSearch(q, { cursor, perPage, filter })
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('OpenAlex works route error:', err)
    return NextResponse.json({ error: err?.message || 'OpenAlex works error' }, { status: 500 })
  }
}
