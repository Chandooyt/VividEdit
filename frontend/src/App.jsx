import { useCallback, useRef, useState } from "react";

/**
 * VIVID — Agentic AI Video Editor
 *
 * Changes from original:
 *  1. Layout: full-viewport centering — header centres the logo, stage is
 *     vertically + horizontally centred inside the remaining space.
 *  2. Backend: runEngine() now POSTs the file + prompt to FastAPI via fetch /
 *     FormData and logs the JSON response to the console.
 *  3. No visual redesign — every colour, animation and glow is preserved.
 */

const API_URL = " https://registry.npmjs.org/ngrok/-";
const DEFAULT_PROMPT =
  "Cut out dead air, remove stutters, and keep pacing aggressive.";

export default function App() {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [file,       setFile]         = useState(null);
  const [prompt,     setPrompt]       = useState(DEFAULT_PROMPT);
  const [running,    setRunning]      = useState(false);
  const [statusMsg,  setStatusMsg]    = useState("");   // shown beneath button
  const [processedVideo, setProcessedVideo] = useState("");

  /* ── file helpers ── */
  const handleFiles = useCallback((fileList) => {
    const next = fileList?.[0];
    if (next && next.type.startsWith("video/")) {
      setFile(next);
      setStatusMsg("");
      setProcessedVideo("");
    }
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  /* ── backend call ── */
  const runEngine = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setStatusMsg("⚙ Uploading & processing…");
    setProcessedVideo("");

    try {
      // Build multipart payload
      const formData = new FormData();
      if (file) formData.append("file",   file);        // the MP4
      formData.append("prompt", prompt);                 // the directive text

      // POST to FastAPI — do NOT set Content-Type manually;
      // the browser adds the correct multipart/form-data boundary.
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body:   formData,
      });

      const json = await response.json();

      // Print full backend response to browser console (beginner-friendly)
      console.log("[VIVID] Backend response:", json);

      if (!response.ok) {
        // FastAPI error shape: { detail: "..." }
        throw new Error(json.detail ?? `HTTP ${response.status}`);
      }

      setStatusMsg(`✓ ${json.message ?? "Done!"}`);

      if (json.processed_video) {
        setProcessedVideo(json.processed_video);
        console.log("[DOWNLOAD LINK]", `${API_URL}${json.processed_video}`);
      }

    } catch (err) {
      console.error("[VIVID] Upload error:", err);
      setStatusMsg(`✗ ${err.message}`);
    } finally {
      setRunning(false);
    }
  }, [file, prompt, running]);

  return (
    <div className="vivid-root">
      <Styles />
      <div className="vivid-grid"    aria-hidden="true" />
      <div className="vivid-vignette" aria-hidden="true" />

      {/* ── Header — logo centred ── */}
      <header className="vivid-header">
        <Logo />
      </header>

      {/* ── Main stage — centred column ── */}
      <main className="vivid-stage">

        {/* Drop zone */}
        <section
          className={`drop-zone${isDragging ? " is-dragging" : ""}${file ? " has-file" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && inputRef.current?.click()
          }
          aria-label="Drag and drop raw footage, max 60 seconds"
        >
          <div className="drop-inner">
            {file ? (
              <>
                <div className="drop-icon">🎬</div>
                <h2 className="drop-title">{file.name}</h2>
                <p className="drop-sub">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB · ready
                </p>
              </>
            ) : (
              <>
                <h2 className="drop-title">
                  <span className="drop-arrow">⬇</span> DRAG &amp; DROP
                  <br />
                  RAW FOOTAGE
                </h2>
                <p className="drop-sub">(Max: 60 Seconds)</p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </section>

        {/* Terminal */}
        <section className="terminal-block">
          <label className="terminal-label" htmlFor="ai-prompt">
            AI DIRECTOR TERMINAL
          </label>
          <div className="terminal-box">
            <span className="terminal-caret">&gt; Enter prompt: [ "</span>
            <textarea
              id="ai-prompt"
              className="terminal-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              spellCheck={false}
            />
            <span className="terminal-caret">" ]</span>
          </div>
        </section>

        {/* Run button */}
        <button
          className={`run-btn${running ? " is-running" : ""}`}
          onClick={runEngine}
          disabled={running}
        >
          <span className="run-btn-label">
            {running ? "⚙ ENGINE RUNNING…" : "🚀 RUN AUTONOMOUS ENGINE"}
          </span>
        </button>

        {/* Inline status / error message */}
        {statusMsg && (
          <p className="status-msg">{statusMsg}</p>
        )}

        {processedVideo && (
         <a
          className="download-btn"
          href={`${API_URL}${processedVideo}`}
         download
         target="_blank"
         rel="noopener noreferrer"
       >
         ⬇ DOWNLOAD MP4
       </a>
     )}
      </main>

      <div className="corner-mark" aria-hidden="true">◆</div>
    </div>
  );
}

function Logo() {
  return (
    <div className="logo" role="img" aria-label="VIVID">
      <span className="logo-text">VIVID</span>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Share+Tech+Mono&display=swap');

      *, *::before, *::after { box-sizing: border-box; }
      html, body, #root {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
      }

      /* ── Root shell — full-viewport flex column ── */
      .vivid-root {
        --neon-purple: #c026ff;
        --neon-cyan:   #22d3ee;
        --bg:          #050507;

        position: relative;
        width:  100vw;
        min-height: 100vh;
        background:
          radial-gradient(1200px 700px at 50% 12%, #120a1f 0%, transparent 60%),
          radial-gradient(900px 600px at 85% 90%, #07181c 0%, transparent 55%),
          var(--bg);
        color: #e9e9f1;
        font-family: 'Share Tech Mono', ui-monospace, monospace;
        overflow-x: hidden;

        /* Column: header on top, stage fills the rest */
        display: flex;
        flex-direction: column;
        align-items: stretch;   /* children are full-width */
      }

      /* ── Background layers ── */
      .vivid-grid {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        background-image:
          linear-gradient(rgba(124,58,237,.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,211,238,.05) 1px, transparent 1px);
        background-size: 46px 46px;
        mask-image: radial-gradient(circle at 50% 40%, #000 0%, transparent 78%);
        -webkit-mask-image: radial-gradient(circle at 50% 40%, #000 0%, transparent 78%);
      }
      .vivid-vignette {
        position: fixed; inset: 0; pointer-events: none; z-index: 0;
        box-shadow: inset 0 0 220px 60px rgba(0,0,0,.9);
      }

      /* ── Header — logo perfectly centred ── */
      .vivid-header {
        position: relative; z-index: 2;
        width: 100%;
        padding: clamp(18px,3vw,28px) clamp(20px,5vw,48px);
        display: flex;
        justify-content: center;   /* ← centres the logo */
        align-items: center;
      }

      .logo { display: inline-flex; align-items: center; gap: 14px; }
      .logo-text {
        font-family: 'Orbitron', sans-serif; font-weight: 700;
        letter-spacing: .32em; font-size: clamp(20px,2.6vw,30px);
        color: #f3f4fb; text-shadow: 0 0 12px rgba(255,255,255,.25);
      }

      /* ── Main stage — vertically + horizontally centred ── */
      .vivid-stage {
        position: relative; z-index: 2;
        flex: 1;                          /* takes all remaining height */
        display: flex;
        flex-direction: column;
        align-items: center;              /* horizontal centre */
        justify-content: center;          /* vertical centre   */
        gap: clamp(22px,3.5vw,34px);
        width: 100%;
        padding: clamp(6px,2vw,16px) clamp(20px,5vw,40px) clamp(40px,6vw,64px);
      }

      /* ── Drop zone ── */
      .drop-zone {
        position: relative;
        width: 100%;
        max-width: 360px;
        aspect-ratio: 1 / 1;
        border-radius: 22px;
        padding: 12px;
        cursor: pointer;
        background: linear-gradient(150deg, rgba(192,38,255,.10), rgba(34,211,238,.08));
        border: 2px solid transparent;
        background-clip: padding-box;
        box-shadow:
          -10px 0 40px -6px rgba(192,38,255,.55),
           10px 0 40px -6px rgba(34,211,238,.5),
          inset 0 0 60px rgba(0,0,0,.5);
        transition: transform .25s ease, box-shadow .25s ease;
      }
      .drop-zone::before {
        content: ""; position: absolute; inset: 0; border-radius: 22px; padding: 2px;
        background: linear-gradient(140deg, var(--neon-purple), var(--neon-cyan));
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude;
        pointer-events: none;
      }
      .drop-zone:hover { transform: translateY(-3px); }
      .drop-zone.is-dragging {
        transform: scale(1.02);
        box-shadow:
          -14px 0 60px -4px rgba(192,38,255,.85),
           14px 0 60px -4px rgba(34,211,238,.8),
          inset 0 0 70px rgba(34,211,238,.12);
      }
      .drop-inner {
        height: 100%; width: 100%;
        border: 2px dotted rgba(34,211,238,.65);
        border-radius: 14px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        text-align: center; gap: 10px; padding: 18px;
      }
      .drop-arrow { color: var(--neon-cyan); filter: drop-shadow(0 0 6px var(--neon-cyan)); }
      .drop-title {
        margin: 0; font-family: 'Orbitron', sans-serif; font-weight: 700;
        letter-spacing: .12em; line-height: 1.25;
        font-size: clamp(16px,2.4vw,22px); color: #f2f2f8;
        text-shadow: 0 0 18px rgba(192,38,255,.35);
        word-break: break-word;
      }
      .drop-sub  { margin: 0; color: #9aa0b5; letter-spacing: .08em; font-size: clamp(12px,1.6vw,14px); }
      .drop-icon { font-size: clamp(34px,6vw,46px); filter: drop-shadow(0 0 12px var(--neon-cyan)); }

      /* ── Terminal ── */
      .terminal-block { width: 100%; max-width: 660px; }
      .terminal-label {
        display: block; margin-bottom: 10px;
        font-family: 'Orbitron', sans-serif; font-weight: 700;
        letter-spacing: .2em; font-size: clamp(13px,1.8vw,16px);
        color: var(--neon-cyan); text-shadow: 0 0 14px rgba(34,211,238,.5);
      }
      .terminal-box {
        display: flex; flex-wrap: wrap; align-items: flex-start; gap: 2px;
        background: rgba(6,12,18,.72);
        border: 1.5px solid rgba(34,211,238,.55);
        border-radius: 12px;
        padding: 16px 18px;
        box-shadow: 0 0 28px rgba(34,211,238,.16), inset 0 0 30px rgba(0,0,0,.5);
        font-size: clamp(13px,1.7vw,16px);
        line-height: 1.5;
      }
      .terminal-caret { color: var(--neon-cyan); white-space: pre; }
      .terminal-input {
        flex: 1; min-width: 140px;
        background: transparent; border: none; outline: none; resize: none;
        color: #d8b6ff; font-family: inherit; font-size: inherit; line-height: 1.5;
        text-shadow: 0 0 10px rgba(192,38,255,.4);
        caret-color: var(--neon-cyan);
      }

      /* ── Run button ── */
      .run-btn {
        position: relative;
        padding: 14px 30px;
        border-radius: 12px;
        cursor: pointer;
        background: rgba(8,8,14,.85);
        border: 2px solid transparent;
        color: #fff;
        font-family: 'Orbitron', sans-serif; font-weight: 700;
        letter-spacing: .14em; font-size: clamp(13px,1.7vw,15px);
        box-shadow:
          -8px 0 34px -6px rgba(192,38,255,.7),
           8px 0 34px -6px rgba(34,211,238,.65);
        transition: transform .2s ease, box-shadow .25s ease, filter .2s ease;
      }
      .run-btn::before {
        content: ""; position: absolute; inset: 0; border-radius: 12px; padding: 2px;
        background: linear-gradient(120deg, var(--neon-purple), var(--neon-cyan));
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
      }
      .run-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow:
          -12px 0 46px -4px rgba(192,38,255,.95),
           12px 0 46px -4px rgba(34,211,238,.9);
      }
      .run-btn:active:not(:disabled) { transform: translateY(0); }
      .run-btn:disabled { cursor: progress; filter: saturate(.8) brightness(.95); }
      .run-btn.is-running .run-btn-label { animation: pulse 1.1s ease-in-out infinite; }

      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .55; } }

      /* ── Status message ── */
      .status-msg {
        margin: 0;
        font-size: clamp(12px,1.5vw,14px);
        letter-spacing: .08em;
        color: var(--neon-cyan);
        text-shadow: 0 0 10px rgba(34,211,238,.5);
        text-align: center;
        max-width: 500px;
      }

      /* ── Download button ── */
      .download-btn {
        display: inline-block;
        padding: 14px 28px;
        border-radius: 12px;
        text-decoration: none;
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        letter-spacing: .12em;
        color: white;
        background: rgba(8,8,14,.85);
        border: 2px solid rgba(34,211,238,.5);
        box-shadow:
          -8px 0 30px rgba(192,38,255,.5),
           8px 0 30px rgba(34,211,238,.5);
        transition: transform .2s ease;
      }

      .download-btn:hover {
        transform: translateY(-2px);
      }

      /* ── Corner mark ── */
      .corner-mark {
        position: fixed;
        right: clamp(16px,3vw,30px);
        bottom: clamp(14px,3vw,26px);
        z-index: 2;
        color: #cfcfe6;
        font-size: 20px;
        opacity: .85;
        filter: drop-shadow(0 0 8px rgba(255,255,255,.4));
      }

      /* ── Responsive ── */
      @media (max-width: 520px) {
        .drop-zone    { max-width: 100%; aspect-ratio: 4 / 5; }
        .terminal-box { flex-direction: column; }
        .run-btn      { width: 100%; text-align: center; }
      }

      @media (max-height: 600px) {
        .vivid-stage { justify-content: flex-start; padding-top: 16px; }
      }
    `}</style>
  );
}