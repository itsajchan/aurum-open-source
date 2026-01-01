from fastapi import FastAPI, File, UploadFile
from faster_whisper import WhisperModel
import uvicorn
import tempfile

app = FastAPI()
model = WhisperModel("medium", device="cpu")   # or "large-v3" w/ Metal if installed

@app.post("/inference")
async def transcribe(file: UploadFile = File(...)):
    # Save uploaded file
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    segments, _ = model.transcribe(tmp_path)
    text = "".join([seg.text for seg in segments])

    return {"text": text}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)

