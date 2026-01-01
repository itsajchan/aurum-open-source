import { NextRequest, NextResponse } from "next/server";

const TRANSCRIBE_URL = process.env.TRANSCRIBE_URL || "http://127.0.0.1:9000/inference";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    // Forward to local transcription server (faster-whisper)
    const transcribeFormData = new FormData();
    transcribeFormData.append("file", audioFile);

    const response = await fetch(TRANSCRIBE_URL, {
      method: "POST",
      body: transcribeFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Transcription failed:", error);
      return NextResponse.json(
        { error: "Transcription failed. Make sure the faster-whisper server is running." },
        { status: 500 }
      );
    }

    const result = await response.json();
    
    // Handle various response formats
    const transcript = result.text || result.transcript || result.transcription || "";
    
    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Transcribe API error:", error);
    return NextResponse.json(
      { error: "An error occurred during transcription. Is the faster-whisper server running?" },
      { status: 500 }
    );
  }
}
