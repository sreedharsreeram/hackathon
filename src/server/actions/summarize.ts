'use server'

// Use imports from Vercel AI SDK
import { generateText } from "ai";
import { createGoogleGenerativeAI } from '@ai-sdk/google'

// Ensure GEMINI_API_KEY is accessible in your environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set.");
}

// Instantiate the Google AI client using the Vercel AI SDK helper
const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY });

export const summarizeResources = async ({ content }: { content: string }): Promise<string> => {
  if (!content.trim()) {
    return "No content provided to summarize.";
  }

  // Get the language model instance
  // Using 1.5 Flash as specified, ensure this model supports generateText well for your use case
  const model = google('gemini-1.5-flash'); 

  // A more robust prompt
  const prompt = `Your task is to provide a concise summary of the key points from the provided text, which consists of concatenated content from multiple web sources.
Focus on the main ideas and distinct information presented in each part. Ignore repeated information if sources overlap significantly.

---
${content}
---

Summary:`;

  try {
    console.log("Sending content to Gemini for summarization via AI SDK...");
    
    // Use generateText from the AI SDK
    const { text: summary } = await generateText({
        model,
        prompt,
    });

    if (!summary) {
         throw new Error("No summary text was generated.");
    }

    console.log("Summary generated successfully via AI SDK.");
    return summary;

  } catch (error) {
    console.error("Error generating summary via AI SDK:", error);
    throw new Error("Failed to generate summary. Please try again."); 
  }
}; 