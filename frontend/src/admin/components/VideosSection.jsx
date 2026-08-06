export default function VideosSection() {
  return (
    <div
      style={{
        background: "#151b2d",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "35px",
        minHeight: "400px",
        color: "white",
      }}
    >
      <h2 style={{ marginTop: 0 }}>
        Videos
      </h2>

      <p style={{ color: "#94a3b8" }}>
        Manage and monitor videos processed by VIVID.
      </p>

      <div
        style={{
          marginTop: "30px",
          padding: "25px",
          borderRadius: "16px",
          background: "#1b2238",
          border: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          Video Processing
        </h3>

        <p style={{ color: "#94a3b8" }}>
          Video history and processing information will appear here.
        </p>
      </div>
    </div>
  );
}