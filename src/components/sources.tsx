import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import React, { useEffect } from "react";

interface Source {
  title: string;
  url: string;
  content: string;
}

interface SourcesProps {
  sources?: Source[];
}

export default function Sources({ sources }: SourcesProps) {
  useEffect(() => {
    console.log("Sources component received:", sources);
  }, [sources]);

  // If sources is undefined or empty array, render a message
  if (!sources || sources.length === 0) {
    console.log("No sources available");
    return (
      <div className="mt-4 p-3 border border-gray-200 rounded-md">
        <p className="text-sm text-gray-500">No sources available</p>
      </div>
    );
  }

  return (
    <div className="mt-4 border border-gray-200 rounded-md p-3">
      <h3 className="mb-2 text-sm font-medium text-gray-700">Sources ({sources.length})</h3>
      <Accordion type="single" collapsible className="w-full">
        {sources.map((source, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 last:border-0">
            <AccordionTrigger className="text-sm font-medium py-2">
              {source.title}
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2 text-sm text-gray-600">{source.content}</p>
              {source.url && (
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  {source.url}
                </a>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
