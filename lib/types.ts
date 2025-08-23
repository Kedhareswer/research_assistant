export type ProviderId = 'openalex' | 'crossref' | 'arxiv' | 'europepmc'

export interface PaperConcept {
  id?: string
  name: string
  score?: number
}

export interface Paper {
  id: string
  doi?: string
  title: string
  abstract?: string
  authors: string[]
  year?: number
  publishedAt?: string
  venue?: string
  url?: string
  pdfUrl?: string
  source: ProviderId
  openAccess?: boolean
  citationsCount?: number
  referencedByCount?: number
  concepts?: PaperConcept[]
}

export interface PagedPapers {
  papers: Paper[]
  nextCursor: string | null
  totalCount?: number
}
