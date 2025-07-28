"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy, FileText, BarChart3 } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface ResearchResultsProps {
  results: {
    summary?: string
    sources?: Array<{
      title: string
      url: string
      snippet: string
      relevance: number
      type: string
    }>
    citations?: Array<{
      id: string
      formatted: string
      inText: string
    }>
    keyInsights?: string[]
    relatedTopics?: string[]
  }
}

export function ResearchResults({ results }: ResearchResultsProps) {
  const [activeTab, setActiveTab] = useState("summary")

  // Add default values to prevent undefined errors
  const sources = results.sources || []
  const keyInsights = results.keyInsights || []
  const relatedTopics = results.relatedTopics || []
  const summary = results.summary || "No summary available"

  const exportToPDF = async () => {
    try {
      // Dynamic import of jsPDF to avoid SSR issues
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      
      // Set up document
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const lineHeight = 7
      let yPosition = 20
      
      // Title
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('Research Report', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20
      
      // Summary section
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Summary', margin, yPosition)
      yPosition += 10
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const summaryLines = doc.splitTextToSize(summary.replace(/[#*`]/g, ''), pageWidth - 2 * margin)
      doc.text(summaryLines, margin, yPosition)
      yPosition += summaryLines.length * lineHeight + 10
      
      // Key Insights section
      if (keyInsights.length > 0) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Key Insights', margin, yPosition)
        yPosition += 10
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        keyInsights.forEach((insight, index) => {
          const insightText = `${index + 1}. ${insight}`
          const insightLines = doc.splitTextToSize(insightText, pageWidth - 2 * margin)
          
          if (yPosition + insightLines.length * lineHeight > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage()
            yPosition = 20
          }
          
          doc.text(insightLines, margin, yPosition)
          yPosition += insightLines.length * lineHeight + 5
        })
        yPosition += 10
      }
      
      // Sources section
      if (sources.length > 0) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Sources', margin, yPosition)
        yPosition += 10
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        sources.forEach((source, index) => {
          const sourceText = `${index + 1}. ${source.title} (${source.type})`
          const sourceLines = doc.splitTextToSize(sourceText, pageWidth - 2 * margin)
          
          if (yPosition + sourceLines.length * lineHeight > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage()
            yPosition = 20
          }
          
          doc.text(sourceLines, margin, yPosition)
          yPosition += sourceLines.length * lineHeight + 5
        })
      }
      
      // Save the PDF
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      doc.save(`research-report-${timestamp}.pdf`)
      
    } catch (error) {
      console.error('PDF export failed:', error)
      // Fallback to text export
      const textContent = `Research Report\n\nSummary:\n${summary}\n\nKey Insights:\n${keyInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}\n\nSources:\n${sources.map((source, i) => `${i + 1}. ${source.title} (${source.type})`).join('\n')}`
      const blob = new Blob([textContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'research-report.txt'
      a.click()
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(summary)
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Research Results
            </CardTitle>
            <CardDescription>AI-generated summary with citations and insights</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-1" />
              Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-4">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="mt-4">
            <div className="space-y-4">
              {sources.map((source, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm">{source.title}</h4>
                      <Badge variant={source.type === "academic" ? "default" : "secondary"}>{source.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{source.snippet}</p>
                    <div className="flex justify-between items-center">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {source.url}
                      </a>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        <span className="text-xs">{Math.round(source.relevance * 100)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <div className="space-y-3">
              {keyInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="related" className="mt-4">
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map((topic, index) => (
                <Badge key={index} variant="outline" className="cursor-pointer hover:bg-gray-100">
                  {topic}
                </Badge>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
