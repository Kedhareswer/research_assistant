interface LangSearchConfig {
  apiKey: string
  baseUrl: string
}

interface WebSearchOptions {
  query: string
  count?: number
  freshness?: "day" | "week" | "month" | "year" | "noLimit"
  summary?: boolean
  country?: string
  language?: string
}

interface RerankOptions {
  model?: string
  query: string
  documents: Array<{
    id: string
    text: string
    metadata?: Record<string, any>
  }>
  top_n?: number
  return_documents?: boolean
}

interface WebSearchResult {
  title: string
  url: string
  content: string
  snippet: string
  published_date?: string
  domain: string
  images?: string[]
  videos?: string[]
}

interface RerankResult {
  results: Array<{
    document: {
      id: string
      text: string
      metadata?: Record<string, any>
    }
    relevance_score: number
    index: number
  }>
}

export class LangSearchClient {
  private config: LangSearchConfig

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: "https://api.langsearch.com/v1",
    }
  }

  async webSearch(options: WebSearchOptions): Promise<{ results: WebSearchResult[]; summary?: string }> {
    const { query, count = 10, freshness = "noLimit", summary = true, country = "US", language = "en" } = options

    try {
      const response = await fetch(`${this.config.baseUrl}/web-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          query,
          count,
          freshness,
          summary,
          country,
          language,
        }),
      })

      if (!response.ok) {
        throw new Error(`LangSearch Web Search API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("LangSearch web search error:", error)
      throw error
    }
  }

  async rerank(options: RerankOptions): Promise<RerankResult> {
    const { model = "langsearch-reranker-v1", query, documents, top_n = 10, return_documents = true } = options

    try {
      const response = await fetch(`${this.config.baseUrl}/rerank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          query,
          documents,
          top_n,
          return_documents,
        }),
      })

      if (!response.ok) {
        throw new Error(`LangSearch Rerank API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("LangSearch rerank error:", error)
      throw error
    }
  }

  async academicSearch(
    query: string,
    options?: Partial<WebSearchOptions>,
  ): Promise<{ results: WebSearchResult[]; summary?: string }> {
    // Enhanced academic search with domain filtering
    const academicQuery = `${query} (site:arxiv.org OR site:scholar.google.com OR site:pubmed.ncbi.nlm.nih.gov OR site:ieee.org OR site:acm.org OR site:springer.com OR site:sciencedirect.com OR site:jstor.org)`

    return this.webSearch({
      query: academicQuery,
      freshness: "year", // Academic papers are usually more recent
      ...options,
    })
  }

  async newsSearch(
    query: string,
    options?: Partial<WebSearchOptions>,
  ): Promise<{ results: WebSearchResult[]; summary?: string }> {
    const newsQuery = `${query} (site:reuters.com OR site:bbc.com OR site:cnn.com OR site:npr.org OR site:apnews.com OR site:theguardian.com OR site:nytimes.com OR site:wsj.com)`

    return this.webSearch({
      query: newsQuery,
      freshness: "week", // News should be recent
      ...options,
    })
  }

  async hybridSearch(
    query: string,
    options?: Partial<WebSearchOptions>,
  ): Promise<{
    webResults: WebSearchResult[]
    academicResults: WebSearchResult[]
    rerankedResults: WebSearchResult[]
    summary?: string
  }> {
    try {
      // Perform parallel searches
      const [webSearch, academicSearch] = await Promise.all([
        this.webSearch({ query, ...options }),
        this.academicSearch(query, options),
      ])

      // Combine results for reranking
      const combinedResults = [
        ...webSearch.results.map((r, i) => ({ ...r, id: `web-${i}`, source: "web" })),
        ...academicSearch.results.map((r, i) => ({ ...r, id: `academic-${i}`, source: "academic" })),
      ]

      // Prepare documents for reranking
      const documents = combinedResults.map((result) => ({
        id: result.id,
        text: `${result.title} ${result.snippet || result.content.substring(0, 500)}`,
        metadata: {
          url: result.url,
          domain: result.domain,
          source: result.source,
          published_date: result.published_date,
        },
      }))

      // Rerank combined results
      const reranked = await this.rerank({
        query,
        documents,
        top_n: Math.min(15, combinedResults.length),
      })

      // Map reranked results back to original format
      const rerankedResults = reranked.results.map((result) => {
        const originalResult = combinedResults.find((r) => r.id === result.document.id)!
        return {
          ...originalResult,
          relevance_score: result.relevance_score,
        }
      })

      return {
        webResults: webSearch.results,
        academicResults: academicSearch.results,
        rerankedResults,
        summary: webSearch.summary || academicSearch.summary,
      }
    } catch (error) {
      console.error("Hybrid search error:", error)
      throw error
    }
  }
}

// Singleton instance
export const langSearchClient = new LangSearchClient(process.env.LANGSEARCH_API_KEY || "")
