"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlaceholderNode } from "./placeholder-node";

interface FollowUpProps {
  onFollowUpClick?: (question: string) => void;
  defaultQuestion?: string;
}

export default function FollowUp({
  onFollowUpClick,
  defaultQuestion = "Ask a follow-up question",
}: FollowUpProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState(defaultQuestion);

  const handleButtonClick = () => {
    // Create a new placeholder node
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      "Submitting follow-up question from FollowUp component:",
      followUpQuestion,
    );

    if (onFollowUpClick && followUpQuestion.trim()) {
      onFollowUpClick(followUpQuestion);
      console.log("onFollowUpClick called with:", followUpQuestion);
    }

    setIsDialogOpen(false);
  };

  return (
    <div>
      <Button
        onClick={handleButtonClick}
        className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
      >
        Ask follow up
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold dark:text-white">
              Ask a Follow-Up Question
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="followUpQuestion"
                placeholder="Type your follow-up question..."
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                className="w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
