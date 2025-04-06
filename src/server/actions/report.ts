;'use server'
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';


// Define the SourceData type
type SourceData = {
  title: string;
  url: string;
  content: string;
}
// Define the SourceData type
// server-side action to generate the report
export const generateReport = async ({
  query,
  sources,
}: {
  query: string;
  sources: SourceData[];
}): Promise<string> => {
  if (!query || sources.length === 0) {
    return "Missing query or sources for report generation.";
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY environment variable");
    throw new Error("API key configuration missing");
  }

  // Format source data for the prompt
  const formattedSources = sources.map((source, index) => 
    `Source ${index + 1}:\nTitle: ${source.title}\nURL: ${source.url}\nContent Snippet:\n${source.content}\n--------------------`
  ).join('\n\n');

  const userPrompt = `
**Objective:** Generate a detailed, well-structured academic report based on the query and sources below.

**User Query:**
${query}

**Provided Source Material:**
${formattedSources}

**Report Generation Instructions:**

1.  **Format:** Use standard Markdown (## headings, ### subheadings, lists, bold). Use blank lines correctly.
2.  **Structure (Mandatory - Use these exact headings):**
    *   ## Abstract
    *   ## Introduction
    *   ## Analysis and Findings
    *   ## Conclusion
    *   ## References
3.  **Content Generation:**
    *   **Abstract:** 2-3 sentence overview.
    *   **Introduction:** Introduce topic from query and scope based on sources.
    *   **Analysis and Findings:** Synthesize source info to answer query. Use ### subheadings. Cite inline: (Source: [Title]).
    *   **Conclusion:** Summarize key findings from the analysis.
    *   **References:** List all sources: 1. [Title](URL).
4.  **Tone & Scope:** Formal, objective. Use ONLY provided source snippets.
`;

  const systemPrompt = "You are a research assistant. Generate a formal academic report in valid Markdown format ONLY. Follow all structure and content instructions strictly.";

  try {
    // Initialize the Google AI client properly
    const ai = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY });
    // Get the appropriate language model
    const model = ai.languageModel('gemini-2.0-flash');

    // Generate the text using the properly initialized model
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 4096
    });

    if (!result || !result.text) {
      throw new Error("No report Markdown was generated.");
    }

    return result.text;
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate report. Please try again.");
  }
};