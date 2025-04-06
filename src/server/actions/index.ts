'use server'

import { auth } from "../auth";
import { db } from "../db";
import { nodes, projects, sources } from "../db/schema";
import Embedding from "./Embedding";
import FollowUp from "./followup";
import websearch from "./Websearch";
import { eq, asc, desc, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";


type WebSearchType = {
    answer: string;
    images:{
      url: string
      description: string
    }[]
    query: string
    results: {
      title: string
      url: string
      content: string
    }[]
  }

  export const createProject = async (query: string) => {
    const session = await auth();
    if (!session?.user?.id) {
      console.error("[Action createProject] User session not found.");
      return null;
    }
    
    const projectName = query.substring(0, 60) + (query.length > 60 ? '...' : '');
    console.log(`[Action createProject] Generated name: "${projectName}" for query: "${query}"`);

    try {
        const [project] = await db.insert(projects)
        .values({
          userId: session.user.id,
          name: projectName,
        })
        .returning({ id: projects.id, name: projects.name });
        
        if (!project) {
            console.error("[Action createProject] Failed to retrieve project details after insert.");
            return null;
        }
        
        console.log(`[Action createProject] Project ${project.id} created with name "${project.name}"`);
        return project;
    } catch (error) {
      console.error("[Action createProject] Error inserting project:", error);
      return null;
    }
  };
  
  export const StoreNode = async ({
    node,
    projectId,
    followUps
  }: {
    node: WebSearchType;
    projectId: number;
    followUps: {
      followupQuestions: string[];
      concepts: string[];
    }
  }) => {
    const session = await auth();
    if (!session || !projectId || !node.answer || !node.images || !node.query || !node.results) {
      return null;
    }
  
    // First verify the project exists and belongs to the user
    const projectExists = await db.query.projects.findFirst({
      where: (projects, { eq, and }) => 
        and(
          eq(projects.id, projectId),
          eq(projects.userId, session.user.id)
        )
    });
  
    if (!projectExists) {
      console.error("Project doesn't exist or doesn't belong to this user");
      return null;
    }
  
    // Fetch the current project data including chat history
    const currentProject = await db.query.projects.findFirst({
      where: (projects, { eq }) => eq(projects.id, projectId),
      columns: { chatHistory: true } // Only select chatHistory for efficiency
    });

    if (!currentProject) {
      console.error("Failed to fetch current project data for chat history update");
      // Decide if you should still return the node or handle error differently
      // For now, we'll proceed but log the error
    }
  
    // Now insert the node with the verified project ID
    const [nodeDB] = await db.insert(nodes)
      .values({
        answer: node.answer,
        images: node.images,
        query: node.query,
        results: node.results,
        userId: session.user.id,
        projectId: projectId,
        followupQuestions: followUps.followupQuestions,
        concepts: followUps.concepts,
      })
      .returning({ id: nodes.id });
  
    if (!nodeDB) {
      console.error("Failed to insert node");
      return null;
    }
  
    // Use Promise.all to wait for all source insertions
    const sourcesPromises = node.results.map(async (result) => {
      const embeddingVector = (await Embedding({ query: result.content })) as number[] | null;
      
      if (embeddingVector) {
        return await db.insert(sources).values({
          nodeId: nodeDB.id,
          url: result.url,
          title: result.title,
          content: result.content,
          embedding: embeddingVector
        });
      }
      return null;
    });
  
    await Promise.all(sourcesPromises);

    // Append to chat history if current project data was fetched and nodeDB exists
    if (currentProject && nodeDB) {
      const newChatEntry = {
        question: node.query,
        answer: node.answer, 
        timestamp: new Date().toISOString(),
        nodeId: nodeDB.id, // Include the ID of the newly created node
      };

      // Ensure chatHistory is treated as an array, even if null/undefined initially
      const updatedChatHistory = [...(currentProject.chatHistory || []), newChatEntry];

      // Update the project with the new chat history and update timestamp
      await db.update(projects)
        .set({
          chatHistory: updatedChatHistory,
          updatedAt: new Date(), // Update the timestamp
        })
        .where(eq(projects.id, projectId)); // Use eq from drizzle-orm
    }
    
    // Generate and store answer embedding *after* node is created
    console.log(`[StoreNode Project: ${projectId}] Attempting to generate answer embedding for node ID: ${nodeDB?.id}, Query: ${node.query}`);
    let answerEmbeddingVector: number[] | null = null;
    try {
        answerEmbeddingVector = (await Embedding({ query: node.answer })) as number[] | null;
        console.log(`[StoreNode Project: ${projectId}] Embedding generation result for node ID ${nodeDB?.id}:`, answerEmbeddingVector ? `Received embedding (${answerEmbeddingVector.length} dims)` : 'null');
    } catch (embeddingError) {
        console.error(`[StoreNode Project: ${projectId}] Error calling Embedding service for node ID ${nodeDB?.id}:`, embeddingError);
    }

    if (nodeDB && answerEmbeddingVector) {
        try {
            console.log(`[StoreNode Project: ${projectId}] Attempting to save answer embedding for node ID ${nodeDB.id}`);
            // This assumes 'answerEmbedding' column EXISTS in the schema and is NOT NULL
            await db.update(nodes)
                .set({ answerEmbedding: answerEmbeddingVector })
                .where(eq(nodes.id, nodeDB.id));
            console.log(`[StoreNode Project: ${projectId}] Successfully saved answer embedding for node ID ${nodeDB.id}`);
        } catch (updateError) {
            console.error(`[StoreNode Project: ${projectId}] Failed to update answer embedding for node ${nodeDB.id}:`, updateError);
        }
    } else if (nodeDB) {
        console.warn(`[StoreNode Project: ${projectId}] Could not generate or save answer embedding for node ${nodeDB.id}. Embedding was ${answerEmbeddingVector === null ? 'null' : 'valid but nodeDB missing?'}`);
    }

    return nodeDB; // Return the node object (or its ID)
  };

  export default async function doEverything({query , projectId, parentId}: { // Add parentId here
    query: string;
    projectId: number;
    parentId?: number;// Make parentId optional and type number
  }) {
    const session = await auth();
    if (!session) {
      redirect('/login');
    }
    const searchData = await websearch(query);
    const followUps = await FollowUp({
      answer: searchData.answer,
    });
    const newNode = await StoreNode({ node: searchData, projectId: projectId, followUps });
    console.log("New Node: ", newNode);
    return newNode;
  }

  export const getNodes = async (projectId: number) => {
    const session = await auth();
    if (!session) {
      return null;
    }
    
    // Fetch nodes including the answerEmbedding (assumes it's in the schema)
    const fetchedNodes = await db.query.nodes.findMany({
      where: (nodesTable, { eq }) => eq(nodesTable.projectId, projectId),
      orderBy: (nodesTable, { asc }) => [asc(nodesTable.createdAt)],
    });
    
    // IMPORTANT: Ensure NodeType used in frontend includes 'answerEmbedding: number[] | null'
    return fetchedNodes;
  }

  export const getProjects = async () => {
    console.log("[Action getProjects] Attempting to fetch projects...");
    let session;
    try {
        session = await auth();
        console.log("[Action getProjects] Session object:", session);
    } catch (authError) {
        console.error("[Action getProjects] Error during auth():", authError);
        return null; // Stop if auth fails
    }

    if (!session?.user?.id) {
      console.warn("[Action getProjects] No valid session or user ID found.");
      return null;
    }
    
    console.log(`[Action getProjects] Session valid for user: ${session.user.id}. Querying DB...`);
    try {
        const projects = await db.query.projects.findMany({
          where: (p, { eq }) => eq(p.userId, session!.user!.id), // Use non-null assertion as we checked
          // Optionally order them
          orderBy: (p, { desc }) => [desc(p.updatedAt)] 
        });
        console.log(`[Action getProjects] DB query successful. Found ${projects.length} projects.`);
        return projects;
    } catch (dbError) {
        console.error("[Action getProjects] Error querying database:", dbError);
        return null; // Return null on DB error
    }
  }
  
  export const getChats = async() => {
  const session = await auth();
  if (!session) {
    return null;
  }
  
  const chats = await db.query.projects.findMany({
    where: (projects, { eq }) => eq(projects.userId, session.user.id),
  });
  console.log(getChats)
  return chats.map(project => project.chatHistory).flat();
  }

  // Action to perform only the web search
  export const performWebSearch = async (query: string): Promise<WebSearchType | null> => {
    console.log(`[Action] Performing web search for: "${query}"`);
    try {
      const searchData = await websearch(query);
      console.log(`[Action] Web search completed.`);
      return searchData;
    } catch (error) {
      console.error("[Action] Error during web search:", error);
      return null;
    }
  };

  // Action to perform only the follow-up generation
  export const generateFollowups = async (answer: string): Promise<{ followupQuestions: string[]; concepts: string[] } | null> => {
    console.log(`[Action] Generating follow-ups for answer snippet: "${answer.substring(0, 50)}..."`);
    try {
      const followUps = await FollowUp({ answer });
      console.log(`[Action] Follow-up generation completed.`);
      return followUps;
    } catch (error) {
      console.error("[Action] Error during follow-up generation:", error);
      return null;
    }
  };

  // Internal function to store node and generate embeddings (not directly exported as server action)
  // Renamed to indicate it's internal and handles embeddings
  const internal_StoreNodeAndEmbeddings = async ({
    node,
    projectId,
    followUps
  }: {
    node: WebSearchType;
    projectId: number;
    followUps: {
      followupQuestions: string[];
      concepts: string[];
    }
  }) => {
    const session = await auth();
    if (!session || !projectId || !node.answer || !node.images || !node.query || !node.results) {
      console.error("[StoreNode Internal] Missing required data or session.");
      return null;
    }

    // Verify project exists (keep existing logic)
    const projectExists = await db.query.projects.findFirst({
      where: (p, { eq, and }) => and(eq(p.id, projectId), eq(p.userId, session.user.id))
    });
    if (!projectExists) {
      console.error("[StoreNode Internal] Project not found or invalid user.");
      return null;
    }

    console.log(`[StoreNode Internal] Inserting node for project ${projectId}`);
    const [nodeDB] = await db.insert(nodes)
      .values({
        answer: node.answer,
        images: node.images,
        query: node.query,
        results: node.results,
        userId: session.user.id,
        projectId: projectId,
        followupQuestions: followUps.followupQuestions,
        concepts: followUps.concepts,
        // parentId is not handled here, needs explicit passing if required
      })
      .returning({ id: nodes.id });

    if (!nodeDB) {
      console.error("[StoreNode Internal] Failed to insert node into DB.");
      return null;
    }
    console.log(`[StoreNode Internal] Node ${nodeDB.id} inserted.`);

    // --- Source Embedding Generation ---
    console.log(`[StoreNode Internal Node: ${nodeDB.id}] Starting source embedding generation for ${node.results.length} sources.`);
    const sourcesPromises = node.results.map(async (result, index) => {
      console.log(`[StoreNode Internal Node: ${nodeDB.id}] Generating embedding for source ${index + 1}: ${result.url}`);
      let sourceEmbeddingVector: number[] | null = null;
      try {
        sourceEmbeddingVector = (await Embedding({ query: result.content })) as number[] | null;
        if (sourceEmbeddingVector) {
          console.log(`[StoreNode Internal Node: ${nodeDB.id}] Embedding successful for source ${index + 1}. Saving...`);
          await db.insert(sources).values({
            nodeId: nodeDB.id,
            url: result.url,
            title: result.title,
            content: result.content,
            embedding: sourceEmbeddingVector // Assumes schema is NOT NULL
          });
          console.log(`[StoreNode Internal Node: ${nodeDB.id}] Saved embedding for source ${index + 1}.`);
        } else {
           console.warn(`[StoreNode Internal Node: ${nodeDB.id}] Embedding generation returned null for source ${index + 1}. Skipping save.`);
        }
      } catch(err) {
         console.error(`[StoreNode Internal Node: ${nodeDB.id}] Error during embedding/saving for source ${index + 1}:`, err);
      }
    });
    await Promise.all(sourcesPromises);
    console.log(`[StoreNode Internal Node: ${nodeDB.id}] Finished processing source embeddings.`);
    // --- End Source Embedding ---

    // --- Chat History Update (Keep existing logic) ---
    const currentProject = await db.query.projects.findFirst({ where: (p, { eq }) => eq(p.id, projectId), columns: { chatHistory: true } });
    if (currentProject && nodeDB) {
      const newChatEntry = {
        question: node.query,
        answer: node.answer, 
        timestamp: new Date().toISOString(),
        nodeId: nodeDB.id, 
      };
      const updatedChatHistory = [...(currentProject.chatHistory || []), newChatEntry];
      await db.update(projects).set({ chatHistory: updatedChatHistory, updatedAt: new Date() }).where(eq(projects.id, projectId));
      console.log(`[StoreNode Internal Node: ${nodeDB.id}] Updated chat history for project ${projectId}.`);
    }
    // --- End Chat History Update ---

    // --- Answer Embedding Generation ---
    console.log(`[StoreNode Internal Node: ${nodeDB.id}] Attempting to generate answer embedding.`);
    let answerEmbeddingVector: number[] | null = null;
    try {
      answerEmbeddingVector = (await Embedding({ query: node.answer })) as number[] | null;
      console.log(`[StoreNode Internal Node: ${nodeDB.id}] Answer embedding generation result:`, answerEmbeddingVector ? `Received embedding (${answerEmbeddingVector.length} dims)` : 'null');
    } catch (embeddingError) {
      console.error(`[StoreNode Internal Node: ${nodeDB.id}] Error calling Embedding service for answer:`, embeddingError);
    }

    if (answerEmbeddingVector) {
      try {
        console.log(`[StoreNode Internal Node: ${nodeDB.id}] Attempting to save answer embedding.`);
        await db.update(nodes)
          .set({ answerEmbedding: answerEmbeddingVector }) // Assumes schema is NOT NULL
          .where(eq(nodes.id, nodeDB.id));
        console.log(`[StoreNode Internal Node: ${nodeDB.id}] Successfully saved answer embedding.`);
      } catch (updateError) {
        console.error(`[StoreNode Internal Node: ${nodeDB.id}] Failed to update answer embedding:`, updateError);
      }
    } else {
      console.warn(`[StoreNode Internal Node: ${nodeDB.id}] Could not generate or save answer embedding. Embedding was null.`);
      // NOTE: If answerEmbedding is NOT NULL in schema, this node might be invalid or cause future errors.
    }
    // --- End Answer Embedding ---

    console.log(`[StoreNode Internal] Completed storing node ${nodeDB.id}.`);
    return nodeDB; // Return the node object (or its ID)
  };

  // Action to orchestrate storing node and generating embeddings
  export const storeNodeWithEmbeddings = async ({
      projectId,
      nodeData,
      followupData
  }: {
      projectId: number;
      nodeData: WebSearchType;
      followupData: { followupQuestions: string[]; concepts: string[] };
  }) : Promise<{id: number} | null> => {
      console.log(`[Action] Storing node and generating embeddings for project ${projectId}, query: "${nodeData.query}"`);
      try {
          const newNode = await internal_StoreNodeAndEmbeddings({ 
              node: nodeData, 
              projectId: projectId, 
              followUps: followupData 
          });
          console.log(`[Action] Node storage and embedding process completed. New node ID: ${newNode?.id}`);
          return newNode ? { id: newNode.id } : null;
      } catch (error) {
          console.error("[Action] Error during node storage/embedding process:", error);
          return null;
      }
  }

  // Action to get project details by ID
  export const getProjectDetails = async (projectId: number): Promise<{ id: number; name: string; } | null> => {
    const session = await auth();
    if (!session?.user?.id) {
      console.error("[Action getProjectDetails] User session not found.");
      return null;
    }

    console.log(`[Action getProjectDetails] Fetching details for project ID: ${projectId}`);
    try {
        const project = await db.query.projects.findFirst({
            where: (p, { eq, and }) => and(
                eq(p.id, projectId),
                eq(p.userId, session.user.id) // Ensure user owns the project
            ),
            columns: {
                id: true,
                name: true,
            }
        });

        if (!project) {
            console.warn(`[Action getProjectDetails] Project ${projectId} not found or access denied.`);
            return null;
        }
        console.log(`[Action getProjectDetails] Found project: ${project.name}`);
        return project;
    } catch (error) {
        console.error(`[Action getProjectDetails] Error fetching project ${projectId}:`, error);
        return null;
    }
  };

export const deleteProject = async (projectId: number) => {
  const session = await auth();
  if (!session?.user?.id) {
    console.error("[Action deleteProject] User session not found.");
    return null;
  }

  try {
    // First, verify the project exists and belongs to the current user
    const projectToDelete = await db.query.projects.findFirst({
      where: (p, { eq, and }) => and(
        eq(p.id, projectId),
        eq(p.userId, session.user.id)
      ),
      with: {
        nodes: true
      }
    });

    if (!projectToDelete) {
      console.error(`[Action deleteProject] Project ${projectId} not found or doesn't belong to the current user.`);
      return null;
    }

    console.log(`[Action deleteProject] Deleting project ${projectId} "${projectToDelete.name}" with ${projectToDelete.nodes.length} nodes`);
    
    // Step 1: Get all node IDs for this project for source deletion
    const nodeIds = projectToDelete.nodes.map(node => node.id);
    console.log(`[Action deleteProject] Found ${nodeIds.length} nodes to delete for project ${projectId}`);

    // Step 2: Delete all sources associated with these nodes
    if (nodeIds.length > 0) {
      // Delete sources without using count in RETURNING
      await db.delete(sources)
        .where(inArray(sources.nodeId, nodeIds));
      
      console.log(`[Action deleteProject] Deleted sources for nodes in project ${projectId}`);
    } else {
      console.log(`[Action deleteProject] No nodes found for project ${projectId}, skipping source deletion`);
    }
    
    // Step 3: Delete all nodes associated with this project
    // Don't use count in RETURNING
    await db.delete(nodes)
      .where(eq(nodes.projectId, projectId));
    
    console.log(`[Action deleteProject] Deleted nodes for project ${projectId}`);
    
    // Step 4: Delete the project
    const [deletedProject] = await db.delete(projects)
      .where(eq(projects.id, projectId))
      .returning({
        id: projects.id,
        name: projects.name
      });
    
    if (!deletedProject) {
      console.error(`[Action deleteProject] Project ${projectId} not found after node deletion.`);
      return null;
    }
    
    console.log(`[Action deleteProject] Project ${projectId} "${deletedProject.name}" deleted successfully.`);
    return deletedProject;
    
  } catch (error) {
    console.error(`[Action deleteProject] Error deleting project ${projectId}:`, error);
    return null;
  }
};