"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { HistoryIcon } from "lucide-react";

interface QueryHistoryProps {
  currentQuery?: string;
  onQueryClick?: (query: string) => void;
}

const QueryHistory = ({ currentQuery, onQueryClick }: QueryHistoryProps) => {
  const [queries, setQueries] = useState<string[]>([]);
  const router = useRouter();

  // Load queries from localStorage on component mount
  useEffect(() => {
    const savedQueries = localStorage.getItem("queryHistory");
    if (savedQueries) {
      try {
        const parsedQueries = JSON.parse(savedQueries) as unknown;
        if (Array.isArray(parsedQueries) && parsedQueries.every(item => typeof item === 'string')) {
          setQueries(parsedQueries);
        }
      } catch (error) {
        console.error("Error parsing query history:", error);
      }
    }
  }, []);

  // Save current query to history if it's new
  useEffect(() => {
    if (currentQuery?.trim()) {
      setQueries(prevQueries => {
        // Don't add duplicates
        if (!prevQueries.includes(currentQuery)) {
          const newQueries = [currentQuery, ...prevQueries].slice(0, 20); // Keep only last 20 queries
          localStorage.setItem("queryHistory", JSON.stringify(newQueries));
          return newQueries;
        }
        return prevQueries;
      });
    }
  }, [currentQuery]);

  const handleQueryClick = (query: string) => {
    if (onQueryClick) {
      onQueryClick(query);
    } else {
      router.push(`/nodes?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <HistoryIcon className="h-4 w-4" />
        <span>Query History</span>
      </SidebarGroupLabel>
      <SidebarMenu>
        {queries.length > 0 ? (
          queries.map((query, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton 
                onClick={() => handleQueryClick(query)}
                isActive={query === currentQuery}
              >
                {query}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        ) : (
          <SidebarMenuItem>
            <div className="px-2 py-1 text-sm text-gray-500">No previous queries</div>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default QueryHistory;
