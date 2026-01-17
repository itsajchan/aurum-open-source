import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEmbedding, itemToEmbeddingText, chat, chatJSON } from "@/lib/ollama";
import { toSql } from "pgvector";
import type { IntentResponse, ChatResponse, Item } from "@/lib/types/intent";

interface QueryExtraction {
  searchQuery: string | null;
  isAddIntent: boolean;
}

async function extractSearchQuery(userMessage: string): Promise<QueryExtraction> {
  const systemPrompt = `You are a query extraction assistant. Your job is to extract the specific item or thing the user is looking for from their message.

Rules:
1. If the user is SEARCHING for something (asking where it is, if they have it, looking for it), extract just the item name.
2. If the user is ADDING something to inventory, set isAddIntent to true and searchQuery to null.
3. Extract only the core item name, not descriptors like "my" or "the" or "extra".

Examples:
- "Where's my toilet paper?" → {"searchQuery": "toilet paper", "isAddIntent": false}
- "Do I have any batteries?" → {"searchQuery": "batteries", "isAddIntent": false}
- "Where did I put the extra toothpaste?" → {"searchQuery": "toothpaste", "isAddIntent": false}
- "I have 3 bottles of shampoo in the bathroom" → {"searchQuery": null, "isAddIntent": true}
- "Add my new headphones to the desk" → {"searchQuery": null, "isAddIntent": true}
- "Find my charger" → {"searchQuery": "charger", "isAddIntent": false}

Respond with JSON only: {"searchQuery": "item name" or null, "isAddIntent": true/false}`;

  try {
    return await chatJSON<QueryExtraction>(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      { temperature: 0.1 }
    );
  } catch {
    // Fallback: use the full message for search
    return { searchQuery: userMessage, isAddIntent: false };
  }
}

function buildSystemPrompt(userItems: Item[]): string {
  const itemsList = userItems.length > 0
    ? userItems.map(item => {
        const parts = [`- ${item.name} (id: ${item.id})`];
        if (item.quantity > 1) parts.push(`qty: ${item.quantity}`);
        if (item.location) parts.push(`location: ${item.location}`);
        if (item.description) parts.push(`desc: ${item.description}`);
        return parts.join(", ");
      }).join("\n")
    : "(No items in inventory yet)";
    console.log(itemsList);
    console.log("YOUR ITEMS")

  return `You are an AI assistant for a home inventory management system called Aurum. 
Your job is to understand user intent and extract structured data from their natural language input.

## USER'S CURRENT INVENTORY:
${itemsList}

You must respond with a JSON object in one of these formats:

1. When the user wants to ADD an item to their inventory:
{
  "intent": "ADD_ITEM",
  "data": {
    "name": "item name (required)",
    "description": "item description (optional)",
    "location": "where the item is stored (optional)",
    "quantity": number (optional, default 1),
    "usageFrequency": "how often it's used - e.g., 'daily', 'weekly', 'rarely' (optional)"
  }
}

2. When the user wants to FIND or VIEW an item (use the exact item IDs from the inventory above):
{
  "intent": "VIEW_ITEM",
  "data": {
    "itemIds": ["id1", "id2"] // Array of matching item IDs from the inventory
  }
}

3. ONLY when the message is completely unrelated to inventory (e.g., "What's the weather?"):
{
  "intent": "UNKNOWN",
  "data": {
    "message": "A helpful message explaining you can only help with inventory"
  }
}

IMPORTANT RULES:
- If the user is asking about, searching for, or looking for ANY item, ALWAYS use VIEW_ITEM with the matching item IDs from the inventory.
- If items exist in the inventory that match the query, include their IDs in itemIds.
- If no items match, return VIEW_ITEM with an empty itemIds array - do NOT ask for clarification.
- Do NOT return UNKNOWN for search queries. UNKNOWN is ONLY for non-inventory questions.

Examples:
- "Where's my toilet paper?" → VIEW_ITEM with itemIds of toilet paper items
- "I have 3 bottles of shampoo in the bathroom cabinet" → ADD_ITEM with name="shampoo", quantity=3, location="bathroom cabinet"
- "Where did I put the extra toothpaste?" → VIEW_ITEM with itemIds of matching items from inventory
- "Add my new headphones to the office desk drawer" → ADD_ITEM with name="headphones", location="office desk drawer"
- "Do I have any batteries?" → VIEW_ITEM with itemIds of any battery-related items
- "Find my charger" → VIEW_ITEM with itemIds of charger items

For VIEW_ITEM, match items semantically - "toilet paper" matches "TP", "bathroom tissue", etc.

Always respond with valid JSON only, no additional text.`;
}

async function parseIntent(userMessage: string, userItems: Item[]): Promise<IntentResponse> {
  const systemPrompt = buildSystemPrompt(userItems);
  
  try {
    return await chatJSON<IntentResponse>(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      { temperature: 0.1 }
    );
  } catch {
    return {
      intent: "UNKNOWN",
      data: { message: "I had trouble processing that. Please try again." },
    };
  }
}

async function generateNaturalResponse(
  userMessage: string,
  items: Item[],
  intent: "VIEW_ITEM" | "ADD_ITEM"
): Promise<string> {
  const itemsContext = items.length > 0
    ? items.map(item => {
        const parts = [`- ${item.name}`];
        if (item.quantity > 1) parts.push(`(${item.quantity}x)`);
        if (item.location) parts.push(`in ${item.location}`);
        if (item.description) parts.push(`- ${item.description}`);
        return parts.join(" ");
      }).join("\n")
    : "No items found.";

  const systemPrompt = intent === "VIEW_ITEM"
    ? `You are a helpful assistant for a home inventory app called Aurum. The user asked about their inventory and here are the matching items:

${itemsContext}

Respond naturally and conversationally to the user's question. Be concise but helpful. If no items were found, suggest they might want to add the item to their inventory.`
    : `You are a helpful assistant for a home inventory app called Aurum. The user just added an item to their inventory:

${itemsContext}

Confirm the addition naturally and conversationally. Be concise and friendly.`;

  return await chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    { temperature: 0.7 }
  );
}

async function handleAddItem(
  data: { name: string; description?: string; location?: string; quantity?: number; usageFrequency?: string }
): Promise<Item> {
  // Generate embedding text from item data
  const embeddingText = itemToEmbeddingText(data);
  
  // Generate embedding using Ollama
  let embedding: number[] | null = null;
  try {
    embedding = await generateEmbedding(embeddingText);
  } catch (error) {
    console.error("Failed to generate embedding:", error);
    // Continue without embedding if Ollama is unavailable
  }

  // Use raw SQL to insert with vector embedding
  const id = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date();
  
  if (embedding) {
    await prisma.$executeRaw`
      INSERT INTO "Item" (id, name, description, location, quantity, "usageFrequency", image, embedding, "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${data.name},
        ${data.description || null},
        ${data.location || null},
        ${data.quantity || 1},
        ${data.usageFrequency || null},
        ${null},
        ${toSql(embedding)}::vector,
        ${now},
        ${now}
      )
    `;
  } else {
    await prisma.$executeRaw`
      INSERT INTO "Item" (id, name, description, location, quantity, "usageFrequency", image, "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${data.name},
        ${data.description || null},
        ${data.location || null},
        ${data.quantity || 1},
        ${data.usageFrequency || null},
        ${null},
        ${now},
        ${now}
      )
    `;
  }

  // Fetch the created item
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) {
    throw new Error("Failed to create item");
  }

  return item as Item;
}

interface SimilarItem extends Item {
  similarity: number;
}

const SIMILARITY_THRESHOLD = 0.7;

async function searchSimilarItems(
  query: string,
  limit: number = 10
): Promise<SimilarItem[]> {
  // Generate embedding for the search query
  let queryEmbedding: number[];
  try {
    queryEmbedding = await generateEmbedding(query);
  } catch (error) {
    console.error("Failed to generate query embedding:", error);
    return [];
  }

  // Use pgvector cosine similarity search with threshold filtering
  // Cosine distance ranges from 0 (identical) to 2 (opposite)
  // We filter where similarity (1 - distance) > threshold
  const items = await prisma.$queryRaw<SimilarItem[]>`
    SELECT 
      id,
      name,
      description,
      location,
      quantity,
      "usageFrequency",
      image,
      "createdAt",
      "updatedAt",
      1 - (embedding <=> ${toSql(queryEmbedding)}::vector) as similarity
    FROM "Item"
    WHERE embedding IS NOT NULL
      AND 1 - (embedding <=> ${toSql(queryEmbedding)}::vector) > ${SIMILARITY_THRESHOLD}
    ORDER BY embedding <=> ${toSql(queryEmbedding)}::vector
    LIMIT ${limit}
  `;

  return items;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Step 1: Extract the search query from the user message
    const queryExtraction = await extractSearchQuery(message);
    console.log("[Chat] Query extraction:", queryExtraction);

    // Step 2: Search for similar items using vector search on the extracted query
    // Use the extracted search query if available, otherwise fall back to full message
    const searchTerm = queryExtraction.searchQuery || message;
    const similarItems = queryExtraction.isAddIntent 
      ? [] // Skip vector search for add intents
      : await searchSimilarItems(searchTerm, 10);
    
    console.log("[Chat] Similar items found:", similarItems.length, "for query:", searchTerm);

    // Step 3: Parse intent using LLM with similar items as context
    const intent = await parseIntent(message, similarItems);

    let result: ChatResponse["result"];

    switch (intent.intent) {
      case "ADD_ITEM": {
        const item = await handleAddItem(intent.data);
        // Generate natural language response
        const naturalMessage = await generateNaturalResponse(message, [item], "ADD_ITEM");
        result = {
          success: true,
          item,
          message: naturalMessage,
        };
        break;
      }

      case "VIEW_ITEM": {
        const itemIds = intent.data.itemIds || [];
        // Filter similar items to only those selected by LLM
        const items = similarItems.filter(item => itemIds.includes(item.id));
        // Generate natural language response
        const naturalMessage = await generateNaturalResponse(message, items, "VIEW_ITEM");
        result = {
          success: true,
          items,
          message: naturalMessage,
        };
        break;
      }

      case "UNKNOWN":
      default: {
        result = {
          success: false,
          message: intent.data.message,
        };
        break;
      }
    }

    const response: ChatResponse = { intent, result };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
