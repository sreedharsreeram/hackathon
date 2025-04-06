'use server'

import { auth } from "../auth";
import { db } from "../db";
import { nodes, projects, sources } from "../db/schema";
import Embedding from "./Embedding";
import FollowUp from "./followup";
import websearch from "./Websearch";
import { eq } from "drizzle-orm";


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

  export const createProject = async () => {
    const session = await auth();
    if (!session) {
      return null;
    }
    
    // Return the created project ID
    const [project] = await db.insert(projects)
      .values({
        userId: session.user.id,
      })
      .returning({ id: projects.id });
      
    return project;
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
    
    return nodeDB;
  };

  export default async function doEverything({query , projectId, parentId}: { // Add parentId here
    query: string;
    projectId: number;
    parentId?: number;// Make parentId optional and type number
  }) {
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
    
    const nodes = await db.query.nodes.findMany({
      where: (nodes, { eq }) => eq(nodes.projectId, projectId),
    });
    
    return nodes;
  }

  export const getProjects = async () => {
    const session = await auth();
    if (!session) {
      return null;
    }
    
    const projects = await db.query.projects.findMany({
      where: (projects, { eq }) => eq(projects.userId, session.user.id),
    });
    
    return projects;
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