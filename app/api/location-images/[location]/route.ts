import { NextRequest, NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ location: string }> }
) {
  try {
    const { location } = await params;
    const decodedLocation = decodeURIComponent(location);
    
    // Create a safe filename pattern from location
    const safeLocation = decodedLocation
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "locations");
    
    try {
      const files = await readdir(uploadsDir);
      // Find the most recent image for this location
      const locationImages = files
        .filter(f => f.startsWith(safeLocation + "-"))
        .sort()
        .reverse();

      if (locationImages.length > 0) {
        return NextResponse.json({ 
          imageUrl: `/uploads/locations/${locationImages[0]}`,
          location: decodedLocation
        });
      }
    } catch {
      // Directory doesn't exist or is empty
    }

    return NextResponse.json({ imageUrl: null, location: decodedLocation });
  } catch (error) {
    console.error("Get location image error:", error);
    return NextResponse.json(
      { error: "Failed to get location image" },
      { status: 500 }
    );
  }
}
