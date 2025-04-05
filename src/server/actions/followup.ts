'use server'

import { GoogleGenAI } from "@google/genai";

export default async function FollowUp({
    answer
}: {
    answer: string
}) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: answer,
        config: {
            
        }
    });


    return null
}