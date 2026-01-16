import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateEmbedding, itemToEmbeddingText } from "@/lib/ollama";
import { toSql } from "pgvector";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const newName = body.name?.trim();
    const newQuantity = body.quantity !== undefined 
      ? Math.max(1, Number(body.quantity) || 1) 
      : undefined;

    // If name is being updated, regenerate the embedding
    if (newName) {
      const embeddingText = itemToEmbeddingText({ name: newName });
      
      try {
        const embedding = await generateEmbedding(embeddingText);
        
        // Update with new embedding using raw SQL for vector type
        await prisma.$executeRaw`
          UPDATE "Item" 
          SET name = ${newName}, 
              quantity = COALESCE(${newQuantity}, quantity),
              embedding = ${toSql(embedding)}::vector,
              "updatedAt" = NOW()
          WHERE id = ${id}
        `;
      } catch (embeddingError) {
        console.error("Failed to generate embedding, updating without it:", embeddingError);
        // Fall back to updating without embedding
        await prisma.item.update({
          where: { id },
          data: { 
            name: newName, 
            ...(newQuantity !== undefined && { quantity: newQuantity }) 
          },
        });
      }
    } else if (newQuantity !== undefined) {
      // Only quantity is being updated, no need to regenerate embedding
      await prisma.item.update({
        where: { id },
        data: { quantity: newQuantity },
      });
    }

    // Fetch the updated item to return
    const updated = await prisma.item.findUnique({ where: { id } });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Update item API error:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deleted: id });
  } catch (error) {
    console.error("Delete item API error:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
