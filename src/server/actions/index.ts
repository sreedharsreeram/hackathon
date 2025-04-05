'use server'

import { auth } from "../auth";
import { db } from "../db";
import { nodes, projects, sources } from "../db/schema";
import Embedding from "./Embedding";


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
    projectId
  }: {
    node: WebSearchType;
    projectId: number;
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
  
    // Now insert the node with the verified project ID
    const [nodeDB] = await db.insert(nodes)
      .values({
        answer: node.answer,
        images: node.images,
        query: node.query,
        results: node.results,
        userId: session.user.id,
        projectId: projectId,
      })
      .returning({ id: nodes.id });
  
    if (!nodeDB) {
      console.error("Failed to insert node");
      return null;
    }
  
    // Use Promise.all to wait for all source insertions
    const sourcesPromises = node.results.map(async (result) => {
      const embeddingVector = await Embedding({ query: result.content });
      
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
    
    return nodeDB;
  };