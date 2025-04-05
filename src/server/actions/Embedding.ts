'use server'

import { GoogleGenAI } from "@google/genai";

export default async function Embedding({
    query
}: {
    query: string
}) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: query,
    });

    if(response.embeddings !== undefined && response.embeddings.length > 0) {   
        const vector = response.embeddings[0]?.values;
        console.log("Vector: ", vector);
        return vector;
    }


    return null
}