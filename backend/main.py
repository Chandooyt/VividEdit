import os
import shutil
import threading
import time
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel

from process_video import process_video

from datetime import datetime

# ── Setup ──────────────────────────────────────────────────────
app = FastAPI(title="VIVID Upload API")
from fastapi.staticfiles import StaticFiles

app.mount(
    "/processed",
    StaticFiles(directory="processed"),
    name="processed"
)

UPLOAD_DIR    = Path("uploads")
PROCESSED_DIR = Path("processed")
UPLOAD_DIR.mkdir(exist_ok=True)     # creates uploads/   if missing
PROCESSED_DIR.mkdir(exist_ok=True)  # creates processed/ if missing

# ── CORS — allows the React frontend (any localhost port) to call this API ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Serve processed/ folder as static files so the browser can download them ──
# Accessing http://127.0.0.1:8000/processed/video_vivid.mp4 will stream the file.
app.mount("/processed", StaticFiles(directory="processed"), name="processed")

class Feedback(BaseModel):
    rating: int
    liked: str
    frustrated: str
    feature: str


# ── Routes ─────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "message": "VIVID API is running"}


@app.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    prompt: str = Form("")
):

    # ── 1. Validate file type ───────────────────────────────────
    if file.content_type not in ("video/mp4", "video/mpeg"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Only MP4 files are accepted.",
        )

    # ── 2. Save uploaded file to disk ──────────────────────────
    safe_name = Path(file.filename).name   # strip any directory traversal
    dest      = UPLOAD_DIR / safe_name

    try:
        with dest.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not save file: {exc}")
    finally:
        await file.close()

    file_size_mb = round(dest.stat().st_size / (1024 * 1024), 2)
    if file_size_mb > 100:

        os.remove(dest)

        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": "Video too large. Max 100MB."
            }
        )
    print(f"[VIVID] Saved upload: {dest} ({file_size_mb} MB)")

    # ── 3. Run FFmpeg silence-removal processor ─────────────────
    print(f"[VIVID] Starting processor for: {dest}")
    try:

        processing_result = process_video(
            str(dest),
            prompt
        )

    except Exception as e:

        print(f"[UPLOAD ERROR] {e}")

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(e)
            }
        )

    # DELETE UPLOADED FILE AFTER PROCESSING
    try:
        if os.path.exists(dest):
            os.remove(dest)
            print(f"[VIVID AI] Deleted upload file → {dest}")

    except Exception as e:
        print(f"[VIVID AI] Failed to delete upload → {e}")
    print(f"[VIVID] Processor result: {processing_result}")

    # ── 4. Build the download path the frontend will use ────────
    # processor.py saves to e.g. "processed/video_vivid.mp4"
    # We expose that as a URL: http://127.0.0.1:8000/processed/video_vivid.mp4
      # ── 4. Build processed video URL ─────────────────────

    processed_video = ""

    if (
        processing_result.get("success")
        and processing_result.get("output_path")
    ):

        output_name = Path(
            processing_result["output_path"]
        ).name

        processed_video = (
            f"/processed/{output_name}"
        )

        print(
            f"[VIVID AI] Processed Video URL → {processed_video}"
        )

        # AUTO DELETE AFTER 1 HOUR
        auto_delete_processed(
            processing_result["output_path"],
            3600
        )

    # ── 5. Return combined JSON response ────────────────────────
    return JSONResponse(
        status_code=200,
        content={
            # Upload info
            "success":    True,
            "message":    processing_result.get("message", "File uploaded successfully"),
            "filename":   safe_name,
            "saved_to":   str(dest),
            "size_mb":    file_size_mb,

            # Processor info (used by the frontend download button)
            "processed_video": processed_video,   # e.g. "processed/video_vivid.mp4"
            "processing": processing_result,       # full processor dict for debugging
        },
    )

@app.post("/feedback")
async def save_feedback(data: Feedback):

    with open("feedback.txt", "a", encoding="utf-8") as f:

        f.write("\n")
        f.write("=" * 60 + "\n")
        f.write("🟣 VIVID BETA TESTER\n")
        f.write(f"Date: {datetime.now()}\n")
        f.write(f"Rating: {data.rating}/5 ⭐\n")
        f.write("\n")

        f.write("👍 What did you like?\n")
        f.write(data.liked + "\n\n")

        f.write("😡 What frustrated you?\n")
        f.write(data.frustrated + "\n\n")

        f.write("💡 Feature request\n")
        f.write(data.feature + "\n")

        f.write("=" * 60 + "\n")

    return {
        "success": True,
        "message": "Thanks for being a VIVID Beta Tester!"
    }


# ── AUTO DELETE PROCESSED VIDEOS ─────────────────────────────
def auto_delete_processed(
    file_path: str,
    delay_seconds: int = 3600
):

    def delete_file():

        time.sleep(delay_seconds)

        try:

            if os.path.exists(file_path):

                os.remove(file_path)

                print(
                    f"[VIVID AI] Auto-deleted processed → {file_path}"
                )

        except Exception as e:

            print(
                f"[VIVID AI] Auto-delete failed → {e}"
            )

    thread = threading.Thread(
        target=delete_file
    )

    thread.daemon = True

    thread.start()

# ── Run ────────────────────────────────────────────────────────
# Start with:  uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)