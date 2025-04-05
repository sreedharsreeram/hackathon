"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  applyNodeChanges
} from "reactflow";
import type { Node, Edge, NodeChange } from "reactflow";
import "reactflow/dist/style.css";

import { BaseNode } from "@/components/base-node";
import QueryHistory from "@/components/query-history";
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger, SidebarHeader } from "@/components/ui/sidebar";
import typedData from "@/data.json";

// Register custom node types
const nodeTypes = {
  base: BaseNode,
};

// Function to create a node with the query and answer
const createNode = (query: string, answer: string): Node[] => {
  return [
    {
      id: "1",
      type: "base",
      position: { x: 250, y: 100 },
      data: { label: query, answer: answer },
    },
  ];
};

export default function NodesPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? typedData.query;
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges] = useState<Edge[]>([]);

  // Initialize nodes based on query
  useEffect(() => {
    const initialNodes = createNode(query, typedData.answer);
    setNodes(initialNodes);
  }, [query]);

  // Handle node changes (e.g., position changes)
  const onNodesChange = (changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  // Handle clicking on a history item
  const handleQueryClick = (historyQuery: string) => {
    // Create a new URL with the selected query
    const url = new URL(window.location.href);
    url.searchParams.set("query", historyQuery);
    
    // Update the URL without refreshing the page
    window.history.pushState({}, "", url.toString());
    
    // Update nodes with the new query
    const newNodes = createNode(historyQuery, typedData.answer);
    setNodes(newNodes);
  };

  return (
    <div className="flex h-screen w-full">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Query Explorer</h2>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <QueryHistory 
              currentQuery={query} 
              onQueryClick={handleQueryClick}
            />
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </SidebarProvider>
    </div>
  );
}
