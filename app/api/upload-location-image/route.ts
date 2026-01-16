import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const location = formData.get("location") as string | null;

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    // Create a safe filename from location
    const safeLocation = location
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    
    const timestamp = Date.now();
    const ext = image.name.split(".").pop() || "jpg";
    const filename = `${safeLocation}-${timestamp}.${ext}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "locations");
    await mkdir(uploadsDir, { recursive: true });

    // Write the file
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Return the public URL path
    const imageUrl = `/uploads/locations/${filename}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      location 
    });
  } catch (error) {
    console.error("Upload location image error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
