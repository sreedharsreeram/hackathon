"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Paperclip } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

export default function SearchForm() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setIsSearching(true);

    // In a real application, you would send the query to your backend
    // For now, we'll just simulate a search
    console.log("Searching for:", query);

    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      // Here you would typically navigate to a results page or update the UI
      alert(`You searched for: ${query}`);
    }, 1000);
  };

  return (
    <div className="relative w-full">
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
            onClick={handleSubmit}
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
    </div>
  );
}
