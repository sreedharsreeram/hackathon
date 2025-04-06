'use client'

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { findSimilarGuides } from '@/server/actions/getSimilar'; // Adjust path if necessary

// Type for the search results (matching the return type of findSimilarGuides)
type SourceResult = {
  title: string;
  url: string;
  content: string;
  similarity: number;
};

// Skeleton for loading state
const ResultSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/4 mt-1" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6 mt-1" />
    </CardContent>
  </Card>
);

export default function FindResourcesPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SourceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed

  const handleSearch = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault(); // Prevent default form submission if used
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true); // Mark that a search has been initiated

    try {
      const similarSources = await findSimilarGuides({ query });
      setResults(similarSources);
    } catch (err) {
      console.error("Error finding similar sources:", err);
      setError('Failed to fetch results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-center mb-6">Search Your Resources</h1>
      
      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2 sticky top-4 bg-background py-2 z-10">
        <Input
          placeholder="Enter keywords or questions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          className="flex-grow"
        />
        <Button type="submit" disabled={isLoading || !query.trim()}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {/* Results Area */}
      <div className="space-y-4">
        {isLoading && (
          // Show multiple skeletons for loading state
          <>
            <ResultSkeleton />
            <ResultSkeleton />
            <ResultSkeleton />
          </>
        )}

        {error && <p className="text-red-600 text-center">Error: {error}</p>}

        {!isLoading && !error && hasSearched && results.length === 0 && (
          <p className="text-muted-foreground text-center">No relevant resources found for "{query}".</p>
        )}

        {!isLoading && !error && results.length > 0 && (
          results.map((source, index) => (
            <Card key={`${source.url}-${index}`}> {/* Use URL + index for key */} 
              <CardHeader>
                <CardTitle className="text-lg">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    {source.title}
                  </a>
                </CardTitle>
                <CardDescription>
                  Similarity: {source.similarity.toFixed(4)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {source.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}