"use client";

import React, { forwardRef } from "react";
import { useNodeId, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import { BaseNode } from "@/components/base-node";
import Sources from "./sources";
import FollowUp from "./follow-up";

interface Source {
  title: string;
  url: string;
  content: string;
}

interface BaseNodeDemoData {
  label: string;
  answer: string;
  sources?: Source[];
  onFollowUpSubmit?: (question: string) => void;
}

export type BaseNodeDemoProps = Partial<NodeProps<BaseNodeDemoData>>;

const BaseNodeDemo = forwardRef<HTMLDivElement, BaseNodeDemoProps>(
  ({ 
    selected, 
    data, 
    id, 
    type = "baseNode", 
    zIndex = 0, 
    isConnectable = true,
    xPos = 0,
    yPos = 0,
    dragging = false,
    targetPosition = Position.Top,
    sourcePosition = Position.Bottom,
    ...rest 
  }, ref) => {
    const nodeId = useNodeId() ?? id ?? 'node-' + Math.random().toString(36).substr(2, 9);
    
    if (!data) return null;

    const baseNodeData = {
      label: data.label,
      answer: data.answer,
      sources: data.sources,
    };

    const handleFollowUpClick = (question: string) => {
      console.log("Follow up clicked for:", data.label);
      console.log("Follow up question:", question);
      
      if (data.onFollowUpSubmit) {
        data.onFollowUpSubmit(question);
      }
    };

    return (
      <div ref={ref}>
        <BaseNode 
          id={nodeId}
          type={type}
          zIndex={zIndex}
          isConnectable={isConnectable}
          xPos={xPos}
          yPos={yPos}
          dragging={dragging}
          targetPosition={targetPosition}
          sourcePosition={sourcePosition}
          selected={!!selected} 
          data={baseNodeData} 
          {...rest}
        >
          {/* Only render Sources as children, let BaseNode handle label and answer */}
          <div className="mt-4 space-y-4">
            <Sources sources={data?.sources} />
            <div className="flex flex-col items-center justify-center">
              <FollowUp onFollowUpClick={handleFollowUpClick} />
            </div>
          </div>
        </BaseNode>
      </div>
    );
  },
);

BaseNodeDemo.displayName = "BaseNodeDemo";

export default BaseNodeDemo;
