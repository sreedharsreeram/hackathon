"use client";

import { memo } from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";

interface BaseNodeData {
  label: string;
  answer: string;
}

export const BaseNode = memo(({ data }: NodeProps<BaseNodeData>) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[400px] max-w-[600px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex flex-col gap-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <h3 className="text-lg font-semibold text-blue-700 mb-1">Query</h3>
          <p className="text-gray-800">{data.label}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Answer</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{data.answer}</p>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

BaseNode.displayName = "BaseNode";
