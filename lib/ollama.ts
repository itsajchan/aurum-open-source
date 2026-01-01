// Ollama client for local embeddings

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "embeddinggemma:300m";

interface OllamaEmbeddingResponse {
  embedding: number[];
}

/**
 * Generate an embedding for the given text using Ollama's embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      prompt: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama embedding failed: ${error}`);
  }

  const data: OllamaEmbeddingResponse = await response.json();
  return data.embedding;
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
