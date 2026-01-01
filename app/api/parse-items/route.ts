import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

interface ParsedItem {
  itemName: string;
  quantity: number;
}

const LLM_MODEL = process.env.LLM_MODEL || "llama3.2:3b";

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
      const response = await openai.chat.completions.create({
        model: LLM_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: transcript },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });
      
      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        return NextResponse.json({ items: [] });
      }

      // Parse the response - it might be an array directly or wrapped in an object
      let parsed = JSON.parse(content);
      
      // If it's wrapped in an object (e.g., { items: [...] }), extract the array
      if (parsed && !Array.isArray(parsed)) {
        parsed = parsed.items || parsed.data || Object.values(parsed)[0] || [];
      }
      
      // Validate and clean the items
      const items: ParsedItem[] = (Array.isArray(parsed) ? parsed : [])
        .filter((item: unknown) => {
          if (typeof item !== 'object' || item === null) return false;
          const obj = item as Record<string, unknown>;
          return typeof obj.itemName === 'string' && obj.itemName.trim();
        })
        .map((item: Record<string, unknown>) => ({
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
