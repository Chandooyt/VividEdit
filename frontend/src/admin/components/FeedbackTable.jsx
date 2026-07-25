export default function FeedbackTable({
  feedback = [],
  deleteFeedback,
}) {
  return (
    <div
      style={{
        background: "#151b2d",
        borderRadius: 24,
        padding: 30,
        border: "1px solid rgba(255,255,255,.08)",
        marginBottom: 35,
      }}
    >
      <h2
        style={{
          color: "#fff",
          marginBottom: 30,
          fontWeight: 700,
        }}
      >
        Recent Feedback
      </h2>

      {feedback.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>
          No feedback yet.
        </p>
      ) : (
        feedback.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#1b2338",
              border: "1px solid rgba(139,92,246,.25)",
              borderRadius: 18,
              padding: 22,
              marginBottom: 20,
              transition: ".25s",
              boxShadow:
                "0 0 20px rgba(139,92,246,.10)",
            }}
          >
            {/* Header */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div>

                <h3
                  style={{
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  👤 {item.name}
                </h3>

                <div
                  style={{
                    color: "#facc15",
                    marginTop: 6,
                    fontSize: 18,
                  }}
                >
                  {"⭐".repeat(item.rating)}
                </div>

              </div>

              <button
                onClick={() => deleteFeedback(item.id)}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                🗑 Delete
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: 16,
              }}
            >

              <div>
                <strong style={{ color: "#8b5cf6" }}>
                  ❤️ What did they like most?
                </strong>

                <p style={{ color: "#d1d5db" }}>
                  {item.likeMost}
                </p>
              </div>

              <div>
                <strong style={{ color: "#8b5cf6" }}>
                  😞 What frustrated them?
                </strong>

                <p style={{ color: "#d1d5db" }}>
                  {item.frustrated}
                </p>
              </div>

              <div>
                <strong style={{ color: "#8b5cf6" }}>
                  🚀 Feature for V2
                </strong>

                <p style={{ color: "#d1d5db" }}>
                  {item.featureWanted}
                </p>
              </div>

              <div>
                <strong style={{ color: "#8b5cf6" }}>
                  📅 Date
                </strong>

                <p style={{ color: "#d1d5db" }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>

            </div>

          </div>
        ))
      )}
    </div>
  );
}