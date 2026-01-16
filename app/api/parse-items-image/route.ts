import { NextRequest, NextResponse } from "next/server";

interface ParsedItem {
  itemName: string;
  quantity: number;
}

const VISION_MODEL = process.env.VISION_MODEL || "qwen3-vl:latest";

const SYSTEM_PROMPT = `Identify items in this image. Return ONLY valid JSON, no explanation.

Format: {"items": [{"itemName": "item name", "quantity": 1}]}

Be concise with item names. Return JSON immediately:`;

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
      const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
      const chatResponse = await fetch(`${ollamaHost}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: VISION_MODEL,
          messages: [
            {
              role: "user",
              content: SYSTEM_PROMPT,
              images: [base64Image],
            },
          ],
          format: "json",
          stream: false,
          think: false,
          options: {
            num_predict: 4096,
          },
          keep_alive: "10m",
        }),
        signal: AbortSignal.timeout(10 * 60 * 1000),
      });

      if (!chatResponse.ok) {
        throw new Error(`Ollama API error: ${chatResponse.status}`);
      }

      const response = await chatResponse.json();
      console.log("Full Ollama response:", JSON.stringify(response, null, 2));
      const content = response.message?.content || "";
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
