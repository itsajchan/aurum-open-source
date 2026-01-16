import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ location: string }> }
) {
  try {
    const { location } = await params;

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const decodedLocation = decodeURIComponent(location);

    const result = await prisma.item.deleteMany({
      where: { location: decodedLocation },
    });

    return NextResponse.json({ 
      success: true, 
      deleted: result.count,
      location: decodedLocation 
    });
  } catch (error) {
    console.error("Delete location API error:", error);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}
