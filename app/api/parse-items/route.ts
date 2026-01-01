import { NextRequest, NextResponse } from "next/server";
import { chatJSON } from "@/lib/ollama";

interface ParsedItem {
  itemName: string;
  quantity: number;
}

const SYSTEM_PROMPT = `You are a helpful assistant that extracts inventory items from natural language descriptions.

Given a transcript of someone describing items in a location, extract each item mentioned and return a JSON array.

Each item should have:
- itemName: The name of the item (string)
- quantity: The number of items (number, default to 1 if not specified)

Rules:
- Extract ALL items mentioned
- If quantity is not specified, assume 1
- Normalize item names (e.g., "a couple of batteries" → quantity: 2)
- Handle phrases like "a few" (3), "several" (4), "a dozen" (12), "a couple" (2)
- Keep item names concise but descriptive

Example input: "I have three boxes of tissues, some hand soap, and about a dozen rolls of toilet paper"
Example output: {"items": [{"itemName": "boxes of tissues", "quantity": 3}, {"itemName": "hand soap", "quantity": 1}, {"itemName": "rolls of toilet paper", "quantity": 12}]}

Return a JSON object with an "items" array containing the extracted items.`;

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    try {
      const parsed = await chatJSON<{ items?: ParsedItem[] } | ParsedItem[]>(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: transcript },
        ],
        { temperature: 0.1 }
      );
      
      // Handle both array and object responses
      let itemsArray: unknown[];
      if (Array.isArray(parsed)) {
        itemsArray = parsed;
      } else if (parsed && typeof parsed === 'object') {
        itemsArray = parsed.items || Object.values(parsed)[0] || [];
      } else {
        itemsArray = [];
      }
      
      // Validate and clean the items
      const items: ParsedItem[] = (Array.isArray(itemsArray) ? itemsArray : [])
        .filter((item: unknown): item is Record<string, unknown> => {
          if (typeof item !== 'object' || item === null) return false;
          const obj = item as Record<string, unknown>;
          return typeof obj.itemName === 'string' && obj.itemName.trim().length > 0;
        })
        .map((item) => ({
          itemName: String(item.itemName).trim(),
          quantity: Math.max(1, Number(item.quantity) || 1),
        }));

      return NextResponse.json({ items });
    } catch (parseError) {
      console.error("LLM/Parse error:", parseError);
      return NextResponse.json({ error: "Failed to parse items" }, { status: 500 });
    }
  } catch (error) {
    console.error("Parse items API error:", error);
    return NextResponse.json(
      { error: "An error occurred parsing items" },
      { status: 500 }
    );
  }
}
