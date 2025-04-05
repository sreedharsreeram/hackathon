"use client";

import { memo, useEffect } from "react";
import type { NodeProps } from "reactflow";
import { BaseNode } from "@/components/base-node";
import Sources from "./sources";

interface Source {
  title: string;
  url: string;
  content: string;
}

interface NodeData {
  query?: string;
  answer?: string;
  sources?: Source[];
  label: string;
}

const BaseNodeDemo = memo(({ selected, data, ...rest }: NodeProps<NodeData>) => {
  useEffect(() => {
    console.log("BaseNodeDemo received data:", data);
  }, [data]);

  // Create a proper BaseNodeData object
  const baseNodeData = {
    label: data.label ?? data.query ?? "",
    answer: data.answer ?? "",
    sources: data.sources
  };

  return (
    <BaseNode selected={selected} data={baseNodeData} {...rest}>
      {/* Only render Sources as children, let BaseNode handle label and answer */}
      <Sources sources={data?.sources} />
    </BaseNode>
  );
});

BaseNodeDemo.displayName = "BaseNodeDemo";

export default BaseNodeDemo;
