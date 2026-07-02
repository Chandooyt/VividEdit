"""
processor.py — VIVID AI Video Processor
========================================
Detects and removes silent / dead-air sections from an uploaded MP4 using FFmpeg.
Optimised for YouTube-style talking-head videos.

Requirements:
    pip install ffmpeg-python

FFmpeg must also be installed on your system:
    Ubuntu / Debian : sudo apt install ffmpeg
    macOS (Homebrew): brew install ffmpeg
    Windows         : https://ffmpeg.org/download.html  (add to PATH)

Usage (standalone):
    python processor.py input.mp4

Usage (from FastAPI):
    from processor import process_video
    result = process_video("uploads/my_video.mp4")
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

from video_analyzer import analyze_video

# ── Output folder ──────────────────────────────────────────────
OUTPUT_DIR = Path("processed")
OUTPUT_DIR.mkdir(exist_ok=True)   # creates processed/ automatically

# ── Silence-detection tuning ───────────────────────────────────
# Lower SILENCE_THRESHOLD  → detects quieter silences (more aggressive cuts)
SILENCE_THRESHOLD = -22          # dB  — good default for talking-head audio

# ──────────────────────────────────────────────────────────────
# 1.  DETECT SILENCE
# ──────────────────────────────────────────────────────────────
def detect_silence(
    input_path: str,
    silence_duration: float
) -> list[dict]:
    """
    Run FFmpeg's silencedetect filter and return a list of silent intervals.

    Returns:
        [ {"start": float, "end": float}, ... ]
    """
    cmd = [
        "ffmpeg", "-i", input_path,
        "-af", f"silencedetect=noise={SILENCE_THRESHOLD}dB:d={silence_duration}",
        "-f", "null", "-",          # no output file — we only want the log
    ]

    print(f"[VIVID] Analysing audio: {input_path}")

    result = subprocess.run(
        cmd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
    )

    stderr = result.stderr or ""

    # Parse silence_start / silence_end pairs from the FFmpeg log
    starts = [float(x) for x in re.findall(r"silence_start:\s*([\d.]+)", stderr)]
    ends   = [float(x) for x in re.findall(r"silence_end:\s*([\d.]+)",   stderr)]

    # If the video ends mid-silence there may be one extra start with no end;
    # get the total duration to close it off.
    if len(starts) > len(ends):
        dur_match = re.search(r"Duration:\s*(\d+):(\d+):([\d.]+)", stderr)
        if dur_match:
            h, m, s = dur_match.groups()
            total = int(h)*3600 + int(m)*60 + float(s)
            ends.append(total)

    intervals = [{"start": s, "end": e} for s, e in zip(starts, ends)]
    print(f"[VIVID] Found {len(intervals)} silent interval(s).")
    return intervals


# ──────────────────────────────────────────────────────────────
# 2.  BUILD KEEP SEGMENTS  (invert the silence list)
# ──────────────────────────────────────────────────────────────
def build_keep_segments(
    silence_intervals: list[dict],
    total_duration: float,
    pad_seconds: float,
) -> list[dict]:
    """
    Convert silent intervals into the segments we WANT TO KEEP.

    A small PAD_SECONDS is left at the edges of every cut so the audio
    doesn't feel clipped — this is what makes the edit feel natural.
    """
    keep = []
    cursor = 0.0

    for silence in silence_intervals:
        seg_end   = silence["start"] + pad_seconds     # keep a tiny tail
        seg_start = cursor

        if seg_end > seg_start + 0.3:                 # skip micro-segments
            keep.append({"start": seg_start, "end": seg_end})

        cursor = max(cursor, silence["end"] - pad_seconds)   # next segment starts here

    # Keep everything after the last silence until the end of the video
    if cursor < total_duration - 0.05:
        keep.append({"start": cursor, "end": total_duration})

    print(f"[VIVID] Keeping {len(keep)} segment(s) out of full video.")
    return keep


# ──────────────────────────────────────────────────────────────
# 3.  GET VIDEO DURATION
# ──────────────────────────────────────────────────────────────
def get_duration(input_path: str) -> float:
    """Return the total duration of a video file in seconds."""
    cmd = [
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        input_path,
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    info   = json.loads(result.stdout)
    return float(info["format"]["duration"])


# ──────────────────────────────────────────────────────────────
# 4.  CUT & CONCATENATE WITH FFMPEG
# ──────────────────────────────────────────────────────────────
def cut_and_join(input_path: str, segments: list[dict], output_path: str) -> None:

    if not segments:
        raise ValueError("No segments to keep — the entire video may be silent.")

    temp_files = []

    for i, seg in enumerate(segments):

        temp_path = OUTPUT_DIR / f"_tmp_seg_{i:04d}.mp4"

        duration = seg["end"] - seg["start"]

        if duration < 0.3:
            continue

        cmd = [
            "ffmpeg",
            "-y",

            "-ss", str(seg["start"]),

            "-i", input_path,

            "-t", str(duration),

            "-c:v", "libx264",

            "-preset", "ultrafast",

            "-threads", "0",

            "-crf", "32",

            "-c:a", "aac",

            "-b:a", "96k",

            "-movflags", "+faststart",

            str(temp_path),
        ]

        subprocess.run(
            cmd,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True,
        )

        temp_files.append(temp_path)

    list_file = OUTPUT_DIR / "_concat_list.txt"

    with open(list_file, "w") as f:
        for tf in temp_files:
            f.write(f"file '{tf.name}'\n")

    cmd = [
        "ffmpeg",
        "-y",

        "-f", "concat",

        "-safe", "0",

        "-i", str(list_file),

        "-c:v", "libx264",

        "-preset", "ultrafast",

        "-threads", "0",

        "-crf", "32",

        "-c:a", "aac",

        "-b:a", "96k",

        "-movflags", "+faststart",

        output_path,
    ]

    subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )

    for tf in temp_files:
        tf.unlink(missing_ok=True)

    list_file.unlink(missing_ok=True)

# ──────────────────────────────────────────────────────────────
# 5.  MAIN ENTRY-POINT  (used by FastAPI or CLI)
# ──────────────────────────────────────────────────────────────
def process_video(input_path: str, prompt: str = "") -> dict:
    """
    Full pipeline: detect silence → build keep-segments → cut & join.

    Args:
        input_path: path to the uploaded MP4 (e.g. "uploads/video.mp4")

    Returns:
        {
            "success":        bool,
            "output_path":    str,
            "original_duration": float,
            "processed_duration": float,
            "segments_kept":  int,
            "time_removed_s": float,
            "message":        str,
        }
    """
    input_path = str(input_path)

    if not os.path.exists(input_path):
        return {"success": False, "message": f"File not found: {input_path}"}

    # Output filename: same stem with _vivid suffix
    stem        = Path(input_path).stem
    output_path = str(OUTPUT_DIR / f"{stem}_vivid.mp4")

    try:
        # 1. Total duration
        total_duration = get_duration(input_path)
        print(f"[VIVID] Total duration : {total_duration:.2f}s")

        # ── VIVID AI ANALYSIS ─────────────────────────
        analysis = analyze_video(input_path)

        profile = analysis["profile"]

        video_type = analysis["video_type"]

        # Default AI decisions
        silence_duration = profile["silence_duration"]
        pad_seconds = profile["pad_seconds"]

        print(f"[VIVID AI] Detected type: {video_type}")

        # ── OPTIONAL USER PROMPT ─────────────────────
        if prompt:

            print(f"[VIVID AI] User Prompt: {prompt}")

            prompt_lower = prompt.lower()

            # Fast / aggressive edits
            if (
                "fast" in prompt_lower
                or "aggressive" in prompt_lower
                or "tiktok" in prompt_lower
                or "reels" in prompt_lower
            ):
                silence_duration = 0.2
                pad_seconds = 0.03

            # Natural / cinematic edits
            elif (
                "natural" in prompt_lower
                or "cinematic" in prompt_lower
                or "podcast" in prompt_lower
            ):
                silence_duration = 0.8
                pad_seconds = 0.12

        print(f"[VIVID AI] silence_duration={silence_duration}")
        print(f"[VIVID AI] pad_seconds={pad_seconds}")

        # 2. Silence detection
        silence_intervals = detect_silence(
            input_path,
            silence_duration,
        )

        # 3. If no silence found, just copy the file as-is
        if not silence_intervals:
            print("[VIVID] No silence detected — copying file unchanged.")
            import shutil
            shutil.copy2(input_path, output_path)
            return {
                "success":            True,
                "output_path":        output_path,
                "original_duration":  round(total_duration, 2),
                "processed_duration": round(total_duration, 2),
                "segments_kept":      1,
                "time_removed_s":     0.0,
                "message":            "No silence detected. File copied unchanged.",
            }

        # 4. Build keep-segments
        keep_segments = build_keep_segments(
            silence_intervals,
            total_duration,
            pad_seconds,
        )

        # 5. Cut & join
        print(f"[VIVID] Cutting & joining {len(keep_segments)} segment(s)…")
        cut_and_join(input_path, keep_segments, output_path)

        # 6. Measure output
        processed_duration = get_duration(output_path)
        time_removed       = total_duration - processed_duration

        print(f"[VIVID] Done! Removed {time_removed:.2f}s of silence.")
        print(f"[VIVID] Output → {output_path}")

        return {
            "success":            True,
            "output_path":        output_path,
            "original_duration":  round(total_duration, 2),
            "processed_duration": round(processed_duration, 2),
            "segments_kept":      len(keep_segments),
            "time_removed_s":     round(time_removed, 2),
            "message":            f"Success! Removed {time_removed:.1f}s of silence.",
        }

    except subprocess.CalledProcessError as e:
        msg = f"FFmpeg error: {e.stderr.decode(errors='replace') if e.stderr else str(e)}"
        print(f"[VIVID] ERROR: {msg}")
        return {"success": False, "message": msg}

    except Exception as e:
        print(f"[VIVID] ERROR: {e}")
        return {"success": False, "message": str(e)}


# ──────────────────────────────────────────────────────────────
# 6.  CLI  — run directly:  python processor.py my_video.mp4
# ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python processor.py <input_video.mp4>")
        sys.exit(1)

    result = process_video(sys.argv[1])

    print("\n── Result ─────────────────────────────────────")
    for key, value in result.items():
        print(f"  {key:<24} {value}")