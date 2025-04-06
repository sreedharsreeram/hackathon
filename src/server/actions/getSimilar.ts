'use server'
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';

import { GoogleGenAI } from "@google/genai";
import { db } from "../db";
import { nodes, sources } from '../db/schema';

async function generateEmbedding({
description
}: {
    description: string;
}) {

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: description,
    });

    const vector = response.embeddings?.[0]?.values ?? [];

    console.log(response.embeddings);
    return vector;
}
export const findSimilarGuides = async ({
  query
}: {
  query: string
}) => {
  const embedding = await generateEmbedding({ description: query });
  console.log(sources.embedding)
  const similarity = sql<number>`1 - (${cosineDistance(sources.embedding, embedding)})`;
  const similarSources = await db
    .select({ 
      title: sources.title, 
      url: sources.url, 
      content: sources.content,
      similarity 
    })
    .from(sources)
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(4);
  return similarSources;
};