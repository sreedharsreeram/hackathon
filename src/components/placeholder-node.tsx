"use client";

import React, { useCallback, forwardRef, useState } from "react";
import type { ReactNode } from "react";
import { useNodeId, Position, Handle } from "reactflow";
import type { NodeProps } from "reactflow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PlaceholderNodeData {
  label: string;
  isFollowUp?: boolean;
  onFollowUpSubmit?: (question: string) => void;
}

export type PlaceholderNodeProps = Partial<NodeProps<PlaceholderNodeData>> & {
  children?: ReactNode;
};

export const PlaceholderNode = forwardRef<HTMLDivElement, PlaceholderNodeProps>(
  ({ selected, data }, ref) => {
    const id = useNodeId();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [followUpQuestion, setFollowUpQuestion] = useState(data?.label ?? "");

    const handleClick = useCallback(() => {
      if (!id) return;
      console.log("Follow-up question clicked:", data?.label);
      console.log("Has onFollowUpSubmit callback:", !!data?.onFollowUpSubmit);
      setIsDialogOpen(true);
    }, [id, data]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log("Submitting follow-up question:", followUpQuestion);
      console.log(
        "Has onFollowUpSubmit callback at submission time:",
        !!data?.onFollowUpSubmit,
      );

      if (data?.onFollowUpSubmit && followUpQuestion.trim()) {
        console.log("Calling onFollowUpSubmit with:", followUpQuestion);
        data.onFollowUpSubmit(followUpQuestion);
        console.log("onFollowUpSubmit called successfully");
      } else {
        console.log(
          "Cannot submit: onFollowUpSubmit is",
          data?.onFollowUpSubmit,
        );
        console.log("Question is empty:", !followUpQuestion.trim());
      }

      setIsDialogOpen(false);
    };

    return (
      <>
        <div
          ref={ref}
          className={`rounded-lg border-2 p-3 transition-all duration-200 ${selected ? "border-blue-500 shadow-lg" : "border-blue-300 shadow"} max-w-[250px] cursor-pointer bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-800/40`}
          onClick={handleClick}
        >
          <div className="text-sm font-medium">{data?.label}</div>
          <Handle
            type="target"
            position={Position.Top}
            className="h-3 w-3 bg-blue-500 dark:bg-blue-400"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="h-3 w-3 bg-blue-500 dark:bg-blue-400"
          />
        </div>

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
      </>
    );
  },
);

PlaceholderNode.displayName = "PlaceholderNode";
