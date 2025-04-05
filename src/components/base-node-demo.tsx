"use client";

import { memo } from "react";
import type { NodeProps } from "reactflow";
import { BaseNode } from "@/components/base-node";

interface NodeData {
  query?: string;
  answer?: string;
}

const BaseNodeDemo = memo(({ selected, data }: NodeProps<NodeData>) => {
  return (
    <BaseNode selected={selected} data={data}>
      {data?.query && <h3 className="mb-2 text-lg font-bold">{data.query}</h3>}
      {data?.answer && <p className="max-w-lg text-sm">{data.answer}</p>}
    </BaseNode>
  );
});

BaseNodeDemo.displayName = "BaseNodeDemo";

export default BaseNodeDemo;
