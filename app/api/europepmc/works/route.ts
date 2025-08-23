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
    const pageSizeParam = searchParams.get('pageSize') || searchParams.get('perPage')
    const pageSize = pageSizeParam ? Math.min(100, Math.max(1, parseInt(pageSizeParam, 10) || 25)) : 25

    const result = await searchService.europePmcWorks(q, { cursor, pageSize })
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Europe PMC works route error:', err)
    return NextResponse.json({ error: err?.message || 'Europe PMC works error' }, { status: 500 })
  }
}
