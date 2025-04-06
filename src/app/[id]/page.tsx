// app/chat/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Import useParams
import { getNodes } from '@/server/actions'; // Assuming getNodes is exported from index
import doEverything from '@/server/actions'; // Default export
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import Image from 'next/image'; // Use Next.js Image for optimization
import { motion } from 'framer-motion'; // Import motion

// Define the types based on your schema and actions
type NodeType = {
  id: number;
  projectId: number;
  userId: string;
  answer: string;
  images: { url: string; description: string }[];
  query: string;
  followupQuestions: string[];
  concepts: string[];
  results: { title: string; url: string; content: string }[];
  createdAt: Date; // Assuming createdAt is a Date object from Drizzle
  embedding: number[] | null;
};

// Optional: Reuse or adapt BotMessageContent for answer display
const BotMessageContent = ({ text }: { text: string }) => {
  const parts = text.split('\n\n');
  const title = parts[0];
  const paragraphs = parts.slice(1);

  if (!text.trim()) return null;

  return (
    <div className="space-y-3 mt-2">
      {title && <h4 className="font-semibold text-lg">{title}</h4>} 
      {paragraphs.length > 0 ? (
        paragraphs.map((para, index) => (
          <p key={index} className="text-sm text-muted-foreground">
            {para}
          </p>
        ))
      ) : ( 
        <p className="text-sm text-muted-foreground">
          {paragraphs.length === 0 && parts.length === 1 ? text : paragraphs.join('\n\n')}
        </p>
      )}
    </div>
  );
};

// Skeleton Component for Node Card
const NodeSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Answer Skeleton */}
      <div>
        <Skeleton className="h-5 w-1/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      {/* Images Skeleton (optional) */}
       <div>
         <Skeleton className="h-5 w-1/4 mb-2" />
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
           {[...Array(3)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
         </div>
       </div>
      {/* Sources Skeleton */}
      <div>
        <Skeleton className="h-5 w-1/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      {/* Follow-ups Skeleton */}
      <div>
        <Skeleton className="h-5 w-1/4 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function ProjectPage() { // Remove params from signature
  const params = useParams(); // Use the hook
  const idParam = params?.id;
  // Ensure idParam is a string before parsing
  const projectId = typeof idParam === 'string' ? parseInt(idParam, 10) : NaN;

  const [backendNodes, setBackendNodes] = useState<NodeType[]>([]); // Raw nodes from backend
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingFollowup, setIsProcessingFollowup] = useState(false);
  const [processingQuestion, setProcessingQuestion] = useState<string | null>(null); // State for specific question

  // Fetch initial nodes and prepare flow data
  useEffect(() => {
    if (isNaN(projectId)) {
      if (idParam !== undefined) { 
          setError("Invalid Project ID.");
      }
      setIsLoading(false); 
      setBackendNodes([]); // Clear nodes
      return;
    }

    const fetchNodes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedNodes = await getNodes(projectId);
        if (fetchedNodes) {
          const nodesTyped = fetchedNodes as NodeType[];
          setBackendNodes(nodesTyped);
        } else {
          setError("Could not fetch nodes or project not found.");
          setBackendNodes([]);
        }
      } catch (err) {
        console.error("Error fetching nodes:", err);
        setError("An error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNodes();
  }, [projectId, idParam]); 

  // Handle follow-up clicks
  const handleFollowUpClick = async (question: string, parentNodeId: number) => { // Accept parentNodeId
    if (isNaN(projectId)) return; 
    setIsProcessingFollowup(true);
    setProcessingQuestion(question); 
    setError(null);
    try {
      const newNodeData = await doEverything({ query: question, projectId, parentId: parentNodeId }); 
      if (newNodeData && newNodeData.id) { 
         const updatedNodesRaw = await getNodes(projectId);
         if (updatedNodesRaw) {
            const updatedNodesTyped = updatedNodesRaw as NodeType[];
            setBackendNodes(updatedNodesTyped);
         } else {
             console.warn("Could not re-fetch nodes after followup.");
         }
      } else {
        setError("Failed to process follow-up question.");
      }
    } catch (err) {
      console.error("Error processing follow-up:", err);
      setError("An error occurred while processing the follow-up.");
    } finally {
      setIsProcessingFollowup(false);
      setProcessingQuestion(null); 
    }
  };

  // Render Skeleton Loaders when loading
  if (isLoading && backendNodes.length === 0) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-1/2 mb-4" /> {/* Skeleton for title */}
        <NodeSkeleton />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  }

  if (backendNodes.length === 0) {
    // Add check for valid projectId before showing "No interactions"
    return <div className="p-6 text-center">{isNaN(projectId) ? "Loading project..." : "No interactions found for this project yet."}</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto"> {/* Restored max-width */} 
      <h1 className="text-2xl font-bold mb-4">Project {projectId} Interactions</h1>

       {/* Removed Tabs wrapper */} 
       <div className="space-y-6">
         {backendNodes.map((node, index) => (
           <motion.div
             key={node.id} 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3, delay: index * 0.05 }}
           >
             <Card className="overflow-hidden">
               <CardHeader>
                 <CardTitle>Query: {node.query}</CardTitle>
                 <CardDescription>
                   Interaction ID: {node.id} | Created: {new Date(node.createdAt).toLocaleString()}
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 {/* Answer, Images, Sources Sections (same as before) */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Answer</h3>
                    <BotMessageContent text={node.answer} /> 
                  </div>
                  {node.images && node.images.length > 0 && (
                    <div>
                       <h3 className="text-lg font-semibold mb-2">Images</h3>
                       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                         {node.images.map((img, idx) => (
                           <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden">
                             <Image src={img.url} alt={img.description || `Image ${idx + 1} for query ${node.query}`} layout="fill" objectFit="cover" unoptimized />
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                  {node.results && node.results.length > 0 && (
                     <div>
                       <h3 className="text-lg font-semibold mb-2">Sources</h3>
                       <ul className="list-disc space-y-1 pl-5 text-sm">
                         {node.results.map((result, idx) => (
                           <li key={idx}>
                             <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{result.title}</a>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}

                 {/* Follow-up Questions Section */}
                 {node.followupQuestions && node.followupQuestions.length > 0 && (
                   <div>
                     <h3 className="text-lg font-semibold mb-2">Suggested Follow-ups</h3>
                     <div className="flex flex-wrap gap-2">
                       {node.followupQuestions.map((q, idx) => (
                         <Button 
                           key={idx} 
                           variant="outline" 
                           size="sm"
                           // Keep passing parentId if backend needs it
                           onClick={() => handleFollowUpClick(q, node.id)} 
                           disabled={isProcessingFollowup} 
                         >
                           {processingQuestion === q ? (<Skeleton className="h-4 w-full" />) : (q)}
                         </Button>
                       ))}
                     </div>
                   </div>
                 )}
                 </CardContent>
             </Card>
           </motion.div>
         ))}
         {isProcessingFollowup && <NodeSkeleton />} 
       </div>
    </div>
  );
}
