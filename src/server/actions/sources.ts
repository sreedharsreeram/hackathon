'use server'

import { sql, eq, or, and, desc, ne } from "drizzle-orm";
import { db } from "../db";
import { nodes, sources } from "../db/schema";
import { auth } from "../auth"; // Import auth

// Type matching the data needed for the report
export type ReportSourceData = {
    title: string;
    url: string;
    content: string;
};

// Fetches source details based on the combined url-index keys
export const getReportSources = async ({ 
    selectedKeys 
}: {
    selectedKeys: string[] 
}): Promise<ReportSourceData[]> => {
  if (!selectedKeys || selectedKeys.length === 0) {
    return [];
  }

  // Extract URLs from the keys. Note: This assumes URL doesn't contain '-'.
  // A more robust key format might be needed if URLs can contain hyphens.
  const urlsToFetch = selectedKeys.map(key => {
      const lastHyphenIndex = key.lastIndexOf('-');
      if (lastHyphenIndex === -1) return null; // Invalid key format
      return key.substring(0, lastHyphenIndex);
  }).filter((url): url is string => url !== null); // Filter out nulls and type guard

  if (urlsToFetch.length === 0) {
      console.warn("No valid URLs could be extracted from selected keys.");
      return [];
  }

  // Remove duplicate URLs to avoid fetching the same source multiple times
  const uniqueUrls = [...new Set(urlsToFetch)];

  try {
    // Construct OR conditions for the WHERE clause
    const orConditions = uniqueUrls.map(url => eq(sources.url, url));

    // Fetch sources matching any of the unique URLs
    const fetchedSources = await db.select({
        title: sources.title,
        url: sources.url,
        content: sources.content,
      })
      .from(sources)
      .where(or(...orConditions)); // Use or() with spread operator
      
    console.log(`Fetched ${fetchedSources.length} sources for report.`);
    return fetchedSources;

  } catch (error) {
    console.error("Error fetching sources for report:", error);
    throw new Error("Failed to retrieve source data for the report.");
  }
};

export const getSourceEmbedding = async ({
    sourceUrl,
    nodeId
}: {
    sourceUrl: string;
    nodeId: number;
}): Promise<number[] | null> => {
    try {
        const source = await db.query.sources.findFirst({
            where: and(
                eq(sources.nodeId, nodeId),
                eq(sources.url, sourceUrl)
            ),
            columns: {
                embedding: true
            }
        });
        return source?.embedding ?? null;
    } catch (error) {
        console.error("Error fetching source embedding:", error);
        return null;
    }
};

// This assumes you have pgvector enabled and the <=> operator available
// Adjust the query and distance metric if using a different vector DB/extension
export const findSimilarSources = async ({
    projectId,
    embedding,
    limit = 5, // Default limit
    minSimilarity = 0.7 // Adjust threshold as needed
}: {
    projectId: number;
    embedding: number[];
    limit?: number;
    minSimilarity?: number;
}): Promise<{
    nodeId: number;
    query: string;
    sourceTitle: string;
    sourceUrl: string;
    similarity: number; // Cosine distance is often 1-similarity
}[]> => {
    if (!embedding || embedding.length === 0) {
        return [];
    }

    try {
        // Vector similarity search using cosine distance (<=> operator in pgvector)
        // The distance is 0 for identical vectors, 1 for orthogonal, 2 for opposite.
        // We convert distance to similarity (1 - distance) for easier interpretation.
        const similar = await db
            .select({
                nodeId: sources.nodeId,
                query: nodes.query,
                sourceTitle: sources.title,
                sourceUrl: sources.url,
                // Calculate cosine similarity: 1 - cosine_distance
                similarity: sql<number>`1 - (${sources.embedding} <=> ${JSON.stringify(embedding)})`
            })
            .from(sources)
            .innerJoin(nodes, eq(sources.nodeId, nodes.id))
            .where(
                and(
                    eq(nodes.projectId, projectId),
                    // Exclude sources potentially from the exact same node if needed, though projectId filter might suffice
                    // ne(sources.nodeId, /* optional: exclude original nodeId */),
                    // Filter by similarity threshold (1 - distance > minSimilarity)
                    sql`${sources.embedding} <=> ${JSON.stringify(embedding)} < ${1 - minSimilarity}`
                )
            )
            .orderBy(sql`${sources.embedding} <=> ${JSON.stringify(embedding)} ASC`) // Order by distance (ascending)
            .limit(limit);

        return similar;
    } catch (error) {
        console.error("Error finding similar sources:", error);
        return []; // Return empty array on error
    }
};

// Finds nodes with similar ANSWER embeddings across ALL user's projects
export const findSimilarAnswers = async ({
    nodeId, // ID of the node whose answer we are comparing
    embedding, // Embedding of the answer from nodeId
    limit = 1, // Default limit is now 1 to get only the closest
    minSimilarity = 0.6 // Threshold for semantic relevance (adjust as needed)
}: {
    nodeId: number;
    embedding: number[];
    limit?: number; // Keep limit param in case needed later, but default to 1
    minSimilarity?: number;
}): Promise<{
    nodeId: number;
    query: string;
    projectId: number; // Add projectId to results
    projectName: string | null; // Add projectName to results
    answerSnippet: string; 
    similarity: number;
}[]> => {
    const session = await auth();
    if (!session?.user?.id) {
      console.error("[findSimilarAnswers] User session not found.");
      return []; // Cannot search without user context
    }
    const userId = session.user.id;

    console.log(`[findSimilarAnswers User: ${userId}] Received embedding for node ${nodeId}:`, Array.isArray(embedding) ? `${embedding.length} dimensions` : 'Invalid/Not Array');
    if (!Array.isArray(embedding) || embedding.length === 0) {
        return [];
    }

    try {
        // Find the single closest node (limit is 1)
        const closestNodes = await db
            .select({
                nodeId: nodes.id,
                query: nodes.query,
                projectId: nodes.projectId, 
                projectName: sql<string | null>`(SELECT name FROM projects WHERE projects.id = ${nodes.projectId})`,
                answerSnippet: sql<string>`substring(${nodes.answer} for 100)`, 
                similarity: sql<number>`1 - (${nodes.answerEmbedding} <=> ${JSON.stringify(embedding)})`
            })
            .from(nodes)
            .where(
                and(
                    eq(nodes.userId, userId), 
                    ne(nodes.id, nodeId), 
                    sql`${nodes.answerEmbedding} IS NOT NULL` 
                )
            )
            .orderBy(sql`${nodes.answerEmbedding} <=> ${JSON.stringify(embedding)} ASC`) 
            .limit(1); // Fetch only the closest one

        console.log(`[findSimilarAnswers User: ${userId}] Found ${closestNodes.length} closest node candidate.`);

        // Check if a candidate was found AND if it meets the similarity threshold
        if (closestNodes.length === 1) {
            // Use non-null assertion since length is confirmed
            const closestNode = closestNodes[0]!; 
            if (closestNode.similarity >= minSimilarity) {
                console.log(`[findSimilarAnswers User: ${userId}] Closest node meets similarity threshold (${closestNode.similarity.toFixed(3)} >= ${minSimilarity}). Returning it.`);
                return [closestNode]; // Return array with the single closest relevant node
            } else {
                console.log(`[findSimilarAnswers User: ${userId}] Closest node candidate similarity (${closestNode.similarity.toFixed(3)}) is below threshold (${minSimilarity}). Returning empty.`);
                return []; // Closest wasn't similar enough
            }
        } else {
             console.log(`[findSimilarAnswers User: ${userId}] No suitable candidate found. Returning empty.`);
            return []; // No node found at all
        }

    } catch (error) {
        console.error("Error finding similar answers:", error);
        // Check if error is due to missing column to provide better feedback
        if (error instanceof Error && /column .* does not exist/i.test(error.message)) {
            console.error("Schema Error: 'answerEmbedding' column likely missing from 'nodes' table.");
            throw new Error("Database schema mismatch. Cannot perform similarity search on answers.");
        }
        return []; // Return empty array on other errors
    }
}; 