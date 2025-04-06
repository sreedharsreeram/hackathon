"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import doEverything, { createProject } from "@/server/actions";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

export default function SearchForm() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();


  const handleSubmit = async(e: FormEvent) => {
    e.preventDefault();

    const project = await createProject();

    if(!project) {
      console.error("Failed to create project");
      return;
    }

    const res = await doEverything({
      query,
      projectId: project?.id
    });

    console.log("Response from doEverything:", res);

    router.push(`/${project.id}`);

    setIsSearching(true);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full" suppressHydrationWarning>
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
