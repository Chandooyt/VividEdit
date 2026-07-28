export default function FeedbackTable({
  feedback,
  deleteFeedback,
}) {
  return (
    <div
      style={{
        background: "#151b2d",
        borderRadius: "24px",
        padding: "30px",
        border: "1px solid rgba(255,255,255,.08)",
        marginBottom: "35px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "25px",
          fontSize: "24px",
          fontWeight: "700",
          color: "white",
        }}
      >
        Recent Feedback
      </h2>

      {feedback.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>
          No feedback yet.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {feedback.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#111827",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: "18px",
                padding: "22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      color: "white",
                    }}
                  >
                    {item.name || "Anonymous"}
                  </h3>

                  <div
                    style={{
                      color: "#facc15",
                      marginTop: "6px",
                    }}
                  >
                    ⭐ {item.rating}/5
                  </div>
                </div>

                <button
                  onClick={() => deleteFeedback(item.id)}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "16px",
                }}
              >
                <div>
                  <strong style={{ color: "#22c55e" }}>
                    ❤️ What they liked most
                  </strong>

                  <p style={{ color: "#cbd5e1" }}>
                    {item.liked || "No answer"}
                  </p>
                </div>

                <div>
                  <strong style={{ color: "#f97316" }}>
                    😞 What frustrated them
                  </strong>

                  <p style={{ color: "#cbd5e1" }}>
                    {item.frustrated || "No answer"}
                  </p>
                </div>

                <div>
                  <strong style={{ color: "#8b5cf6" }}>
                    🚀 Feature requested for V2
                  </strong>

                  <p style={{ color: "#cbd5e1" }}>
                    {item.feature || "No answer"}
                  </p>
                </div>

                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "14px",
                  }}
                >
                  📅 {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}