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
    const rowsParam = searchParams.get('rows') || searchParams.get('perPage') || undefined
    const rows = rowsParam ? Math.min(200, Math.max(1, parseInt(rowsParam, 10) || 25)) : 25
    const filter = searchParams.get('filter') || undefined

    const result = await searchService.crossrefWorks(q, { cursor, rows, filter })
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Crossref works route error:', err)
    return NextResponse.json({ error: err?.message || 'Crossref works error' }, { status: 500 })
  }
}
