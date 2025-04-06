"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

export default function SearchForm() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    
    console.log("Submitting search for:", trimmedQuery);
    setIsSearching(true);
    
    try {
      // Save to localStorage first
      const savedQuestionsStr = localStorage.getItem("questionHistory") ?? "[]";
      const savedQuestions = JSON.parse(savedQuestionsStr) as string[];
      
      // Don't add duplicates
      if (!savedQuestions.includes(trimmedQuery)) {
        const newQuestions = [trimmedQuery, ...savedQuestions].slice(0, 20);
        localStorage.setItem("questionHistory", JSON.stringify(newQuestions));
      }
      
      // Navigate to nodes page
      const encodedQuery = encodeURIComponent(trimmedQuery);
      const url = `/nodes?query=${encodedQuery}`;
      console.log("Navigating to:", url);
      
      // Use window.location for a full page navigation as a fallback
      window.location.href = url;
    } catch (error) {
      console.error("Error during search navigation:", error);
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="rounded-lg bg-[#27272f] p-4 shadow-lg">
        <Textarea
          placeholder="Remember this..."
          className="min-h-0 w-full resize-none border-none bg-transparent p-0 text-base text-white placeholder:text-gray-500 focus-visible:ring-0"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="mt-4 flex items-center justify-end">
          <Button
            type="submit"
            className="rounded-md bg-[#4d8eff] px-3 py-1.5 text-white hover:bg-[#3a7aef]"
            disabled={isSearching}
          >
            {isSearching ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
