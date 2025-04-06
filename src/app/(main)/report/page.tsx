"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { generateReport } from "@/server/actions/report";
import { getReportSources } from "@/server/actions/sources";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import remarkGfm from "remark-gfm"; // Add GitHub flavored Markdown (tables, strikethrough, etc.)

function ReportContent() {
  const searchParams = useSearchParams();
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const selectedParam = searchParams.get("selected");
    const queryParam = searchParams.get("query");

    if (!selectedParam || !queryParam) {
      setError("Missing required information to generate the report.");
      setIsLoading(false);
      return;
    }

    let selectedKeys: string[] = [];
    let query = "";

    try {
      selectedKeys = JSON.parse(decodeURIComponent(selectedParam)) as string[];
      query = decodeURIComponent(queryParam);

      if (!Array.isArray(selectedKeys) || selectedKeys.length === 0 || !query) {
        throw new Error("Invalid data format received.");
      }

      const fetchAndGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const sourceData = await getReportSources({ selectedKeys });

          if (!sourceData || sourceData.length === 0) {
            throw new Error("Could not retrieve data for selected sources.");
          }

          const report = await generateReport({ query, sources: sourceData });
          setReportMarkdown(report);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to generate report.";
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      };

      void fetchAndGenerate();
    } catch {
      setError("Invalid data received. Could not generate report.");
      setIsLoading(false);
    }
  }, [searchParams]);

  if (error) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertTitle>Error Generating Report</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="my-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  return (
    <div className="prose prose-lg dark:prose-invert bg-background my-6 max-w-4xl overflow-hidden rounded-xl border p-6 backdrop-blur-sm">
      {reportMarkdown ? (
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ ...props }) => (
                <h1
                  className="mt-6 mb-4 text-2xl font-bold dark:text-white"
                  {...props}
                />
              ),
              h2: ({ ...props }) => (
                <h2
                  className="mt-5 mb-3 text-xl font-bold dark:text-white"
                  {...props}
                />
              ),
              h3: ({ ...props }) => (
                <h3
                  className="mt-4 mb-2 text-lg font-bold dark:text-white"
                  {...props}
                />
              ),
              p: ({ ...props }) => (
                <p className="mb-4 dark:text-gray-200" {...props} />
              ),
              ul: ({ ...props }) => (
                <ul
                  className="mb-4 list-disc pl-6 dark:text-gray-200"
                  {...props}
                />
              ),
              ol: ({ ...props }) => (
                <ol
                  className="mb-4 list-decimal pl-6 dark:text-gray-200"
                  {...props}
                />
              ),
              li: ({ ...props }) => (
                <li className="mb-1 dark:text-gray-200" {...props} />
              ),
              a: ({ ...props }) => (
                <a
                  className="text-blue-500 hover:underline dark:text-blue-400"
                  {...props}
                />
              ),
              blockquote: ({ ...props }) => (
                <blockquote
                  className="my-4 border-l-4 border-gray-300 pl-4 italic dark:border-gray-600 dark:text-gray-300"
                  {...props}
                />
              ),
              strong: ({ ...props }) => (
                <strong className="font-bold dark:text-white" {...props} />
              ),
              em: ({ ...props }) => (
                <em className="italic dark:text-gray-200" {...props} />
              ),
              code: ({ ...props }) => (
                <code
                  className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-800 dark:text-gray-200"
                  {...props}
                />
              ),
              pre: ({ ...props }) => (
                <pre
                  className="overflow-x-auto rounded bg-gray-100 p-4 dark:bg-gray-800 dark:text-gray-200"
                  {...props}
                />
              ),
            }}
          >
            {reportMarkdown}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No report content generated.
        </p>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-center">Loading report data...</div>}
    >
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <h1 className="mb-6 text-center text-4xl font-bold tracking-tight">
          📄 Generated Report
        </h1>
        <ReportContent />
      </div>
    </Suspense>
  );
}
