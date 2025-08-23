import { normalizeCrossrefResponse } from '@/lib/normalizers'
import type { PagedPapers } from '@/lib/types'

const CROSSREF_BASE = 'https://api.crossref.org'

function getMailto() {
  return process.env.CROSSREF_MAILTO || undefined
}

export async function crossrefWorksSearch(params: { query: string; cursor?: string; rows?: number; filter?: string }): Promise<PagedPapers> {
  const { query, cursor, rows = 25, filter } = params
  const url = new URL(`${CROSSREF_BASE}/works`)
  url.searchParams.set('query', query)
  url.searchParams.set('rows', String(Math.max(1, Math.min(rows, 200))))
  if (filter) url.searchParams.set('filter', filter)
  if (cursor) {
    url.searchParams.set('cursor', cursor)
  } else {
    url.searchParams.set('cursor', '*')
  }
  const mailto = getMailto()
  if (mailto) url.searchParams.set('mailto', mailto)

  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'User-Agent': mailto ? `research-assistant (${mailto})` : 'research-assistant',
    },
    method: 'GET',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Crossref works error ${res.status}: ${res.statusText} ${body}`)
  }

  const data = await res.json()
  return normalizeCrossrefResponse(data)
}
