"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import { HistoryIcon, X } from "lucide-react";

interface QueryHistoryProps {
  currentQuery?: string;
  onQueryClick?: (query: string) => void;
}

const QueryHistory = ({ currentQuery, onQueryClick }: QueryHistoryProps) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const router = useRouter();
  const { collapsed } = useSidebar();

  // Load questions from localStorage on component mount
  useEffect(() => {
    const savedQuestionsStr = localStorage.getItem("questionHistory") ?? "[]";
    const savedQuestions = JSON.parse(savedQuestionsStr) as string[];
    if (savedQuestions) {
      setQuestions(savedQuestions);
    }
  }, []);

  // Save current question to history if it's new
  useEffect(() => {
    if (currentQuery?.trim()) {
      setQuestions((prevQuestions) => {
        // Don't add duplicates
        if (!prevQuestions.includes(currentQuery)) {
          // Check if this query was previously deleted
          const deletedQueriesStr = localStorage.getItem("deletedQuestions") ?? "[]";
          const deletedQueries = JSON.parse(deletedQueriesStr) as string[];
          
          // If the query was previously deleted, don't add it back
          if (deletedQueries.includes(currentQuery)) {
            return prevQuestions;
          }
          
          const newQuestions = [currentQuery, ...prevQuestions].slice(0, 20); // Keep only last 20 questions
          localStorage.setItem("questionHistory", JSON.stringify(newQuestions));
          return newQuestions;
        }
        return prevQuestions;
      });
    }
  }, [currentQuery]);

  const handleQuestionClick = (question: string) => {
    if (onQueryClick) {
      onQueryClick(question);
    } else {
      router.push(`/nodes?query=${encodeURIComponent(question)}`);
    }
  };

  // Function to delete a question from history
  const deleteQuestion = (questionToDelete: string, e: React.MouseEvent) => {
    // Stop the click event from propagating to the parent button
    e.stopPropagation();

    // Filter out the question to delete
    const updatedQuestions = questions.filter((question) => question !== questionToDelete);

    // Update state and localStorage
    setQuestions(updatedQuestions);
    localStorage.setItem("questionHistory", JSON.stringify(updatedQuestions));
    
    // Add to deleted questions list to prevent re-adding
    const deletedQueriesStr = localStorage.getItem("deletedQuestions") ?? "[]";
    const deletedQueries = JSON.parse(deletedQueriesStr) as string[];
    
    if (!deletedQueries.includes(questionToDelete)) {
      deletedQueries.push(questionToDelete);
      localStorage.setItem("deletedQuestions", JSON.stringify(deletedQueries));
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <HistoryIcon className="h-4 w-4" />
        {!collapsed && <span>Search History</span>}
      </SidebarGroupLabel>
      <SidebarMenu>
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <SidebarMenuItem key={index}>
              <div className="group relative flex items-center">
                <SidebarMenuButton
                  onClick={() => handleQuestionClick(question)}
                  isActive={question === currentQuery}
                  className="pr-8 w-full"
                  icon={<HistoryIcon className="h-4 w-4" />}
                >
                  {!collapsed && question}
                </SidebarMenuButton>
                {!collapsed && (
                  <button
                    onClick={(e) => deleteQuestion(question, e)}
                    className="absolute right-2 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100"
                    aria-label="Delete question"
                  >
                    <X className="h-3.5 w-3.5 text-red-500" />
                  </button>
                )}
              </div>
            </SidebarMenuItem>
          ))
        ) : (
          <SidebarMenuItem>
            <div className="px-2 py-1 text-sm text-gray-500">
              {!collapsed && "No previous questions"}
            </div>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default QueryHistory;
