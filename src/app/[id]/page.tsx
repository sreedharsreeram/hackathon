"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  addEdge,
} from "reactflow";
import type {
  Node as ReactFlowNode,
  Connection,
  Edge,
  XYPosition,
} from "reactflow";
import "reactflow/dist/style.css";
import { getNodes } from "@/server/actions";
import BaseNodeDemo from "@/components/base-node-demo";
import { PlaceholderNode } from "@/components/placeholder-node";
import type { Node } from "@/types/node-types";
import Link from "next/link";

// Define node types for ReactFlow
const nodeTypes = {
  baseNode: BaseNodeDemo,
  placeholderNode: PlaceholderNode,
};

const NodeDetailFlow = ({ nodeData }: { nodeData: Node }) => {
  // State for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Handle follow-up question submission
  const handleFollowUpSubmit = useCallback(
    (question: string, index: number) => {
      console.log(`Submitted follow-up question ${index + 1}:`, question);

      // Create a unique ID for the new node
      const newNodeId = `new-followup-${Date.now()}`;

      // Create a new node for the follow-up question
      const newNode: ReactFlowNode = {
        id: newNodeId,
        type: "placeholderNode",
        position: { x: 350, y: 100 },
        data: {
          label: question,
          isFollowUp: true,
          onFollowUpSubmit: (question: string) =>
            handleFollowUpSubmit(question, index),
        },
      };

      // Create a new edge connecting to the new node
      const newEdge: Edge = {
        id: `edge-node1-to-${newNodeId}`,
        source: "node-1",
        target: newNodeId,
        animated: true,
        style: { stroke: "#2563eb" },
      };

      console.log("Adding new node:", newNode);
      console.log("Adding new edge:", newEdge);

      // Directly update the nodes and edges state
      setNodes((currentNodes) => [...currentNodes, newNode]);
      setEdges((currentEdges) => [...currentEdges, newEdge]);
    },
    [setNodes, setEdges],
  );

  // Create initial nodes for ReactFlow
  const initialNodes = useMemo(() => {
    const followUpNodes: ReactFlowNode[] = [];

    // Add follow-up questions as placeholder nodes if available
    if (nodeData.followupQuestions && nodeData.followupQuestions.length > 0) {
      // Position nodes to match the screenshot layout
      // Define specific positions for up to 3 follow-up questions
      const topLeft: XYPosition = { x: -250, y: -150 };
      const topRight: XYPosition = { x: 250, y: -150 };
      const bottom: XYPosition = { x: 0, y: 250 };

      // Limit to first 3 questions if there are more
      const questionsToShow = nodeData.followupQuestions.slice(0, 3);

      questionsToShow.forEach((question, index) => {
        // Assign position based on index
        let position: XYPosition;

        switch (index) {
          case 0:
            position = topLeft;
            break;
          case 1:
            position = topRight;
            break;
          case 2:
            position = bottom;
            break;
          default:
            // This shouldn't happen due to the slice(0, 3) above,
            // but TypeScript needs this to ensure position is always defined
            position = { x: 0, y: 0 };
        }

        followUpNodes.push({
          id: `followup-${index}`,
          type: "placeholderNode",
          position: position,
          data: {
            label: question,
            isFollowUp: true,
            onFollowUpSubmit: (question: string) =>
              handleFollowUpSubmit(question, index),
          },
        });
      });
    }

    // Main node
    return [
      {
        id: "node-1",
        type: "baseNode",
        position: { x: 0, y: 0 },
        data: {
          label: nodeData.query ?? "Question not available",
          answer: nodeData.answer ?? "Answer not available",
          sources: nodeData.results ?? [],
          onFollowUpSubmit: handleFollowUpSubmit,
        },
      },
      ...followUpNodes,
    ];
  }, [nodeData, handleFollowUpSubmit]);

  // Create edges connecting the main node to follow-up nodes
  const initialEdges = useMemo(() => {
    const edges: Edge[] = [];

    if (nodeData.followupQuestions && nodeData.followupQuestions.length > 0) {
      const questionsToShow = Math.min(nodeData.followupQuestions.length, 3);
      for (let index = 0; index < questionsToShow; index++) {
        edges.push({
          id: `edge-node1-to-followup-${index}`,
          source: "node-1",
          target: `followup-${index}`,
          animated: true,
          style: { stroke: "#2563eb" },
        });
      }
    }

    return edges;
  }, [nodeData]);

  // Initialize nodes and edges on component mount
  useEffect(() => {
    console.log("Setting initial nodes:", initialNodes);
    console.log("Setting initial edges:", initialEdges);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      proOptions={{ hideAttribution: true }}
      className="bg-background"
    >
      <Background color="#aaa" gap={16} size={1} className="bg-background" />
      <Controls
        position="bottom-right"
        className="bg-background border-muted text-muted-foreground"
      />
      <MiniMap
        nodeStrokeWidth={3}
        position="bottom-left"
        className="bg-background border-muted"
      />

    </ReactFlow>
  );
};

const NodePage = () => {
  // Use the useParams hook to get the params from the URL
  const params = useParams();
  const id = params.id as string;
  // Convert string id to number for the getNodes function
  const numericId = parseInt(id, 10);

  // Initialize with null to properly handle the type
  const [data, setData] = useState<Node[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        // Pass the numeric ID to getNodes
        const res = await getNodes(numericId);
        setData(res);
      } catch (err) {
        console.error("Error fetching node data:", err);
        setError("Failed to load node data");
      } finally {
        setLoading(false);
      }
    };

    void getData();
  }, [numericId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        Loading node data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-destructive">
        {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        No node data found for this ID.
      </div>
    );
  }

  // We've already checked that data exists and has at least one item
  // TypeScript still needs help to understand this
  const nodeData = data[0]!;

  return (
    <div className="relative h-screen w-full">
      <ReactFlowProvider>
        <NodeDetailFlow nodeData={nodeData} />
      </ReactFlowProvider>
    </div>
  );
};

export default NodePage;
