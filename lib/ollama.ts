// Ollama client for local AI (embeddings + chat)
import { Ollama } from "ollama";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "embeddinggemma:300m";
const LLM_MODEL = process.env.LLM_MODEL || "llama3.2:3b";

export const ollama = new Ollama({ host: OLLAMA_BASE_URL });

/**
 * Generate an embedding for the given text using Ollama's embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await ollama.embeddings({
    model: EMBEDDING_MODEL,
    prompt: text,
  });
  return response.embedding;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  format?: "json";
}

/**
 * Generate a chat completion using Ollama
 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const response = await ollama.chat({
    model: options.model || LLM_MODEL,
    messages,
    format: options.format,
    options: {
      temperature: options.temperature ?? 0.7,
    },
  });
  return response.message.content;
}

/**
 * Generate a chat completion with JSON response
 */
export async function chatJSON<T>(
  messages: ChatMessage[],
  options: Omit<ChatOptions, "format"> = {}
): Promise<T> {
  const content = await chat(messages, { ...options, format: "json" });
  return JSON.parse(content) as T;
}

/**
 * Create a text representation of an item for embedding
 */
export function itemToEmbeddingText(item: {
  name: string;
  description?: string | null;
}): string {
  if (item.description) {
    return `${item.name}. ${item.description}`;
  }
  return item.name;
}
