import { normalizeArxivResponse } from '@/lib/normalizers'
import type { PagedPapers } from '@/lib/types'

const ARXIV_BASE = 'https://export.arxiv.org/api/query'

function textBetween(xml: string, tag: string): string | undefined {
  const m = xml.match(new RegExp(`<${tag}>([\s\S]*?)<\/${tag}>`, 'i'))
  return m ? m[1].trim() : undefined
}

function collectAll(xml: string, pattern: RegExp): string[] {
  const out: string[] = []
  let m
  while ((m = pattern.exec(xml)) !== null) out.push(m[1])
  return out
}

function parseArxivAtom(xml: string): { entries: any[]; total?: number } {
  const totalMatch = xml.match(/<opensearch:totalResults>(\d+)<\/opensearch:totalResults>/i)
  const total = totalMatch ? parseInt(totalMatch[1], 10) : undefined
  const entries: any[] = []
  const entryRe = /<entry>([\s\S]*?)<\/entry>/gi
  let m
  while ((m = entryRe.exec(xml)) !== null) {
    const entryXml = m[1]
    const id = textBetween(entryXml, 'id') || ''
    const title = (textBetween(entryXml, 'title') || '').replace(/\s+/g, ' ').trim()
    const summary = (textBetween(entryXml, 'summary') || '').replace(/\s+/g, ' ').trim()
    const published = textBetween(entryXml, 'published')
    const authors = collectAll(entryXml, /<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/gi).map(s => s.replace(/\s+/g, ' ').trim())
    // Find a PDF link
    let pdfUrl: string | undefined
    const linkRe = /<link[^>]+href="([^"]+)"[^>]*?\/>/gi
    let lm
    while ((lm = linkRe.exec(entryXml)) !== null) {
      const href = lm[1]
      if (/\.pdf($|\?)/i.test(href) || /arxiv\.org\/pdf\//i.test(href)) {
        pdfUrl = href
        break
      }
    }
    entries.push({ id, title, summary, published, authors, pdfUrl })
  }
  return { entries, total }
}

export async function arxivSearch(params: { query: string; start?: number; maxResults?: number; sortBy?: 'relevance'|'lastUpdatedDate'|'submittedDate'; sortOrder?: 'ascending'|'descending' }): Promise<PagedPapers> {
  const { query, start = 0, maxResults = 25, sortBy, sortOrder } = params
  const url = new URL(ARXIV_BASE)
  url.searchParams.set('search_query', query)
  url.searchParams.set('start', String(Math.max(0, start)))
  url.searchParams.set('max_results', String(Math.max(1, Math.min(maxResults, 200))))
  if (sortBy) url.searchParams.set('sortBy', sortBy)
  if (sortOrder) url.searchParams.set('sortOrder', sortOrder)

  const res = await fetch(url.toString(), { method: 'GET' })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`arXiv error ${res.status}: ${res.statusText} ${body}`)
  }
  const xml = await res.text()
  const { entries, total } = parseArxivAtom(xml)
  return normalizeArxivResponse({ entries, total, start, perPage: maxResults })
}
