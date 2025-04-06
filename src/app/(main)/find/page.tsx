'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { findSimilarGuides } from '@/server/actions/getSimilar'
import { summarizeResources } from '@/server/actions/summarize'
import { useRouter } from 'next/navigation'

type SourceResult = {
  title: string
  url: string
  content: string
  similarity: number
}

const ResultSkeleton = () => (
  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <Card className="bg-muted/10 border border-muted rounded-xl shadow-sm">
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/4 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-1" />
      </CardContent>
    </Card>
  </motion.div>
)

export default function FindResourcesPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SourceResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)
    setResults([])
    setHasSearched(true)
    setSelectedResources([])
    setSummary(null)
    setSummaryError(null)

    try {
      const similar = await findSimilarGuides({ query })
      setResults(similar)
    } catch {
      setError('Failed to fetch results. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectResource = (key: string, checked: boolean | 'indeterminate') => {
    const isChecked = checked === true
    setSelectedResources(prev =>
      isChecked ? [...prev, key] : prev.filter(itemKey => itemKey !== key)
    )
  }

  const handleSummarize = async () => {
    if (selectedResources.length === 0) return

    setIsSummarizing(true)
    setSummaryError(null)
    setSummary(null)

    try {
      const selectedUrls = selectedResources.map(key => key.substring(0, key.lastIndexOf('-')));

      const content = results
        .filter(result => selectedUrls.includes(result.url))
        .filter((result, index, self) =>
          index === self.findIndex((r) => r.url === result.url))
        .map(r => `Source Title: ${r.title}\nSource URL: ${r.url}\nContent:\n${r.content}`)
        .join('\n\n---\n\n')

      const generatedSummary = await summarizeResources({ content })
      setSummary(generatedSummary)
    } catch (err: any) {
      setSummaryError(err.message || 'Failed to generate summary.')
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleGenerateReport = () => {
    if (selectedResources.length === 0) return; 

    const selectedParam = encodeURIComponent(JSON.stringify(selectedResources));
    const queryParam = encodeURIComponent(query); 
    
    router.push(`/report?selected=${selectedParam}&query=${queryParam}`);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground py-12 px-6 sm:px-12 lg:px-24 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-5xl font-bold text-center tracking-tight"
      >
        Discover Insightful Resources
      </motion.h1>

      <form
        onSubmit={handleSearch}
        className="relative z-10 flex items-center justify-center gap-3 bg-muted/20 backdrop-blur-md p-4 rounded-2xl shadow-md"
      >
        <Input
          placeholder="What do you want to learn today?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading || isSummarizing}
          className="text-lg py-6 px-4 rounded-xl shadow-inner"
        />
        <Button type="submit" disabled={isLoading || isSummarizing || !query.trim()} className="px-6 py-4 text-lg rounded-xl">
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {results.length > 0 && (
        <motion.div layout className="flex flex-col sm:flex-row gap-4 items-center justify-center my-6">
          <Button
            onClick={handleSummarize}
            disabled={selectedResources.length === 0 || isSummarizing || isLoading}
            className="w-full sm:w-auto rounded-xl text-base"
          >
            {isSummarizing
              ? 'Summarizing...'
              : `Summarize Selected (${selectedResources.length})`}
          </Button>
          <Button
            onClick={handleGenerateReport}
            variant="secondary"
            disabled={selectedResources.length === 0 || isSummarizing || isLoading}
            className="w-full sm:w-auto rounded-xl text-base"
          >
            Generate Report ({selectedResources.length})
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {isSummarizing && (
          <motion.div
            key="summary-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <Skeleton className="h-28 w-full rounded-lg" />
          </motion.div>
        )}

        {summaryError && (
          <motion.div
            key="summary-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert variant="destructive">
              <AlertTitle>Summarization Error</AlertTitle>
              <AlertDescription>{summaryError}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {summary && (
          <motion.div
            key="summary-output"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert className="border border-muted bg-muted/10 shadow-md rounded-xl">
              <AlertTitle className="text-xl font-medium">Generated Summary</AlertTitle>
              <AlertDescription className="whitespace-pre-line text-sm mt-2">
                {summary}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {isLoading && (
          <>
            <ResultSkeleton />
            <ResultSkeleton />
            <ResultSkeleton />
          </>
        )}

        {error && (
          <p className="text-destructive text-center font-medium text-lg">{error}</p>
        )}

        {!isLoading && !error && hasSearched && results.length === 0 && (
          <p className="text-muted-foreground text-center italic">
            No relevant resources found for "{query}".
          </p>
        )}

        <AnimatePresence>
          {!isLoading &&
            results.map((source, index) => {
              const uniqueKey = `${source.url}-${index}`;
              return (
                <motion.div
                  key={uniqueKey}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <Card className="relative p-4 rounded-2xl border border-muted bg-background/80 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="absolute top-3 right-4 z-10">
                      <Checkbox
                        id={`select-${uniqueKey}`}
                        checked={selectedResources.includes(uniqueKey)}
                        onCheckedChange={(checked: boolean | 'indeterminate') =>
                          handleSelectResource(uniqueKey, checked)
                        }
                        aria-label={`Select resource ${source.title}`}
                      />
                    </div>
                    <CardHeader className="pr-10">
                      <CardTitle className="text-xl font-semibold">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {source.title}
                        </a>
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        Similarity: {source.similarity.toFixed(4)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {source.content}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
        </AnimatePresence>
      </div>
    </div>
  )
}