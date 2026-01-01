import OpenAI from "openai";

export const openai = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL ? `${process.env.OLLAMA_BASE_URL}/v1` : "http://127.0.0.1:11434/v1",
  apiKey: process.env.OPENAI_API_KEY || "ollama", // Ollama doesn't need a real key
  timeout: 30000, // 30 second timeout
});
