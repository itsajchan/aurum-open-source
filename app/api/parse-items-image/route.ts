import { NextRequest, NextResponse } from "next/server";
import ollama from "ollama";

interface ParsedItem {
  itemName: string;
  quantity: number;
}

const VISION_MODEL = process.env.VISION_MODEL || "qwen3-vl";

const SYSTEM_PROMPT = `You are a helpful assistant that identifies inventory items from images.

Given an image of items (such as a pantry, shelf, storage area, or individual items), identify each item visible and return a JSON array.

Each item should have:
- itemName: The name of the item (string)
- quantity: The number of items visible (number, default to 1 if not clearly countable)

Rules:
- Identify ALL visible items in the image
- If quantity is not clearly visible, assume 1
- Keep item names concise but descriptive
- Include brand names if clearly visible (e.g., "Tide laundry detergent")
- Group identical items together with their count

Return a JSON object with an "items" array containing the identified items.
Example output: {"items": [{"itemName": "boxes of tissues", "quantity": 3}, {"itemName": "hand soap", "quantity": 1}]}`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    console.log("Processing image for item extraction, size:", buffer.length);

    try {
      const response = await ollama.chat({
        model: VISION_MODEL,
        messages: [
          {
            role: "user",
            content: SYSTEM_PROMPT,
            images: [base64Image],
          },
        ],
      });

      const content = response.message.content;
      console.log("Vision model response:", content);

      if (!content) {
        return NextResponse.json({ items: [] });
      }

      // Try to extract JSON from the response
      let parsed;
      try {
        // First try direct JSON parse
        parsed = JSON.parse(content);
      } catch {
        // Try to find JSON in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          console.error("Could not find JSON in response:", content);
          return NextResponse.json({ items: [], rawResponse: content });
        }
      }

      // If it's wrapped in an object, extract the array
      if (parsed && !Array.isArray(parsed)) {
        parsed = parsed.items || parsed.data || Object.values(parsed)[0] || [];
      }

      // Validate and clean the items
      const items: ParsedItem[] = (Array.isArray(parsed) ? parsed : [])
        .filter((item: unknown) => {
          if (typeof item !== "object" || item === null) return false;
          const obj = item as Record<string, unknown>;
          return typeof obj.itemName === "string" && obj.itemName.trim();
        })
        .map((item: Record<string, unknown>) => ({
          itemName: String(item.itemName).trim(),
          quantity: Math.max(1, Number(item.quantity) || 1),
        }));

      return NextResponse.json({ items });
    } catch (parseError) {
      console.error("Vision model error:", parseError);
      const errorMsg = parseError instanceof Error ? parseError.message : String(parseError);
      return NextResponse.json(
        { error: `Failed to analyze image: ${errorMsg}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Parse items image API error:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `An error occurred: ${errorMsg}` },
      { status: 500 }
    );
  }
}
