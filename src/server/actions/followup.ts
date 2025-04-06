'use server'

import { generateObject } from "ai";
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from "zod";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const google  = createGoogleGenerativeAI({apiKey: GEMINI_API_KEY});

export default async function FollowUp({
    answer
}: {
    answer: string
}) {

    const model= await google.languageModel('gemini-2.0-flash')

    const res = await generateObject({
        model,
        schema: z.object({
            followupQuestions: z.array(z.string()),
            concepts: z.array(z.string())
        }),
        prompt: `
        Given the following answer from a web search result, generate 3 insightful and relevant short follow-up questions that a curious user might ask next. Focus on expanding the topic, clarifying ambiguities, or exploring related ideas in more depth. Also highlight words from the given answer as a concept to understand.
        Answer: ${answer}`
    })

    console.log("FollowUp Response: ", res.object.followupQuestions);
    console.log("Concepts: ", res.object.concepts);
   return {
        followupQuestions: res.object.followupQuestions,
        concepts: res.object.concepts
   }
}