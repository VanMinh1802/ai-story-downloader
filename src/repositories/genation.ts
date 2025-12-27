import OpenAI from "openai";

export const genation = (apiKey: string) => {
  return new OpenAI({
    apiKey: apiKey,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" // Using Google's OpenAI-compatible endpoint as hinted by the model name "google/gemini-..."
  });
};
