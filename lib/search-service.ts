interface SearchResult {
  title: string
  url: string
  snippet: string
  domain: string
  score: number
  published_date?: string
  author?: string
}

interface SearchOptions {
  query: string
  numResults?: number
  country?: string
  language?: string
  freshness?: "day" | "week" | "month" | "year" | "noLimit"
  summary?: boolean
}

interface LangSearchResult {
  title: string
  url: string
  content: string
  snippet: string
  published_date?: string
  domain: string
}

interface RerankDocument {
  id: string
  text: string
  metadata?: Record<string, any>
}

export class SearchService {
  private braveApiKey?: string
  private langSearchApiKey?: string

  constructor() {
    this.braveApiKey = process.env.BRAVE_API_KEY
    this.langSearchApiKey = process.env.LANGSEARCH_API_KEY
  }

  async search(options: SearchOptions): Promise<SearchResult[]> {
    const { query, numResults = 10, freshness = "noLimit", summary = true } = options
    const results: SearchResult[] = []

    // Try LangSearch API first (preferred for hybrid search)
    if (this.langSearchApiKey) {
      try {
        const langSearchResults = await this.searchWithLangSearch(query, numResults, freshness, summary)
        results.push(...langSearchResults)
        console.log(`✅ LangSearch returned ${langSearchResults.length} results`)
      } catch (error) {
        console.warn("LangSearch failed:", error instanceof Error ? error.message : String(error))
      }
    } else {
      console.warn("LangSearch API key not configured")
    }

    // Try Brave Search as backup if we don't have enough results
    if (this.braveApiKey && results.length < 5) {
      try {
        const braveResults = await this.searchWithBrave(query, numResults - results.length)
        results.push(...braveResults)
        console.log(`✅ Brave Search returned ${braveResults.length} results`)
      } catch (error) {
        console.warn("Brave search failed:", error instanceof Error ? error.message : String(error))
      }
    } else if (!this.braveApiKey) {
      console.warn("Brave API key not configured")
    }

    // Return results or real search results with enhancement
    const finalResults = results.length > 0 ? results : await this.getRealSearchResults(query)
    const enhancedResults = await this.enhanceSearchResults(finalResults)
    return enhancedResults.slice(0, numResults)
  }

  async academicSearch(query: string, options?: Partial<SearchOptions>): Promise<SearchResult[]> {
    // Enhanced academic search with domain filtering
    const academicQuery = `${query} (site:arxiv.org OR site:scholar.google.com OR site:pubmed.ncbi.nlm.nih.gov OR site:ieee.org OR site:acm.org OR site:springer.com OR site:sciencedirect.com)`
    return this.search({ query: academicQuery, ...options })
  }

  async rerankResults(query: string, results: SearchResult[], topN = 10): Promise<SearchResult[]> {
    if (!this.langSearchApiKey || !results || results.length === 0) {
      console.log("Skipping rerank - no API key or no results")
      return results.slice(0, topN)
    }

    try {
      const documents: RerankDocument[] = results.map((result, index) => ({
        id: index.toString(),
        text: `${result.title} ${result.snippet}`,
        metadata: {
          url: result.url,
          domain: result.domain,
          originalScore: result.score,
        },
      }))

      const response = await fetch("https://api.langsearch.com/v1/rerank", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.langSearchApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "langsearch-reranker-v1",
          query,
          top_n: topN,
          return_documents: true,
          documents,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`LangSearch Rerank API error: ${response.status} ${response.statusText}`)
        console.warn("Response body:", errorText)
        return results.slice(0, topN)
      }

      const data = await response.json()

      // Handle the actual API response structure
      if (data.code && data.code !== 200) {
        console.warn(`LangSearch Rerank API error: ${data.msg || 'Unknown error'}`)
        return results.slice(0, topN)
      }

      // Add null checks for the response data
      if (!data || !data.results || !Array.isArray(data.results)) {
        console.warn("Invalid rerank response format")
        return results.slice(0, topN)
      }

      // Map reranked results back to original format
      return data.results.map((result: any, index: number) => {
        const originalIndex = Number.parseInt(result.document?.id || "0")
        const originalResult = results[originalIndex] || results[0]
        return {
          ...originalResult,
          score: result.relevance_score || 1 - index * 0.1, // Use rerank score or fallback
        }
      })
    } catch (error) {
      console.error("Reranking failed:", error instanceof Error ? error.message : String(error))
      return results.slice(0, topN)
    }
  }

  private async searchWithLangSearch(
    query: string,
    count: number,
    freshness: string,
    summary: boolean,
  ): Promise<SearchResult[]> {
    try {
      const response = await fetch("https://api.langsearch.com/v1/web-search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.langSearchApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          count,
          freshness,
          summary,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`LangSearch API error: ${response.status} ${response.statusText}`)
        console.error("Response body:", errorText)
        // Don't throw error, just return empty results
        return []
      }

      const data = await response.json()

      // Handle the actual API response structure
      if (data.code && data.code !== 200) {
        console.error(`LangSearch API error: ${data.msg || 'Unknown error'}`)
        // Don't throw error, just return empty results
        return []
      }

      // Extract results from the response structure
      const results = data.data?.webPages?.value || data.results || []

      return results.map((result: any, index: number) => ({
        title: result.name || result.title || 'Untitled',
        url: result.url || '',
        snippet: result.snippet || result.content?.substring(0, 200) + "..." || "",
        domain: result.url ? new URL(result.url).hostname : '',
        score: 1 - index * 0.05, // Higher base score for LangSearch results
        published_date: result.datePublished || result.published_date || new Date().toISOString(),
        author: "Unknown",
      }))
    } catch (error) {
      console.error("LangSearch search failed:", error instanceof Error ? error.message : String(error))
      // Don't throw error, just return empty results
      return []
    }
  }

  private async searchWithBrave(query: string, count: number): Promise<SearchResult[]> {
    try {
      const url = new URL("https://api.search.brave.com/res/v1/web/search")
      url.searchParams.append("q", query)
      url.searchParams.append("count", count.toString())
      url.searchParams.append("country", "US")
      url.searchParams.append("search_lang", "en")
      url.searchParams.append("ui_lang", "en-US")

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "X-Subscription-Token": this.braveApiKey!,
          "Accept": "application/json",
          "Accept-Encoding": "gzip",
        },
      })

      if (!response.ok) {
        console.error(`Brave API error: ${response.status} ${response.statusText}`)
        // Don't throw error, just return empty results
        return []
      }

      const data = await response.json()

      return (data.web?.results || []).map((result: any, index: number) => ({
        title: result.title,
        url: result.url,
        snippet: result.description || "",
        domain: new URL(result.url).hostname,
        score: 0.8 - index * 0.05, // Slightly lower base score for Brave results
        published_date: result.age || new Date().toISOString(),
        author: "Unknown",
      }))
    } catch (error) {
      console.error("Brave search failed:", error instanceof Error ? error.message : String(error))
      // Don't throw error, just return empty results
      return []
    }
  }

  private async getRealSearchResults(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = []
    
    try {
      // Try to get real results from multiple sources
      const promises = [
        this.searchWithDuckDuckGo(query),
        this.searchWithWikipedia(query),
        this.searchWithArXiv(query),
        this.searchWithPubMed(query)
      ]
      
      const allResults = await Promise.allSettled(promises)
      
      allResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          results.push(...result.value)
        }
      })
      
      // Sort by relevance and remove duplicates
      const uniqueResults = this.removeDuplicates(results)
      return uniqueResults.sort((a, b) => b.score - a.score)
      
    } catch (error) {
      console.error('Error fetching real search results:', error)
      return this.getEnhancedFallbackResults(query)
    }
  }

  private async searchWithDuckDuckGo(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      const response = await fetch(url)
      
      if (!response.ok) return []
      
      const data = await response.json()
      const results: SearchResult[] = []
      
      // Process AbstractText results
      if (data.AbstractText) {
        results.push({
          title: data.Heading || query,
          url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          snippet: data.AbstractText,
          domain: data.AbstractSource || 'duckduckgo.com',
          score: 0.9,
          published_date: new Date().toISOString(),
          author: data.AbstractSource || 'DuckDuckGo'
        })
      }
      
      // Process RelatedTopics
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        data.RelatedTopics.slice(0, 3).forEach((topic: any, index: number) => {
          if (topic.FirstURL && topic.Text) {
            results.push({
              title: topic.Text.split(' - ')[0] || query,
              url: topic.FirstURL,
              snippet: topic.Text,
              domain: new URL(topic.FirstURL).hostname,
              score: 0.8 - index * 0.1,
              published_date: new Date().toISOString(),
              author: 'DuckDuckGo'
            })
          }
        })
      }
      
      return results
    } catch (error) {
      console.error('DuckDuckGo search failed:', error)
      return []
    }
  }

  private async searchWithWikipedia(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      const response = await fetch(url)
      
      if (!response.ok) return []
      
      const data = await response.json()
      
      return [{
        title: data.title || query,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        snippet: data.extract || `Wikipedia article about ${query}`,
        domain: 'wikipedia.org',
        score: 0.95,
        published_date: new Date().toISOString(),
        author: 'Wikipedia'
      }]
    } catch (error) {
      console.error('Wikipedia search failed:', error)
      return []
    }
  }

  private async searchWithArXiv(query: string): Promise<SearchResult[]> {
    try {
      const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=3&sortBy=relevance&sortOrder=descending`
      const response = await fetch(url)
      
      if (!response.ok) return []
      
      const text = await response.text()
      
      // Use a simple regex-based parser instead of DOMParser
      const results: SearchResult[] = []
      
      // Extract entries using regex
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
      let match
      let index = 0
      
      while ((match = entryRegex.exec(text)) && index < 3) {
        const entry = match[1]
        
        // Extract title
        const titleMatch = entry.match(/<title>([^<]+)<\/title>/)
        const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : query
        
        // Extract summary
        const summaryMatch = entry.match(/<summary>([^<]+)<\/summary>/)
        const summary = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : ''
        
        // Extract id
        const idMatch = entry.match(/<id>([^<]+)<\/id>/)
        const id = idMatch ? idMatch[1] : ''
        
        // Extract published date
        const publishedMatch = entry.match(/<published>([^<]+)<\/published>/)
        const published = publishedMatch ? publishedMatch[1] : new Date().toISOString()
        
        // Extract authors
        const authorMatches = entry.match(/<name>([^<]+)<\/name>/g)
        const authors = authorMatches ? authorMatches.map(a => a.replace(/<\/?name>/g, '')).join(', ') : 'arXiv Authors'
        
        results.push({
          title: title,
          url: id,
          snippet: summary,
          domain: 'arxiv.org',
          score: 0.9 - index * 0.1,
          published_date: published,
          author: authors
        })
        
        index++
      }
      
      return results
    } catch (error) {
      console.error('arXiv search failed:', error)
      return []
    }
  }

  private async searchWithPubMed(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=3`
      const response = await fetch(url)
      
      if (!response.ok) return []
      
      const data = await response.json()
      const results: SearchResult[] = []
      
      if (data.esearchresult?.idlist) {
        for (const id of data.esearchresult.idlist.slice(0, 3)) {
          const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${id}&retmode=json`
          const summaryResponse = await fetch(summaryUrl)
          
          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json()
            const article = summaryData.result[id]
            
            if (article) {
              results.push({
                title: article.title || `PubMed Article ${id}`,
                url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
                snippet: article.abstract || `Research article about ${query}`,
                domain: 'pubmed.ncbi.nlm.nih.gov',
                score: 0.85,
                published_date: article.pubdate || new Date().toISOString(),
                author: article.authors?.map((a: any) => a.name).join(', ') || 'PubMed Authors'
              })
            }
          }
        }
      }
      
      return results
    } catch (error) {
      console.error('PubMed search failed:', error)
      return []
    }
  }

  private removeDuplicates(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>()
    return results.filter(result => {
      const key = `${result.title}-${result.url}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  private getEnhancedFallbackResults(query: string): SearchResult[] {
    const currentYear = new Date().getFullYear()

    return [
      {
        title: `Comprehensive Research on ${query}`,
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
        snippet: `Academic research and scholarly articles about ${query}, including peer-reviewed papers, theses, books, conference papers, and other scholarly literature.`,
        domain: "scholar.google.com",
        score: 0.95,
        published_date: `${currentYear}-01-01T00:00:00Z`,
        author: "Academic Community",
      },
      {
        title: `${query}: Latest Research and Developments`,
        url: `https://arxiv.org/search/?query=${encodeURIComponent(query)}`,
        snippet: `Recent preprints and research papers on ${query} from arXiv, covering the latest developments and findings in the field.`,
        domain: "arxiv.org",
        score: 0.9,
        published_date: `${currentYear}-02-01T00:00:00Z`,
        author: "Research Community",
      },
      {
        title: `${query}: Technical Documentation and Resources`,
        url: `https://github.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Open source projects, documentation, and technical resources related to ${query} from the developer community.`,
        domain: "github.com",
        score: 0.85,
        published_date: `${currentYear}-03-01T00:00:00Z`,
        author: "Developer Community",
      },
    ]
  }

  private async scrapeWebContent(url: string): Promise<{ title: string; content: string; snippet: string } | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (!response.ok) return null
      
      const html = await response.text()
      
      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled'
      
      // Extract content (simplified)
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (!bodyMatch) return null
      
      const bodyContent = bodyMatch[1]
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      
      const snippet = bodyContent.substring(0, 200) + (bodyContent.length > 200 ? '...' : '')
      
      return {
        title,
        content: bodyContent,
        snippet
      }
    } catch (error) {
      console.error('Web scraping failed:', error)
      return null
    }
  }

  private async enhanceSearchResults(results: SearchResult[]): Promise<SearchResult[]> {
    const enhancedResults = await Promise.all(
      results.map(async (result) => {
        try {
          const scrapedContent = await this.scrapeWebContent(result.url)
          if (scrapedContent) {
            return {
              ...result,
              title: scrapedContent.title || result.title,
              snippet: scrapedContent.snippet || result.snippet,
              score: result.score + 0.1 // Boost score for enhanced content
            }
          }
        } catch (error) {
          console.error('Error enhancing result:', error)
        }
        return result
      })
    )
    
    return enhancedResults
  }
}

export const searchService = new SearchService()
