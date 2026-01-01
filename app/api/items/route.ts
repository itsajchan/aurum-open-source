import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      orderBy: [
        { location: "asc" },
        { name: "asc" },
      ],
    });

    // Group items by location
    const grouped: Record<string, typeof items> = {};
    
    for (const item of items) {
      const location = item.location || "Uncategorized";
      if (!grouped[location]) {
        grouped[location] = [];
      }
      grouped[location].push(item);
    }

    return NextResponse.json({ items, grouped });
  } catch (error) {
    console.error("Items API error:", error);
    return NextResponse.json(
      { error: "An error occurred fetching items" },
      { status: 500 }
    );
  }
}
