import OpenAI from "openai";

const directKey = process.env.OPENROUTER_API_KEY;

if (!directKey) {
  if (!process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL) {
    throw new Error(
      "AI_INTEGRATIONS_OPENROUTER_BASE_URL must be set. Did you forget to provision the OpenRouter AI integration?",
    );
  }
  if (!process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY) {
    throw new Error(
      "AI_INTEGRATIONS_OPENROUTER_API_KEY must be set. Did you forget to provision the OpenRouter AI integration?",
    );
  }
}

export const openrouter = new OpenAI({
  baseURL: directKey
    ? "https://openrouter.ai/api/v1"
    : process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL!,
  apiKey: directKey ?? process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY!,
});
