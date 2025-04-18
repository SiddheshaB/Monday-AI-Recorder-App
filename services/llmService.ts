import { Template } from "../types/template";
import { RecordingSection } from "../types/recording";
import Groq from "groq-sdk";
import Constants from "expo-constants";

// Get API key from Expo Constants (should use extra field)
const getGroqApiKey = () => {
  try {
    return Constants.expoConfig?.extra?.GROQ_API_KEY || "";
  } catch (error) {
    console.error("Error getting API key:", error);
    return "";
  }
};

// Initialize Groq client with API key from config
const groqClient = new Groq({
  apiKey: getGroqApiKey(),
});

// Define types for Groq API since we don't have the actual package
interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqCompletionChoice {
  message: {
    content: string;
  };
}

interface GroqCompletionResponse {
  choices: GroqCompletionChoice[];
}

/**
 * Process a transcript with a template using Groq LLM
 * @param transcript The transcript text to process
 * @param template The template to use for processing
 * @returns An array of processed sections
 */
export const processTranscriptWithTemplate = async (
  transcript: string,
  template: Template
): Promise<RecordingSection[]> => {
  try {
    // Create a system prompt that explains what we want
    const systemPrompt = `
      You are an AI assistant that processes meeting transcripts.
      Your task is to analyze the provided transcript and extract information according to the specified sections.
      For each section, provide a concise summary based on the section description.
      Format your response as a JSON object with section titles as keys and processed content as values.
      
      Example response format:
      {
        "Section Title 1": "Processed content for section 1...",
        "Section Title 2": "Processed content for section 2...",
        "Section Title 3": "Processed content for section 3..."
      }
      
      Make sure to include all section titles as keys in your JSON response.
    `;

    // Create the user prompt with transcript and sections
    const userPrompt = `
      Here is the transcript of a meeting:
      
      "${transcript}"
      
      Please analyze this transcript and provide summaries for the following sections:
      
      ${template.sections
        .map((section) => `- ${section.title}: ${section.description}`)
        .join("\n")}
      
      Format your response as a JSON object with section titles as keys and processed content as values.
      
      Required response format:
      {
        ${template.sections.map(section => `"${section.title}": "Your analysis for ${section.title}..."`).join(",\n        ")}
      }
    `;

    // Prepare messages for the LLM
    const messages: GroqMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // Call the Groq API
    const chatCompletion = await groqClient.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    // Get the response content
    const content = chatCompletion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from LLM");
    }

    // Parse the JSON response
    const parsedContent = JSON.parse(content);

    // Convert to RecordingSection array
    const processedSections: RecordingSection[] = template.sections.map(
      (section) => ({
        title: section.title,
        content:
          parsedContent[section.title] ||
          "No content generated for this section",
      })
    );

    return processedSections;
  } catch (error) {
    console.error("Error processing transcript with LLM:", error);

    // Return fallback sections if LLM processing fails
    return template.sections.map((section) => ({
      title: section.title,
      content: "Failed to process this section. Please try again later.",
    }));
  }
};
