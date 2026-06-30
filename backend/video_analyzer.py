"""
video_analyzer.py — VIVID AI Decision Engine (V1)
===================================================
Classifies uploaded video content and returns a tailored editing profile.

This is the "brain" that decides HOW a video should be edited before
processor.py ever touches FFmpeg. V1 uses simple rule-based logic on
metadata (duration). Future versions will layer in Whisper transcription,
emotion detection, and pacing analysis WITHOUT changing the public
interface — only analyze_video()'s internals grow smarter over time.

Requirements:
    ffprobe must be installed (ships with FFmpeg).

Usage:
    from video_analyzer import analyze_video
    result = analyze_video("uploads/my_video.mp4")
    # {
    #   "video_type": "short_form",
    #   "duration": 42.3,
    #   "profile": {
    #       "label": "Short-Form / Reels",
    #       "silence_duration": 0.3,
    #       "pad_seconds": 0.05,
    #   }
    # }
"""

import json
import subprocess
from pathlib import Path
from typing import TypedDict


# ──────────────────────────────────────────────────────────────
# 1. TYPE DEFINITIONS
# ──────────────────────────────────────────────────────────────
# Using TypedDict gives us self-documenting, IDE-friendly return shapes
# without forcing a heavyweight dependency like pydantic into this module.
# This keeps video_analyzer.py framework-agnostic — it can be reused
# outside FastAPI (CLI tools, batch jobs, tests) with zero changes.

class EditingProfile(TypedDict):
    """A bundle of FFmpeg-tuning parameters matched to a content type."""
    label: str               # human-readable name shown in UI / logs
    silence_duration: float  # seconds — min pause length to count as "dead air"
    pad_seconds: float       # seconds — natural buffer kept around each cut


class AnalysisResult(TypedDict):
    """The full output of analyze_video()."""
    video_type: str
    duration: float
    profile: EditingProfile


# ──────────────────────────────────────────────────────────────
# 2. EDITING PROFILE REGISTRY
# ──────────────────────────────────────────────────────────────
# WHY THIS EXISTS:
# Different content types need fundamentally different editing behaviour.
# A podcast can tolerate natural breathing pauses (0.8s+) because viewers
# expect a conversational rhythm. Short-form content (Reels/TikTok) has
# almost zero tolerance for dead air — even a 0.3s pause feels slow when
# competing for attention in a 15-60s format.
#
# Hard-coding these numbers inside processor.py would mean every new
# content type requires editing FFmpeg logic directly. Instead, this
# registry centralises tuning knobs as DATA, not code — so future
# content types (gaming, storytelling, tutorials) are just new dict
# entries, and the FFmpeg pipeline never has to change.
#
# This is the core idea that makes V1 scalable: classification logic
# and editing parameters are decoupled. Whisper/emotion/pacing models
# added later will only ever need to pick a key from this dict — they
# never need to know what silence_duration or pad_seconds actually do.

EDITING_PROFILES: dict[str, EditingProfile] = {
    "short_form": {
        "label": "Short-Form / Reels / TikTok",
        "silence_duration": 0.3,   # aggressive — cut almost any pause
        "pad_seconds": 0.05,       # tight pad — keeps pacing snappy
    },
    "educational": {
        "label": "Educational / Tutorial",
        "silence_duration": 0.5,   # moderate — allow brief "thinking" pauses
        "pad_seconds": 0.08,       # slightly more breathing room
    },
    "podcast": {
        "label": "Podcast / Long-Form Talk",
        "silence_duration": 0.8,   # lenient — preserve natural conversation flow
        "pad_seconds": 0.12,       # generous pad — avoids clipped breaths
    },
    # Fallback profile used when no rule matches (see classify_content()).
    # Keeping a "default" entry means downstream code never has to
    # null-check the profile — analyze_video() always returns something usable.
    "default": {
        "label": "General / Unclassified",
        "silence_duration": 0.6,
        "pad_seconds": 0.08,
    },
}


# ──────────────────────────────────────────────────────────────
# 3. DURATION DETECTION (ffprobe)
# ──────────────────────────────────────────────────────────────
def get_video_duration(video_path: str) -> float:
    """
    Return the total duration of a video file in seconds using ffprobe.

    WHY A SEPARATE FUNCTION:
    Duration detection is a pure, single-purpose I/O operation. Isolating
    it means it can be unit-tested independently and reused by other
    modules (e.g. processor.py already has similar logic — this module
    intentionally does NOT import from processor.py to avoid circular
    dependencies; processor.py should import FROM here instead, see the
    integration notes at the bottom of this file).
    """
    cmd = [
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        video_path,
    ]

    result = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"ffprobe failed for '{video_path}': {result.stderr.strip()}"
        )

    try:
        info = json.loads(result.stdout)
        return float(info["format"]["duration"])
    except (KeyError, ValueError, json.JSONDecodeError) as exc:
        raise RuntimeError(
            f"Could not parse duration from ffprobe output: {exc}"
        )


# ──────────────────────────────────────────────────────────────
# 4. RULE-BASED CLASSIFIER (V1 "AI")
# ──────────────────────────────────────────────────────────────
def classify_content(duration: float) -> str:
    """
    Classify video content type using simple, transparent rules.

    WHY RULE-BASED FOR V1:
    Before reaching for ML models (Whisper, emotion detectors, etc.), a
    rule-based baseline gives three immediate advantages:
      1. Zero latency / zero cost — no model inference required.
      2. Fully deterministic and debuggable — every decision traces back
         to a single readable if/elif branch.
      3. Establishes the CONTRACT (a string key into EDITING_PROFILES)
         that future, smarter classifiers must honour. When Whisper-based
         topic detection or emotion analysis is added later, it simply
         REPLACES the body of this function — analyze_video() and every
         caller (processor.py, FastAPI routes) stay unchanged.

    Current thresholds (duration-only) are intentionally simple:
        <= 90s   → short_form    (Reels/TikTok-style content is rarely longer)
        <= 600s  → educational   (typical tutorial/explainer length, 1.5–10 min)
        > 600s   → podcast       (long-form conversational content)

    These thresholds are a starting point, not a final answer — they will
    be refined as real usage data comes in, and eventually superseded by
    multi-signal classification (see "Future Upgrades" below).
    """
    if duration <= 90:
        return "short_form"
    elif duration <= 600:
        return "educational"
    else:
        return "podcast"


# ──────────────────────────────────────────────────────────────
# 5. PROFILE LOOKUP
# ──────────────────────────────────────────────────────────────
def get_editing_profile(video_type: str) -> EditingProfile:
    """
    Fetch the editing profile for a given content type.

    Falls back to the 'default' profile if video_type is unrecognised —
    this guarantees analyze_video() NEVER raises due to a missing profile,
    even if classify_content() is upgraded later to return a new type
    that hasn't been added to EDITING_PROFILES yet.
    """
    return EDITING_PROFILES.get(video_type, EDITING_PROFILES["default"])


# ──────────────────────────────────────────────────────────────
# 6. MAIN ENTRY-POINT
# ──────────────────────────────────────────────────────────────
def analyze_video(video_path: str) -> AnalysisResult:
    """
    Full V1 analysis pipeline: duration → classification → profile.

    This is the ONLY function external code (processor.py, FastAPI routes)
    should call. Everything above it is an internal implementation detail
    that can be swapped out freely as long as this function's return
    shape (AnalysisResult) stays stable.

    Args:
        video_path: path to the video file on disk (e.g. "uploads/clip.mp4")

    Returns:
        AnalysisResult — video_type, duration, and the matched profile.

    Raises:
        FileNotFoundError: if video_path does not exist.
        RuntimeError: if ffprobe fails to read the file.
    """
    path = Path(video_path)
    if not path.exists():
        raise FileNotFoundError(f"Video not found: {video_path}")

    # Step 1 — extract duration via ffprobe
    duration = get_video_duration(str(path))

    # Step 2 — classify content type using current rule-based logic
    video_type = classify_content(duration)

    # Step 3 — fetch the matching editing profile
    profile = get_editing_profile(video_type)

    print(
        f"[VIVID Analyzer] {path.name} → "
        f"type='{video_type}' duration={duration:.1f}s "
        f"profile='{profile['label']}'"
    )

    return {
        "video_type": video_type,
        "duration": round(duration, 2),
        "profile": profile,
    }


# ──────────────────────────────────────────────────────────────
# 7. CLI — run directly:  python video_analyzer.py my_video.mp4
# ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python video_analyzer.py <video_path>")
        sys.exit(1)

    result = analyze_video(sys.argv[1])

    print("\n── Analysis Result ────────────────────────────")
    print(json.dumps(result, indent=2))