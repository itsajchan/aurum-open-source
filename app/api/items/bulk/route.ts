import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEmbedding, itemToEmbeddingText } from "@/lib/ollama";
import { toSql } from "pgvector";

interface BulkItemInput {
  itemName: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const { location, items } = await request.json() as { 
      location: string; 
      items: BulkItemInput[] 
    };

    if (!location || typeof location !== "string") {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 });
    }

    const createdItems = [];
    const now = new Date();

    for (const item of items) {
      if (!item.itemName || typeof item.itemName !== "string") {
        continue; // Skip invalid items
      }

      const quantity = typeof item.quantity === "number" && item.quantity > 0 
        ? item.quantity 
        : 1;

      // Generate embedding
      const embeddingText = itemToEmbeddingText({ name: item.itemName });
      let embedding: number[] | null = null;
      
      try {
        embedding = await generateEmbedding(embeddingText);
      } catch (error) {
        console.error("Failed to generate embedding for:", item.itemName, error);
      }

      const id = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;

      if (embedding) {
        await prisma.$executeRaw`
          INSERT INTO "Item" (id, name, description, location, quantity, "usageFrequency", image, embedding, "createdAt", "updatedAt")
          VALUES (
            ${id},
            ${item.itemName},
            ${null},
            ${location},
            ${quantity},
            ${null},
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
            ${item.itemName},
            ${null},
            ${location},
            ${quantity},
            ${null},
            ${null},
            ${now},
            ${now}
          )
        `;
      }

      createdItems.push({
        id,
        name: item.itemName,
        quantity,
        location,
      });
    }

    return NextResponse.json({ 
      success: true, 
      created: createdItems.length,
      items: createdItems 
    });
  } catch (error) {
    console.error("Bulk items API error:", error);
    return NextResponse.json(
      { error: "An error occurred creating items" },
      { status: 500 }
    );
  }
}
