interface LangSearchConfig {
  apiKey: string
  baseUrl: string
}

interface SearchOptions {
  query: string
  numResults?: number
  searchType?: "web" | "academic" | "news"
  includeDomains?: string[]
  excludeDomains?: string[]
  language?: string
  country?: string
  safeSearch?: boolean
  rerank?: boolean
}

interface RerankOptions {
  query: string
  documents: Array<{
    id: string
    text: string
    metadata?: Record<string, any>
  }>
  topK?: number
}

export class LangSearchClient {
  private config: LangSearchConfig

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: "https://api.langsearch.com/v1",
    }
  }

  async search(options: SearchOptions) {
    const {
      query,
      numResults = 10,
      searchType = "web",
      includeDomains = [],
      excludeDomains = [],
      language = "en",
      country = "US",
      safeSearch = true,
      rerank = true,
    } = options

    try {
      const response = await fetch(`${this.config.baseUrl}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          query,
          num_results: numResults,
          search_type: searchType,
          include_domains: includeDomains,
          exclude_domains: excludeDomains,
          language,
          country,
          safe_search: safeSearch,
          rerank,
        }),
      })

      if (!response.ok) {
        throw new Error(`LangSearch API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("LangSearch search error:", error)
      throw error
    }
  }

  async rerank(options: RerankOptions) {
    const { query, documents, topK = 10 } = options

    try {
      const response = await fetch(`${this.config.baseUrl}/rerank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          query,
          documents,
          top_k: topK,
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

  async academicSearch(query: string, options?: Partial<SearchOptions>) {
    return this.search({
      query,
      searchType: "academic",
      includeDomains: [
        "arxiv.org",
        "scholar.google.com",
        "pubmed.ncbi.nlm.nih.gov",
        "ieee.org",
        "acm.org",
        "springer.com",
        "sciencedirect.com",
        "jstor.org",
      ],
      ...options,
    })
  }

  async newsSearch(query: string, options?: Partial<SearchOptions>) {
    return this.search({
      query,
      searchType: "news",
      includeDomains: ["reuters.com", "bbc.com", "cnn.com", "npr.org", "apnews.com", "theguardian.com"],
      ...options,
    })
  }
}

// Singleton instance
export const langSearchClient = new LangSearchClient(process.env.LANGSEARCH_API_KEY || "")
