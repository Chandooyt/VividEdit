import { useCallback, useEffect, useRef, useState } from "react";
import AdminDashboard from "./admin/AdminDashboard";

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

const API_URL = "https://p01--vivid-backend--5ykddwtmxz7v.code.run";
const DEFAULT_PROMPT =
  "Write your prompt.";

export default function App() {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [file,       setFile]         = useState(null);
  const [prompt,     setPrompt]       = useState(DEFAULT_PROMPT);
  const [running,    setRunning]      = useState(false);
  const [statusMsg,  setStatusMsg]    = useState("");   // shown beneath button
  const [processedVideo, setProcessedVideo] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);

  const [feedbackMsg, setFeedbackMsg] = useState("");

  const [downloading, setDownloading] = useState(false);
  const [downloadCountdown, setDownloadCountdown] = useState(null);
  const [downloadSpeed, setDownloadSpeed] = useState(0);

  const [selectedRating, setSelectedRating] = useState(0);
  const [sendingRating, setSendingRating] = useState(false);

  const [liked, setLiked] = useState("");
  const [frustrated, setFrustrated] = useState("");
  const [feature, setFeature] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [showAdmin, setShowAdmin] = useState(false);
  const ADMIN_KEY = "IAmBillionaire";

  /* ── file helpers ── */
const handleFiles = useCallback((fileList) => {

  const next = fileList?.[0];

  // NO FILE
  if (!next) return;

  // CHECK VIDEO TYPE
  if (!next.type.startsWith("video/")) {

    setStatusMsg(
      "🎥 Please select a valid video file."
    );

    return;
  }

  // FILE SIZE LIMIT = 100MB
  const MAX_SIZE = 100 * 1024 * 1024;

  if (next.size > MAX_SIZE) {

    setStatusMsg(
      "📦 Video exceeds the 100 MB upload limit."
    );

    return;
  }
  // CREATE VIDEO ELEMENT
  const video = document.createElement("video");

  video.preload = "metadata";
  
  // CHECK VIDEO DURATION
 video.onloadedmetadata = () => {

  // MORE THAN 60 SECONDS
  if (video.duration > 60) {

    setStatusMsg(
      "⏱ Video exceeds the 60 second limit."
    );

    return;
  }

  // SAVE FILE
  setFile(next);

  // CLEAR STATUS
  setStatusMsg("");

  setProcessedVideo("");
};

  video.onerror = () => {

    setStatusMsg(
      "✗ Invalid or corrupted video file"
    );
  };

  video.src = URL.createObjectURL(next);

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
    // No video selected
    if (!file) {

      setStatusMsg("📹 Please upload a video before running VIVID.");

      return;

    }

    setRunning(true);
    setUploadProgress(0);
    setStatusMsg("🧠 Analyzing speech...");
    setProcessedVideo("");

    try {
      // Build multipart payload
      const formData = new FormData();
      if (file) formData.append("file",   file);        // the MP4
      formData.append("prompt", prompt);                 // the directive text

      // POST to FastAPI — do NOT set Content-Type manually;
      // the browser adds the correct multipart/form-data boundary.
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", `${API_URL}/upload`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
            if (percent > 20) {

              setStatusMsg(
                "🎙 Detecting dead air..."
              );
            }

            if (percent > 45) {

              setStatusMsg(
                "✂ Optimizing pacing..."
              );
            }

            if (percent > 70) {

              setStatusMsg(
                "🎬 Exporting final cut..."
              );
            }
          }
        };

        xhr.onload = () => {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            json: async () => JSON.parse(xhr.responseText),
          });
        };

        xhr.onerror = () => reject(new Error("Upload failed"));

        xhr.send(formData);
      });

      const json = await response.json();

      // Print full backend response to browser console (beginner-friendly)
      console.log("[VIVID] Backend response:", json);

      if (
        !response.ok ||
        !json.processing ||
        json.processing.success === false
      ) {

        throw new Error(
          json.processing?.message ||
          json.detail ||
          `HTTP ${response.status}`
        );

      }

      const removed =
        json.processing?.time_removed_s || 0;

      setStatusMsg(
        `⚡ VIVID cut ${removed}s of silence automatically`
      );

      if (json.processed_video) {
        setProcessedVideo(json.processed_video);
        console.log("[DOWNLOAD LINK]", `${API_URL}${json.processed_video}`);
      }

    } catch (err) {

  console.error("[VIVID] Upload error:", err);

  const message = err.message.toLowerCase();

  // SERVER SLEEPING / OVERLOADED
  if (
    message.includes("failed to fetch")
  ) {

    setStatusMsg(
      "⚠ Server waking up... please retry in a few seconds"
    );

  }

  // NETWORK LOST
  else if (
    message.includes("network")
  ) {

    setStatusMsg(
      "📡 Internet connection interrupted"
    );

  }

  // FILE TOO LARGE
  else if (
    message.includes("413")
  ) {

    setStatusMsg(
      "🎞 Video too large for processing"
    );

  }

  // INVALID VIDEO
  else if (
    message.includes("invalid")
  ) {

    setStatusMsg(
      "🚫 Unsupported or corrupted video file"
    );

  }

  // PROCESSING CRASH
  else if (
    message.includes("ffmpeg")
  ) {

    setStatusMsg(
      "⚙ AI editor crashed while rendering"
    );

  }

  // UNKNOWN
  else {

    setStatusMsg(
      "Something went wrong during editing"
    );

  }
} 

  finally {
      setRunning(false);
    }
  }, [file, prompt, running]);



const sendFeedback = async () => {

  if (selectedRating === 0) {
    setFeedbackMsg("Please select a rating.");
    return;
  }

  if (!liked.trim() || !frustrated.trim() || !feature.trim()) {
    setFeedbackMsg("Please answer all questions.");
    return;
  }

  try {

    setSendingRating(true);

    const response = await fetch(`${API_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

     body: JSON.stringify({
         rating: selectedRating,
         liked: liked,
         frustrated: frustrated,
         feature: feature,
     }),
    });

    const json = await response.json();

    setFeedbackMsg(
      "🟣 Thanks for being a VIVID Beta Tester! Your feedback will shape VIVID 2.0."
    );

    setLiked("");
    setFrustrated("");
    setFeature("");
    setSelectedRating(0);
    setFeedbackSubmitted(true);
    localStorage.setItem("vivid_feedback_sent", "true");

  } catch (err) {

    console.error(err);
    setFeedbackMsg("Feedback failed.");

  } finally {

    setSendingRating(false);

  }
};

useEffect(() => {
  const handleKeyDown = (e) => {
    console.log("KEY PRESSED:", e.key);

    if (
      e.ctrlKey &&
      e.altKey &&
      e.shiftKey &&
      e.key.toLowerCase() === "v"
    ) {
      const enteredKey = window.prompt("Enter Admin Key");

      if (enteredKey === ADMIN_KEY) {
        setShowAdmin(true);
      } else {
        alert("Wrong Admin Key");
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);

if (showAdmin) {

  return <AdminDashboard />;

}

  return (
    <div className="vivid-root">
      <Styles />
      <div className="vivid-grid"    aria-hidden="true" />
      <div className="vivid-vignette" aria-hidden="true" />

      {/* ── Header — logo centred ── */}
      <header className="vivid-header">
  <div className="header-content">
    <Logo />
    <p className="hero-text">
      AI-powered dead air remover for creators.
    </p>
  </div>
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
          aria-label="Drag and drop raw footage, max 60 seconds,"
        >
          <div className="drop-inner">
           {file ? (

            <>
              <h2 className="video-file-title">
                {file.name}
              </h2>

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
               <div className="drop-sub-wrap">

                <p className="drop-sub">
                  MAX: 60 SECONDS
                </p>

                <p className="drop-sub-small">
                  MAX: 100 MB
                </p>

               </div>
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
            AI DIRECTOR TERMINAL (Optional)
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
        {running && (
          <div className="progress-wrap">
            <div
              className="progress-bar"
              style={{ width: `${uploadProgress}%` }}
            ></div>

            <p className="progress-text">
              Uploading: {uploadProgress}%
            </p>
          </div>
        )}

        {running && (
          <div className="loader-wrap">
            <div className="ai-loader">

              <div className="pulse-ring"></div>

              <div className="pulse-ring delay"></div>

              <div className="core-loader"></div>

            </div>
            <p className="loading-text">
              AI is editing your video...
            </p>
          </div>
        )}

       {statusMsg && (
         <p className="status-msg">{statusMsg}</p>
        )}

        {processedVideo && (
          <>

           <button
             className="download-btn"

             disabled={downloading}

             onClick={async () => {

               try {

                 setDownloading(true);

                 setStatusMsg(
                   "⬇ Preparing download..."
                 );

                 const xhr = new XMLHttpRequest();

                 xhr.open(
                   "GET",
                   `${API_URL}${processedVideo}`,
                   true
                 );

                 xhr.responseType = "blob";

                 const startTime = Date.now();

                 xhr.onprogress = (event) => {

                   if (event.lengthComputable) {

                     const loaded = event.loaded;

                     const total = event.total;

                     const elapsed =
                       (Date.now() - startTime) / 1000;

                     const speed =
                       loaded / elapsed;

                     setDownloadSpeed(speed);

                     const remainingBytes =
                       total - loaded;

                     const remainingSeconds =
                       Math.ceil(
                         remainingBytes / speed
                       );

                     setDownloadCountdown(
                       remainingSeconds
                     );

                     setStatusMsg(
                       `⬇ Download starting in ${remainingSeconds}s`
                     );
                   }
                 };

                 xhr.onload = () => {

                   const blob = xhr.response;

                   const url =
                     window.URL.createObjectURL(blob);

                   const a =
                     document.createElement("a");

                   a.href = url;

                   a.download =
                     "vivid_edited.mp4";

                   document.body.appendChild(a);

                   a.click();

                   a.remove();

                   window.URL.revokeObjectURL(url);

                   setDownloadCountdown(null);

                   setStatusMsg(
                     "⬇ Download started successfully"
                   );

                   setDownloading(false);
                 };

                 xhr.onerror = () => {

                   setStatusMsg(
                     "⚠ Download failed try again"
                   );

                   setDownloading(false);
                 };

                 xhr.send();

               } catch (err) {

                 console.error(err);

                 setStatusMsg(
                   "⚠ Download failed try again"
                 );

                 setDownloading(false);
               }
             }}
           >
             DOWNLOAD MP4
           </button>

            {/* ⭐ Feedback System */}
            <div className="feedback-box">

              {!feedbackSubmitted && (
               <h3 className="feedback-title">
                 How was your edit?
               </h3>
             )}

              {!feedbackSubmitted && (
               <div className="feedback-stars">
                 {[1,2,3,4,5].map((star)=>(
                   <button
                     key={star}
                     onClick={() => setSelectedRating(star)}
                     className={`star-btn ${
                       selectedRating >= star
                         ? "star-active"
                         : ""
                     }`}
                   >
                     ★
                   </button>
                 ))}
               </div>
             )}
          {!feedbackSubmitted && (
            <>
              <label className="feedback-label">
                What did you like most?
              </label>
              <textarea
                className="feedback-input"
                value={liked}
                onChange={(e) => setLiked(e.target.value)}
              />

              <label className="feedback-label">
                What frustrated you?
              </label>
              <textarea
                className="feedback-input"
                value={frustrated}
                onChange={(e) => setFrustrated(e.target.value)}
              />

              <label className="feedback-label">
                What feature would you love in VIVID 2.0?
              </label>
              <textarea
                className="feedback-input"
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
              />

              <button
                className="download-btn"
                onClick={sendFeedback}
                disabled={sendingRating}
              >
                {sendingRating ? "Submitting..." : "Submit Feedback"}
              </button>
            </>
          )}

          {feedbackMsg && !feedbackSubmitted && (
            <p
              className="feedback-msg"
              style={{
                color: "#22d3ee",
                fontWeight: "bold",
              }}
             >
              {feedbackMsg}
            </p>
          )}

           {feedbackSubmitted && (
            <div
              style={{
                marginTop: "20px",
                padding: "20px",
                borderRadius: "14px",
                background: "rgba(0,255,140,.08)",
                border: "1px solid rgba(0,255,140,.25)",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  color: "#00ff88",
                  marginBottom: "10px",
                }}
              >
                ✅ Feedback Submitted
              </h2>

              <p
                style={{
                  color: "#b5f7d5",
                  margin: 0,
                }}
              >
                Thanks for helping improve VIVID. Your feedback has been received successfully.
              </p>
            </div>
          )} 
 
          </div>  
          </> 
          )}    

    </main>

      <footer className="vivid-footer">
        VIVID © 2026 • Built by Mohid Malik
      </footer>

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
        position: relative;
        z-index: 2;

        width: 100%;

        padding: 28px 40px;

        display: flex;

        justify-content: flex-start;
        align-items: flex-start;
      }

      .logo { display: inline-flex; align-items: center; gap: 14px; }.header-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.hero-text {
  margin: 0;

  color: #9aa0b5;

  font-size: 14px;

  letter-spacing: .08em;

  text-align: left;
}
  
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
        max-width: 850px;
        min-height: 340px; 
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
        font-size: clamp(18px,2.8vw,30px); color: #f2f2f8;
        text-shadow: 0 0 18px rgba(192,38,255,.35);
        word-break: break-word;
      }
      .video-file-title {
        margin: 0;

        font-family: 'Orbitron', sans-serif;

        font-weight: 700;

        letter-spacing: .08em;

        line-height: 1.2;

        font-size: clamp(12px,1.4vw,16px);

        color: #f2f2f8;

        word-break: break-word;

        text-align: center;
      }
     .drop-sub-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.drop-sub {
  margin: 0;

  color: #22d3ee;

  letter-spacing: .15em;

  font-size: clamp(16px,2vw,20px);

  font-weight: bold;

  text-shadow:
    0 0 10px rgba(34,211,238,.5);
}

.drop-sub-small {
  margin: 0;

  color: #9aa0b5;

  letter-spacing: .12em;

  font-size: clamp(12px,1.5vw,14px);
}

      .video-preview {
        width: 100%;
        max-height: 220px;
        border-radius: 12px;
        object-fit: cover;
        border: 2px solid rgba(34,211,238,.4);
        box-shadow: 0 0 20px rgba(34,211,238,.2);
      }

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
      .progress-wrap {
        width: 100%;
        max-width: 420px;
        height: 14px;
        background: rgba(255,255,255,.08);
        border-radius: 999px;
        overflow: hidden;
        position: relative;
        box-shadow: inset 0 0 10px rgba(0,0,0,.4);
      }

      .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #c026ff, #22d3ee);
        transition: width .25s ease;
        box-shadow: 0 0 18px rgba(34,211,238,.5);
      }

     .progress-text {
       text-align: center;
       margin-top: 10px;
       color: #22d3ee;
       font-size: 13px;
       letter-spacing: .08em;
      }

      .loader-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }

    .ai-loader {

  position: relative;

  width: 90px;
  height: 90px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.core-loader {

  width: 26px;
  height: 26px;

  border-radius: 50%;

  background: #22d3ee;

  box-shadow:
    0 0 20px #22d3ee,
    0 0 40px #22d3ee;

  z-index: 2;
}

.pulse-ring {

  position: absolute;

  width: 100%;
  height: 100%;

  border: 2px solid rgba(34,211,238,.7);

  border-radius: 50%;

  animation: pulseRing 2s linear infinite;
}

.pulse-ring.delay {

  animation-delay: 1s;
}

@keyframes pulseRing {

  0% {
    transform: scale(.4);
    opacity: 1;
  }

  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

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

      /* ⭐ FEEDBACK CSS START */
.feedback-box {
  margin-top: 24px;

  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 12px;
}

.feedback-title {
  color: #22d3ee;

  font-size: 16px;

  letter-spacing: .08em;

  margin: 0;
}

.feedback-stars {
  display: flex;

  gap: 10px;
}

.star-btn {

  background: transparent;

  border: none;

  color: transparent;

  cursor: pointer;

  font-size: 38px;

  transition: all .2s ease;

  -webkit-text-stroke: 2px #ffd700;

  text-shadow: none;

}

.star-btn:hover {

transform: scale(1.15);

}

.star-active {

  color: #ffd700;

  -webkit-text-stroke: 0px;

  text-shadow:
    0 0 10px #ffd700,
    0 0 20px #ffd700,
    0 0 40px rgba(255,215,0,.7);

}


.feedback-msg {

  margin-top: 10px;

  color: #22d3ee;

  font-size: 14px;

  letter-spacing: .08em;

  text-align: center;

}

.feedback-label {
  color: #22d3ee;
  font-size: 14px;
  margin-top: 12px;
  margin-bottom: 6px;
  display: block;
  text-align: left;
  width: 100%;
  max-width: 500px;
}

.feedback-input {
  width: 100%;
  max-width: 500px;
  min-height: 70px;
  background: rgba(8,8,14,.85);
  border: 1px solid rgba(34,211,238,.35);
  border-radius: 10px;
  color: white;
  padding: 12px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.feedback-input:focus {
  border-color: #22d3ee;
  box-shadow: 0 0 10px rgba(34,211,238,.4);
}

/* ⭐ FEEDBACK CSS END */


      /* ── Corner mark ── */
      .vivid-footer {
        text-align: center;
        padding: 20px;
        color: #7d859d;
        font-size: 12px;
        letter-spacing: .08em;  
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