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
               background:
                "linear-gradient(145deg,#171f36,#111827)",
               border: "1px solid rgba(139,92,246,.18)",
               borderRadius: "22px",
               padding: "28px",
               boxShadow:
                 "0 0 25px rgba(139,92,246,.12)",
               transition: ".25s",
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
                     fontSize: "22px",
                     fontWeight: "700",
                   }}
                  >
                    {item.name || "Anonymous"}
                  </h3>

                  <div
                    style={{
                      color:"#FFD43B",
                      marginTop:"10px",
                      fontWeight:"600",
                      fontSize:"15px",

                    }}
                  >
                    ⭐ {item.rating}/5
                  </div>
                </div>

                <button
                  onClick={() => deleteFeedback(item.id)}
                  style={{
                    background:
                     "linear-gradient(135deg,#ef4444,#dc2626)",
                    color:"white",
                    border:"none",
                    borderRadius:"12px",
                    padding:"10px 18px",
                    cursor:"pointer",
                    fontWeight:"600",
                    transition:".25s",
                  }}
                >
                  Delete
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "22px",
                  marginTop:"10px",
                }}
              >
                <div>
                  <strong style={{ color: "#22c55e" }}>
                    ❤️ What they liked most
                  </strong>

                 <p
  style={{
    color: "#cbd5e1",
    marginTop: "8px",
    lineHeight: "1.6",
    fontSize: "15px",
  }}
>
                    {item.liked || "No answer"}
                  </p>
                </div>

                <div>
                  <strong style={{ color: "#f97316" }}>
                    😞 What frustrated them
                  </strong>

                  <p
  style={{
    color: "#cbd5e1",
    marginTop: "8px",
    lineHeight: "1.6",
    fontSize: "15px",
  }}
>
                    {item.frustrated || "No answer"}
                  </p>
                </div>

                <div>
                  <strong style={{ color: "#8b5cf6" }}>
                    🚀 Feature requested for V2
                  </strong>

                 <p
  style={{
    color: "#cbd5e1",
    marginTop: "8px",
    lineHeight: "1.6",
    fontSize: "15px",
  }}
>
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