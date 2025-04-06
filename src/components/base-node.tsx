"use client";

import { memo } from "react";
import type { ReactNode } from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";

interface Source {
  title: string;
  url: string;
  content: string;
}

interface BaseNodeData {
  label: string;
  answer: string;
  sources?: Source[];
}

interface BaseNodeProps extends NodeProps<BaseNodeData> {
  children?: ReactNode;
}

export const BaseNode = memo(({ data, children }: BaseNodeProps) => {
  return (
    <div className="max-w-[600px] min-w-[400px] rounded-lg border border-muted-foreground bg-background p-4 shadow-lg">
      <Handle type="target" position={Position.Top} className="h-3 w-3" />

      <div className="flex flex-col gap-4">
        <div className="rounded-md bg-muted p-3">
          <p className="text-black-700 mb-1 text-lg font-bold capitalize">
            {data.label}
          </p>
        </div>

        <div className="rounded-md bg-muted p-3">
          <p className="whitespace-pre-wrap text-muted-foreground">{data.answer}</p>
        </div>
        
        {children}
      </div>

      <Handle type="source" position={Position.Bottom} className="h-3 w-3" />
    </div>
  );
});

BaseNode.displayName = "BaseNode";
