import { PagedPapers } from '@/lib/types'
import { normalizeOpenAlexResponse } from '@/lib/normalizers'

const OPENALEX_BASE = 'https://api.openalex.org'

function getMailto() {
  return process.env.OPENALEX_MAILTO || undefined
}

export async function openalexWorksSearch(params: { query: string; cursor?: string; perPage?: number; filter?: string }): Promise<PagedPapers> {
  const { query, cursor, perPage = 25, filter } = params
  const url = new URL(`${OPENALEX_BASE}/works`)
  url.searchParams.set('search', query)
  url.searchParams.set('per-page', String(Math.max(1, Math.min(perPage, 200))))
  url.searchParams.set('sort', 'relevance_score:desc')
  if (filter) url.searchParams.set('filter', filter)
  if (cursor) url.searchParams.set('cursor', cursor)
  const mailto = getMailto()
  if (mailto) url.searchParams.set('mailto', mailto)

  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'User-Agent': mailto ? `research-assistant (${mailto})` : 'research-assistant',
    },
    // OpenAlex prefers GET; keep it simple
    method: 'GET',
    // next: { revalidate: 60 } // enable caching later if desired
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`OpenAlex works error ${res.status}: ${res.statusText} ${body}`)
  }

  const data = await res.json()
  return normalizeOpenAlexResponse(data)
}

export async function openalexAboutness(input: { title?: string; abstract?: string; fulltext?: string }) {
  const url = new URL(`${OPENALEX_BASE}/text`)
  const mailto = getMailto()
  if (mailto) url.searchParams.set('mailto', mailto)
  if (input.title) url.searchParams.set('title', input.title)
  if (input.abstract) url.searchParams.set('abstract', input.abstract)
  if (input.fulltext) url.searchParams.set('fulltext', input.fulltext)

  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'User-Agent': mailto ? `research-assistant (${mailto})` : 'research-assistant',
    },
    method: 'GET',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`OpenAlex aboutness error ${res.status}: ${res.statusText} ${body}`)
  }

  const data = await res.json()
  return data
}
