"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { ResearchResults } from "./components/research-results"
import { CitationManager } from "./components/citation-manager"

interface APIStatus {
  groq: boolean
  gemini: boolean
  langSearch: boolean
  brave: boolean
  googleSearch: boolean
}

export default function ResearchAssistant() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<{
    summary?: string
    sources?: Array<any>
    citations?: Array<any>
    keyInsights?: string[]
    relatedTopics?: string[]
    metadata?: any
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [citationStyle, setCitationStyle] = useState("apa")
  const [tone, setTone] = useState("academic")
  const [apiStatus, setApiStatus] = useState<APIStatus>({
    groq: false,
    gemini: false,
    langSearch: false,
    brave: false,
    googleSearch: false,
  })

  // Check API status on component mount
  useEffect(() => {
    checkAPIStatus()
  }, [])

  const checkAPIStatus = async () => {
    try {
      const response = await fetch("/api/status")
      if (response.ok) {
        const status = await response.json()
        setApiStatus(status)
      }
    } catch (error) {
      console.error("Failed to check API status:", error)
    }
  }

  const handleResearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          citationStyle,
          tone,
          databases: ["web", "academic", "arxiv"],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Ensure data has the expected structure
      setResults({
        summary: data.summary || "",
        sources: data.sources || [],
        citations: data.citations || [],
        keyInsights: data.keyInsights || [],
        relatedTopics: data.relatedTopics || [],
        metadata: data.metadata || {},
      })
    } catch (error) {
      console.error("Research failed:", error)
      // Set a default error state
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setResults({
        summary: `An error occurred while processing your research request: ${errorMessage}. Please check your API keys and try again.`,
        sources: [],
        citations: [],
        keyInsights: [],
        relatedTopics: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (available: boolean) => {
    return available ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const hasAnyAI = apiStatus.groq || apiStatus.gemini
  const hasAnySearch = apiStatus.langSearch || apiStatus.brave || apiStatus.googleSearch

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">AI Research Assistant</h1>
          <p className="text-lg text-gray-600">Real-time research with automatic citation generation</p>
        </div>

        {/* API Status Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              API Status
            </CardTitle>
            <CardDescription>Current status of integrated services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(apiStatus.groq)}
                <span className="text-sm">Groq AI</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(apiStatus.gemini)}
                <span className="text-sm">Google Gemini</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(apiStatus.langSearch)}
                <span className="text-sm">LangSearch</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(apiStatus.brave)}
                <span className="text-sm">Brave Search</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(apiStatus.googleSearch)}
                <span className="text-sm">Google Search</span>
              </div>
            </div>

            {!hasAnyAI && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  ⚠️ No AI models available. Please configure GROQ_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY
                </p>
              </div>
            )}

            {!hasAnySearch && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700">
                  ⚠️ No search APIs available. Using fallback sources. Configure LANGSEARCH_API_KEY, BRAVE_API_KEY, or
                  GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_CSE_ID for better results.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Input Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Research Query
            </CardTitle>
            <CardDescription>
              Enter your research topic, question, or partial content to get comprehensive insights with citations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., 'Explain how AI is used in climate modeling' or paste your partial research content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[120px] resize-none"
            />

            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Citation Style</label>
                <Select value={citationStyle} onValueChange={setCitationStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apa">APA Style</SelectItem>
                    <SelectItem value="mla">MLA Style</SelectItem>
                    <SelectItem value="ieee">IEEE Style</SelectItem>
                    <SelectItem value="chicago">Chicago Style</SelectItem>
                    <SelectItem value="bibtex">BibTeX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Writing Tone</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="journalistic">Journalistic</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {apiStatus.langSearch && <Badge variant="default">LangSearch Hybrid Search</Badge>}
              {apiStatus.brave && <Badge variant="secondary">Brave Search</Badge>}
              {apiStatus.googleSearch && <Badge variant="secondary">Google Search</Badge>}
              {apiStatus.groq && <Badge variant="default">Groq Llama-3.3</Badge>}
              {apiStatus.gemini && <Badge variant="secondary">Google Gemini</Badge>}
              {apiStatus.langSearch && <Badge variant="outline">Semantic Reranking</Badge>}
              <Badge variant="outline">Academic Sources</Badge>
            </div>

            <Button
              onClick={handleResearch}
              disabled={loading || !query.trim() || !hasAnyAI}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Start Research
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ResearchResults results={results} />
            </div>
            <div>
              <CitationManager citations={results.citations} style={citationStyle} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
