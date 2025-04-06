'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { generateReport } from '@/server/actions/report'
import { getReportSources, type ReportSourceData } from '@/server/actions/sources'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import remarkGfm from 'remark-gfm'  // Add GitHub flavored Markdown (tables, strikethrough, etc.)

function ReportContent() {
  const searchParams = useSearchParams()
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const selectedParam = searchParams.get('selected')
    const queryParam = searchParams.get('query')

    if (!selectedParam || !queryParam) {
      setError("Missing required information to generate the report.")
      setIsLoading(false)
      return
    }

    let selectedKeys: string[] = []
    let query = ''

    try {
      selectedKeys = JSON.parse(decodeURIComponent(selectedParam))
      query = decodeURIComponent(queryParam)

      if (!Array.isArray(selectedKeys) || selectedKeys.length === 0 || !query) {
        throw new Error("Invalid data format received.")
      }

      const fetchAndGenerate = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const sourceData = await getReportSources({ selectedKeys })

          if (!sourceData || sourceData.length === 0) {
            throw new Error("Could not retrieve data for selected sources.")
          }

          const report = await generateReport({ query, sources: sourceData })
          setReportMarkdown(report)
        } catch (err: any) {
          setError(err.message || "Failed to generate report.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchAndGenerate()

    } catch (parseError) {
      setError("Invalid data received. Could not generate report.")
      setIsLoading(false)
    }

  }, [searchParams])

  if (error) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertTitle>Error Generating Report</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4 my-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
      </div>
    )
  }

  return (
    <div className="prose prose-lg dark:prose-invert max-w-4xl my-6 p-6 border rounded-xl bg-muted/10 backdrop-blur-sm overflow-hidden">
      {reportMarkdown ? (
        <ReactMarkdown
          children={reportMarkdown}
          remarkPlugins={[remarkGfm]}  // Enable GitHub flavored markdown (tables, strikethrough)
        />
      ) : (
        <p className="text-sm text-muted-foreground">No report content generated.</p>
      )}
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading report data...</div>}>
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-6 tracking-tight">📄 Generated Report</h1>
        <ReportContent />
      </div>
    </Suspense>
  )
}
