"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, BookOpen, Download } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface Citation {
  id: string
  formatted: string
  inText: string
  type: string
  year?: string
  authors?: string[]
}

interface CitationManagerProps {
  citations?: Citation[]
  style: string
}

export function CitationManager({ citations = [], style }: CitationManagerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyCitation = async (citation: Citation) => {
    await navigator.clipboard.writeText(citation.formatted)
    setCopiedId(citation.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const exportBibliography = () => {
    const bibliography = citations.map((c) => c.formatted).join("\n\n")
    const blob = new Blob([bibliography], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bibliography-${style}.txt`
    a.click()
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Citations ({style.toUpperCase()})
            </CardTitle>
            <CardDescription>{citations.length} sources found and formatted</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportBibliography}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {citations.map((citation, index) => (
          <div key={citation.id}>
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="secondary" className="text-xs">
                  [{index + 1}]
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => copyCitation(citation)} className="h-6 w-6 p-0">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              <div className="text-sm leading-relaxed">{citation.formatted}</div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {citation.type}
                </Badge>
                {citation.year && (
                  <Badge variant="outline" className="text-xs">
                    {citation.year}
                  </Badge>
                )}
                <span className="text-xs text-gray-500">In-text: {citation.inText}</span>
              </div>

              {copiedId === citation.id && <div className="text-xs text-green-600">Copied to clipboard!</div>}
            </div>

            {index < citations.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}

        {citations.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No citations generated yet. Start a research query to see citations here.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
