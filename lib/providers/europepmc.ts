import { normalizeEuropePmcResponse } from '@/lib/normalizers'
import type { PagedPapers } from '@/lib/types'

const EPMC_BASE = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search'

export async function europePmcSearch(params: { query: string; cursor?: string; pageSize?: number; resultType?: 'lite'|'core' }): Promise<PagedPapers> {
  const { query, cursor, pageSize = 25, resultType = 'core' } = params
  const url = new URL(EPMC_BASE)
  url.searchParams.set('query', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('pageSize', String(Math.max(1, Math.min(pageSize, 100))))
  url.searchParams.set('resultType', resultType)
  url.searchParams.set('cursorMark', cursor || '*')

  const res = await fetch(url.toString(), { method: 'GET' })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Europe PMC error ${res.status}: ${res.statusText} ${body}`)
  }
  const data = await res.json()
  return normalizeEuropePmcResponse(data)
}
