import { Paper, PaperConcept, PagedPapers } from '@/lib/types'

function reconstructAbstractFromInvertedIndex(index?: Record<string, number[]>): string | undefined {
  if (!index) return undefined
  const positions: Array<{ pos: number; word: string }> = []
  for (const [word, inds] of Object.entries(index)) {
    for (const pos of inds) positions.push({ pos, word })
  }
  positions.sort((a, b) => a.pos - b.pos)
  return positions.map(p => p.word).join(' ')
}

export function normalizeOpenAlexWork(work: any): Paper {
  const doi = work.doi?.replace(/^https?:\/\/doi\.org\//, '') || undefined
  const authors: string[] = Array.isArray(work.authorships)
    ? work.authorships.map((a: any) => a?.author?.display_name).filter(Boolean)
    : []

  const venue = work.host_venue?.display_name
    || work.primary_location?.source?.display_name
    || work.primary_location?.venue?.display_name
    || undefined

  const landing = work.primary_location?.landing_page_url
    || work.open_access?.oa_url
    || (doi ? `https://doi.org/${doi}` : undefined)

  const pdfUrl = work.primary_location?.pdf_url
    || work.open_access?.oa_url
    || undefined

  const concepts: PaperConcept[] | undefined = Array.isArray(work.concepts)
    ? work.concepts.map((c: any) => ({ id: c.id, name: c.display_name, score: c.score }))
    : undefined

  const abstract = work.abstract || reconstructAbstractFromInvertedIndex(work.abstract_inverted_index)

  return {
    id: work.id,
    doi,
    title: work.display_name || work.title || 'Untitled',
    abstract,
    authors,
    year: work.publication_year || (work.from_publication_date ? Number(String(work.from_publication_date).slice(0, 4)) : undefined),
    publishedAt: work.publication_date || work.from_publication_date || undefined,
    venue,
    url: landing,
    pdfUrl,
    source: 'openalex',
    openAccess: work.open_access?.is_oa ?? undefined,
    citationsCount: work.cited_by_count ?? undefined,
    referencedByCount: work.referenced_works_count ?? (Array.isArray(work.referenced_works) ? work.referenced_works.length : undefined),
    concepts,
  }
}

export function normalizeOpenAlexResponse(data: any): PagedPapers {
  const results = Array.isArray(data.results) ? data.results : []
  return {
    papers: results.map(normalizeOpenAlexWork),
    nextCursor: data.meta?.next_cursor ?? null,
    totalCount: data.meta?.count,
  }
}

// Crossref normalizers
export function normalizeCrossrefItem(item: any): Paper {
  const doi: string | undefined = item.DOI || undefined
  const authors: string[] = Array.isArray(item.author)
    ? item.author.map((a: any) => [a.given, a.family].filter(Boolean).join(' ').trim()).filter(Boolean)
    : []

  const title = Array.isArray(item.title) ? item.title[0] : item.title || 'Untitled'
  const abstract = typeof item.abstract === 'string' ? item.abstract.replace(/^<jats:p>/i, '').replace(/<[^>]+>/g, ' ').trim() : undefined
  const year = Array.isArray(item.issued?.['date-parts']) ? item.issued['date-parts'][0]?.[0] : undefined
  const publishedAt = Array.isArray(item.created?.['date-time']) ? item.created['date-time'] : item.created?.['date-time'] || undefined
  const venue = Array.isArray(item['container-title']) ? item['container-title'][0] : item['container-title'] || undefined
  const url = item.URL || (doi ? `https://doi.org/${doi}` : undefined)
  const isOa = item['license'] && Array.isArray(item['license']) ? true : undefined

  return {
    id: doi ? `https://doi.org/${doi}` : (url || title),
    doi,
    title,
    abstract,
    authors,
    year,
    publishedAt,
    venue,
    url,
    pdfUrl: undefined,
    source: 'crossref',
    openAccess: isOa,
    citationsCount: item['is-referenced-by-count'] ?? undefined,
    referencedByCount: undefined,
    concepts: undefined,
  }
}

export function normalizeCrossrefResponse(data: any): PagedPapers {
  const items = Array.isArray(data?.message?.items) ? data.message.items : []
  const nextCursor = data?.message?.['next-cursor'] || null
  const total = data?.message?.['total-results'] || undefined
  return {
    papers: items.map(normalizeCrossrefItem),
    nextCursor,
    totalCount: total,
  }
}

// arXiv normalizers (provider passes parsed entries)
export function normalizeArxivEntry(entry: {
  id: string
  title: string
  summary?: string
  authors: string[]
  published?: string
  pdfUrl?: string
}): Paper {
  const year = entry.published ? new Date(entry.published).getFullYear() : undefined
  return {
    id: entry.id,
    doi: undefined,
    title: entry.title || 'Untitled',
    abstract: entry.summary,
    authors: entry.authors || [],
    year,
    publishedAt: entry.published,
    venue: 'arXiv',
    url: entry.id,
    pdfUrl: entry.pdfUrl,
    source: 'arxiv',
    openAccess: true,
    citationsCount: undefined,
    referencedByCount: undefined,
    concepts: undefined,
  }
}

export function normalizeArxivResponse(params: { entries: any[]; total?: number; start: number; perPage: number }): PagedPapers {
  const { entries, total, start, perPage } = params
  const papers = entries.map(normalizeArxivEntry)
  const nextCursor = total !== undefined && start + entries.length < total ? String(start + perPage) : null
  return { papers, nextCursor, totalCount: total }
}

// Europe PMC normalizers
export function normalizeEuropePmcItem(item: any): Paper {
  const doi = item.doi || undefined
  const authors = item.authorString ? String(item.authorString).split(',').map((s: string) => s.trim()).filter(Boolean) : []
  const pdfUrl = Array.isArray(item.fullTextUrlList?.fullTextUrl)
    ? (item.fullTextUrlList.fullTextUrl.find((u: any) => /pdf/i.test(u.documentStyle || u.availability || u.url))?.url)
    : undefined
  const year = item.pubYear ? Number(item.pubYear) : undefined
  const landing = item.id && item.source ? `https://europepmc.org/abstract/${item.source}/${item.id}` : (item.pageInfo || undefined)

  return {
    id: doi ? `https://doi.org/${doi}` : (item.id ? `europepmc:${item.id}` : (item.title || 'unknown')),
    doi,
    title: item.title || 'Untitled',
    abstract: item.abstractText || undefined,
    authors,
    year,
    publishedAt: item.firstPublicationDate || undefined,
    venue: item.journalTitle || item.bookOrReportDetails || undefined,
    url: landing,
    pdfUrl,
    source: 'europepmc',
    openAccess: item.isOpenAccess === 'Y' ? true : (item.isOpenAccess === 'N' ? false : undefined),
    citationsCount: item.citedByCount ?? undefined,
    referencedByCount: undefined,
    concepts: undefined,
  }
}

export function normalizeEuropePmcResponse(data: any): PagedPapers {
  const items = Array.isArray(data?.resultList?.result) ? data.resultList.result : []
  const nextCursor = data?.nextCursorMark || null
  const total = data?.hitCount || undefined
  return {
    papers: items.map(normalizeEuropePmcItem),
    nextCursor,
    totalCount: total,
  }
}
