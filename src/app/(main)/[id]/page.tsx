'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { getNodes, getProjectDetails } from '@/server/actions';
import {
    getSourceEmbedding,
    findSimilarSources,
    findSimilarAnswers
} from '@/server/actions/sources';
import doEverything from '@/server/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import { Search, BrainCircuit, CornerDownRight, Loader2 } from 'lucide-react'; // Import Loader2
import Image from 'next/image';
import { toast } from 'sonner';

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
  createdAt: Date;
  embedding: number[] | null;
  answerEmbedding?: number[] | null;
};

// Add type for similar source results
type SimilarSourceResult = {
  nodeId: number;
  query: string;
  sourceTitle: string;
  sourceUrl: string;
  similarity: number;
};

// Add type for similar answer results
type SimilarAnswerResult = {
  nodeId: number;
  query: string;
  projectId: number;
  projectName: string | null;
  answerSnippet: string;
  similarity: number;
};

type ProjectDetailsType = {
  id: number;
  name: string;
} | null; // Type for project details

function getFavicon(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}`;
  } catch {
    return '';
  }
}

// --- Skeleton Component ---
function NodeSkeleton() {
  return (
    // Adjusted styling for consistency
    <Card className="p-4 md:p-6 bg-muted/20 border border-border/40 rounded-2xl space-y-4 shadow-md">
       <div className="space-y-2">
         <Skeleton className="h-6 w-3/4" />
         <Skeleton className="h-4 w-1/4" />
       </div>
        {/* Images Skeleton - simplified */}
       <Skeleton className="aspect-video w-full rounded-xl" />
       {/* Sources Skeleton */}
       <div className="space-y-2">
         <Skeleton className="h-4 w-1/6" />
         <Skeleton className="h-10 w-full rounded-lg" />
         <Skeleton className="h-10 w-full rounded-lg" />
       </div>
       {/* Answer Skeleton */}
       <div className="space-y-2">
         <Skeleton className="h-4 w-1/6" />
         <Skeleton className="h-4 w-full" />
         <Skeleton className="h-4 w-full" />
         <Skeleton className="h-4 w-5/6" />
       </div>
        {/* Followups Skeleton */}
       <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
    </Card>
  );
}
// --- End Skeleton Component ---

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger children animation
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};


export default function ResearchView() {
  const params = useParams();
  const idParam = params?.id;
  const projectId = typeof idParam === 'string' ? parseInt(idParam, 10) : NaN;

  const [backendNodes, setBackendNodes] = useState<NodeType[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectDetailsType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingFollowup, setIsProcessingFollowup] = useState(false);
  const [followup, setFollowup] = useState('');
  const skeletonRef = useRef<HTMLDivElement>(null);

  // State for Similarity Search (both source and answer)
  const [similarityResults, setSimilarityResults] = useState<{
    [key: string]: SimilarSourceResult[] | null; // key: `${nodeId}-${sourceUrl}`
  }>({});
  const [isLoadingSimilarity, setIsLoadingSimilarity] = useState<{
    [key: string]: boolean; // key: `${nodeId}-${sourceUrl}` OR `answer-${nodeId}`
  }>({});
  const [similarityError, setSimilarityError] = useState<{
    [key: string]: string | null; // key: `${nodeId}-${sourceUrl}` OR `answer-${nodeId}`
  }>({});
  const [similarAnswerResults, setSimilarAnswerResults] = useState<{
    [nodeId: number]: SimilarAnswerResult[] | null;
  }>({});


  useEffect(() => {
    if (isNaN(projectId)) {
      if (idParam !== undefined) setError('Invalid Project ID.');
      setIsLoading(false);
      setBackendNodes([]);
      setProjectDetails(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [nodesResult, detailsResult] = await Promise.all([
          getNodes(projectId),
          getProjectDetails(projectId),
        ]);

        // Fix: Handle null case from getNodes
        setBackendNodes(nodesResult ?? []);
        setProjectDetails(detailsResult);

        if (!nodesResult && !detailsResult) {
          setError('Could not fetch project data.');
        }
      } catch (err) {
        console.error(`Error during fetchData:`, err);
        setError('An error occurred while fetching data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [projectId, idParam]);

 const handleFollowUpClick = async (question: string, parentNodeId: number) => {
    if (isNaN(projectId)) return;
    setIsProcessingFollowup(true);
    skeletonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    try {
      const newNodeData = await doEverything({ query: question, projectId, parentId: parentNodeId });
      if (newNodeData?.id) {
        const updatedNodesRaw = await getNodes(projectId);
        // Fix: Handle null case
        setBackendNodes(updatedNodesRaw ?? []);
        setFollowup('');
      } else {
        setError('Failed to process follow-up question.');
        toast.error('Failed to process follow-up question.');
      }
    } catch (err) {
      console.error('Error processing follow-up:', err);
      setError('An error occurred while processing the follow-up.');
      toast.error('An error occurred processing the follow-up.');
    } finally {
      setIsProcessingFollowup(false);
    }
  };

  const handleFindSimilar = async (sourceUrl: string, sourceNodeId: number) => {
    const loadingKey = `${sourceNodeId}-${sourceUrl}`;
    let toastId: string | number | undefined;

    setIsLoadingSimilarity(prev => ({ ...prev, [loadingKey]: true }));
    setSimilarityError(prev => ({ ...prev, [loadingKey]: null }));
    setSimilarityResults(prev => ({ ...prev, [loadingKey]: null }));

    try {
      toastId = toast.loading("Finding similar sources...");
      const embedding = await getSourceEmbedding({ sourceUrl, nodeId: sourceNodeId });

      if (!embedding) throw new Error('Could not retrieve embedding for this source.');

      toast.loading("Searching vector database...", { id: toastId });
      const results = await findSimilarSources({ projectId, embedding });
      setSimilarityResults(prev => ({ ...prev, [loadingKey]: results }));

      if (results.length > 0) {
          toast.success(`Found ${results.length} similar source(s).`, { id: toastId, duration: 2500 });
      } else {
          toast.info("No highly similar sources found in this project.", { id: toastId, duration: 2500 });
      }

    } catch (err: any) {
      console.error('Error finding similar sources:', err);
      const errorMsg = err.message || 'Failed to find similar sources.';
      setSimilarityError(prev => ({ ...prev, [loadingKey]: errorMsg }));
      toast.error(errorMsg, { id: toastId, duration: 4000 });
    } finally {
      setIsLoadingSimilarity(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleFindSimilarAnswers = async (node: NodeType) => {
    const loadingKey = `answer-${node.id}`; // Use a distinct key format
    let toastId: string | number | undefined;

    if (!node.answerEmbedding) {
      setSimilarityError(prev => ({ ...prev, [loadingKey]: 'Answer embedding not available.' }));
      toast.error('Answer embedding not available for this node.');
      return;
    }

    setIsLoadingSimilarity(prev => ({ ...prev, [loadingKey]: true }));
    setSimilarityError(prev => ({ ...prev, [loadingKey]: null }));
    setSimilarAnswerResults(prev => ({ ...prev, [node.id]: null })); // Use original state for results

    try {
      toastId = toast.loading('Finding similar answers across projects...');
      const results = await findSimilarAnswers({
        nodeId: node.id,
        embedding: node.answerEmbedding,
      });
      setSimilarAnswerResults(prev => ({ ...prev, [node.id]: results })); // Set results

      if (results.length > 0) {
          toast.success(`Found the closest similar answer.`, { id: toastId, duration: 2500 });
      } else {
          toast.info("No relevantly similar answers found.", { id: toastId, duration: 2500 });
      }

    } catch (err: any) {
      console.error(`[Node ${node.id}] Error finding similar answers:`, err);
      const errorMsg = err.message || 'Failed to find similar answers.';
      setSimilarityError(prev => ({ ...prev, [loadingKey]: errorMsg }));
      toast.error(errorMsg, { id: toastId, duration: 4000 });
    } finally {
      setIsLoadingSimilarity(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const displayTitle = projectDetails?.name
      ? projectDetails.name
      : !isLoading && !isNaN(projectId)
          ? `Project ${projectId}`
          : 'Loading Project...';

  return (
    // 1. Use Flex column layout and manage height
    <div className="flex flex-col h-screen bg-background text-foreground max-h-screen">
       {/* Wrapper for scrollable content - constrained width and centered */}
       <div className="flex-grow overflow-y-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl mx-auto w-full space-y-8 md:space-y-10">
         {/* Title Section */}
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="text-center"
         >
           <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight break-words">
             {displayTitle}
           </h1>
         </motion.div>

         {/* Loading State */}
         <AnimatePresence>
           {isLoading && !error && (
             <motion.div
               key="loading-skeletons"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-6 md:space-y-8"
             >
               <NodeSkeleton />
               <NodeSkeleton />
             </motion.div>
           )}
         </AnimatePresence>

         {/* Error State */}
         <AnimatePresence>
          {error && (
            <motion.div
              key="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-red-500 my-6 p-4 border border-red-500/50 bg-red-500/10 rounded-lg"
            >
              {error}
            </motion.div>
          )}
         </AnimatePresence>

         {/* Loaded Content */}
         {!isLoading && !error && backendNodes.length > 0 && (
           <motion.div
             key="nodes-list"
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             className="space-y-8 md:space-y-10"
           >
             {backendNodes.map((node) => {
               // States for this specific node's similarity searches
               const answerLoadingKey = `answer-${node.id}`;
               const currentIsLoadingAnswer = isLoadingSimilarity[answerLoadingKey];
               const currentAnswerError = similarityError[answerLoadingKey];
               const currentSimilarAnswers = similarAnswerResults[node.id]; // Read from correct state

               return (
                 <motion.div key={node.id} variants={itemVariants}>
                   <Card className="p-4 md:p-6 bg-card border border-border/60 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 space-y-4 md:space-y-6">
                     {/* Images */}
                     {node.images?.length > 0 && (
                       <motion.div
                         layout // Animate layout changes if grid adjusts
                         className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
                       >
                         {node.images.map((img, idx) => (
                           <motion.div
                             key={idx}
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: idx * 0.05 }}
                             className="relative aspect-video rounded-lg md:rounded-xl overflow-hidden border border-muted shadow-sm group"
                           >
                             <Image
                               src={img.url}
                               alt={img.description || `Image ${idx + 1}`}
                               fill // Use fill instead of layout
                               sizes="(max-width: 768px) 50vw, 33vw" // Provide sizes hint
                               style={{ objectFit: 'cover' }} // Use style for objectFit
                               className="transition-transform duration-300 group-hover:scale-105"
                               unoptimized // If images aren't optimized via Next.js
                             />
                           </motion.div>
                         ))}
                       </motion.div>
                     )}

                     {/* Query Info */}
                     <motion.div variants={itemVariants}>
                       <h2 className="text-lg md:text-xl font-semibold tracking-tight">{node.query}</h2>
                       <p className="text-xs md:text-sm text-muted-foreground">
                         #{node.id} • {new Date(node.createdAt).toLocaleString()}
                       </p>
                     </motion.div>

                     {/* Sources */}
                     {node.results?.length > 0 && (
                       <motion.div variants={itemVariants} className="space-y-3 pt-2">
                         <h3 className="text-sm font-medium text-muted-foreground px-1">Sources</h3>
                         <div className="space-y-2">
                           {node.results.map((res, idx) => {
                             const sourceLoadingKey = `${node.id}-${res.url}`;
                             const currentIsLoadingSource = isLoadingSimilarity[sourceLoadingKey];
                             const currentSourceError = similarityError[sourceLoadingKey];
                             const currentSourceResults = similarityResults[sourceLoadingKey];

                             return (
                               <motion.div
                                 key={`${res.url}-${idx}`}
                                 layout
                                 className="border border-border/60 bg-background/50 rounded-lg px-3 py-2 space-y-2 shadow-sm transition-colors hover:bg-accent/50"
                               >
                                 <div className="flex justify-between items-center gap-2">
                                   <a
                                     href={res.url}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="flex items-center gap-2 text-sm min-w-0 group flex-1" // Allow shrinking
                                   >
                                     <Image src={getFavicon(res.url)} alt="" width={16} height={16} className="flex-shrink-0" />
                                     <span className="truncate group-hover:underline">{res.title}</span>
                                   </a>
                                   <Button
                                     variant="ghost"
                                     size="icon"
                                     className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-foreground"
                                     onClick={() => handleFindSimilar(res.url, node.id)}
                                     disabled={currentIsLoadingSource}
                                     title="Find similar sources"
                                   >
                                     {currentIsLoadingSource ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4" />}
                                   </Button>
                                 </div>
                                 {/* Source Similarity Results */}
                                 <AnimatePresence>
                                   {currentIsLoadingSource && (
                                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                         <Skeleton className="h-4 w-1/2 mt-1" />
                                      </motion.div>
                                   )}
                                   {currentSourceError && (
                                       <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-xs text-destructive mt-1">
                                           Error: {currentSourceError}
                                       </motion.p>
                                   )}
                                   {currentSourceResults && currentSourceResults.length > 0 && (
                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-2 mt-2 space-y-1 text-xs border-t border-border/60">
                                       {currentSourceResults.map((similar, simIdx) => (
                                         <div key={simIdx} className="text-muted-foreground">
                                           See also node <span className="font-medium">#{similar.nodeId}</span>: <a href={similar.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-primary hover:underline">{similar.sourceTitle}</a> <span className="text-[10px]">(Similarity: {similar.similarity.toFixed(2)})</span>
                                         </div>
                                       ))}
                                     </motion.div>
                                   )}
                                   {currentSourceResults && currentSourceResults.length === 0 && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-2 mt-2 text-xs text-muted-foreground italic border-t border-border/60">
                                            No other highly similar sources found.
                                        </motion.p>
                                   )}
                                 </AnimatePresence>
                               </motion.div>
                             );
                           })}
                         </div>
                       </motion.div>
                     )}

                     {/* Answer */}
                     <motion.div variants={itemVariants} className="space-y-3 pt-2">
                       <div className="flex justify-between items-center px-1">
                         <h3 className="text-sm font-medium text-muted-foreground">Answer</h3>
                         <Button
                           variant="ghost"
                           size="sm" // Keep small
                           onClick={() => handleFindSimilarAnswers(node)}
                           disabled={currentIsLoadingAnswer || !node.answerEmbedding}
                           title="Find similar answers"
                           className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                         >
                           {currentIsLoadingAnswer ? <Loader2 className="h-4 w-4 animate-spin mr-1"/> : <BrainCircuit className="w-3.5 h-3.5 mr-1" />}
                           Similar Answers
                         </Button>
                       </div>
                       <p className="text-muted-foreground whitespace-pre-line leading-relaxed px-1">
                         {node.answer}
                       </p>
                       {/* Answer Similarity Results */}
                       <AnimatePresence>
                          {currentIsLoadingAnswer && (
                             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                <Skeleton className="h-4 w-1/2 mt-1" />
                             </motion.div>
                          )}
                          {currentAnswerError && (
                              <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-xs text-destructive mt-1 px-1">
                                  Error: {currentAnswerError}
                              </motion.p>
                          )}
                          {currentSimilarAnswers && currentSimilarAnswers.length > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-3 mt-3 space-y-1 text-xs border-t border-border/60">
                              <p className="font-medium text-muted-foreground mb-1 px-1">Closest similar answer found:</p>
                              {currentSimilarAnswers.map((similar, simIdx) => ( // Should only be one result now
                                <div key={simIdx} className="text-muted-foreground pl-3">
                                  Node <span className="font-medium">#{similar.nodeId}</span> (in <span className="font-medium">{similar.projectName || `Project ${similar.projectId}`}</span>) - "<span className="italic">{similar.query}</span>" - Snippet: "<span className="italic">{similar.answerSnippet}...</span>" <span className="text-[10px] ml-1">(Similarity: {similar.similarity.toFixed(2)})</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                          {currentSimilarAnswers && currentSimilarAnswers.length === 0 && !currentIsLoadingAnswer && (
                               <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-3 mt-3 text-xs text-muted-foreground italic border-t border-border/60 px-1">
                                   No relevantly similar answers found across projects.
                               </motion.p>
                          )}
                        </AnimatePresence>
                     </motion.div>

                     {/* Follow-ups */}
                     {node.followupQuestions?.length > 0 && (
                       <motion.div variants={itemVariants} className="space-y-3 pt-2">
                         <h3 className="text-sm font-medium text-muted-foreground px-1">Follow-up Questions</h3>
                         <div className="flex flex-col gap-2">
                           {node.followupQuestions.map((q, idx) => (
                             <motion.button
                               key={idx}
                               whileHover={{ scale: 1.02 }}
                               whileTap={{ scale: 0.98 }}
                               className="flex items-center gap-2 border border-border/60 bg-background/50 px-4 py-2 rounded-lg text-sm hover:bg-accent/50 shadow-sm text-left disabled:opacity-50 disabled:cursor-not-allowed"
                               onClick={() => handleFollowUpClick(q, node.id)}
                               disabled={isProcessingFollowup}
                             >
                               <CornerDownRight size={14} className="text-muted-foreground flex-shrink-0"/>
                               <span className="truncate flex-1">{q}</span>
                             </motion.button>
                           ))}
                         </div>
                       </motion.div>
                     )}
                   </Card>
                 </motion.div>
               );
             })}
           </motion.div>
         )}

         {/* Fallback if not loading, no error, but no nodes */}
         {!isLoading && !error && backendNodes.length === 0 && (
             <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center text-muted-foreground py-10">
                 <p>No research nodes found for this project yet.</p>
             </motion.div>
         )}

          {/* Followup Loading Placeholder - stays in scrollable area */}
          <AnimatePresence>
              {isProcessingFollowup && (
                  <motion.div
                      ref={skeletonRef}
                      key="followup-loading"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 mt-4" 
                  >
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                  </motion.div>
              )}
          </AnimatePresence>
       </div> {/* End Scrollable Content Wrapper */}

      {/* Followup Input Area - NOT fixed, part of flex layout */}
      {/* Use padding matching the scrollable area, constraint from parent */}
      <div className="bg-background/90 backdrop-blur-lg border-t border-border/60 p-3 md:p-4 w-full max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
               e.preventDefault();
               if (!isProcessingFollowup && backendNodes.length > 0 && followup.trim()) {
                   const lastNode = backendNodes[backendNodes.length - 1];
                   if (lastNode) { 
                      handleFollowUpClick(followup, lastNode.id);
                   } else {
                      console.error("Could not get last node even though backendNodes length > 0");
                      toast.error("Cannot ask followup: Internal error.");
                   }
               } else if (!isProcessingFollowup && followup.trim()) {
                   toast.error("Cannot ask followup without existing research.");
               }
            }}
            className="flex gap-2 items-center" 
          >
            <Input
              placeholder="Ask follow-up..."
              value={followup}
              onChange={(e) => setFollowup(e.target.value)}
              className="flex-1 bg-muted/60 border-border/60 rounded-full px-4 py-2 focus:ring-primary focus:border-primary"
              disabled={isProcessingFollowup}
            />
            <Button
              type="submit"
              className="rounded-full px-5 py-2"
              disabled={isProcessingFollowup || !followup.trim()}
            >
              {isProcessingFollowup ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
            </Button>
          </form>
      </div>
    </div>
  );
}