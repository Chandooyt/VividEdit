import { useEffect, useState } from "react";

const API_URL = "https://p01--vivid-backend--5ykddwtmxz7v.code.run";

export default function AdminDashboard() {

  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  async function fetchFeedback() {
    try {
      const response = await fetch(`${API_URL}/feedback`);
      const data = await response.json();
      setFeedback(data);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "30px", color: "white" }}>
        Loading Feedback...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1>🟣 VIVID Admin Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
          gap: "24px",
          marginTop: "35px",
          marginBottom: "40px",
        }}
      >
        <StatCard
          title="Total Feedback"
          value={feedback.length}
          color="#8b5cf6"
        />

        <StatCard
          title="Average Rating"
          value={
            feedback.length
              ? (
                  feedback.reduce((a, b) => a + b.rating, 0) /
                  feedback.length
                ).toFixed(1)
              : "0"
          }
          color="#22d3ee"
        />

        <StatCard
          title="5 Star Reviews"
          value={
            feedback.filter(f => f.rating === 5).length
          }
          color="#10b981"
        />
      </div>

      {feedback.length === 0 ? (
        <p>No feedback received yet.</p>
      ) : (
        feedback.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "20px",
              marginTop: "20px",
              background: "#1e293b",
            }}
          >
            <h2>⭐ {item.rating}/5</h2>

            <p>
              <strong>👍 Liked:</strong>
            </p>
            <p>{item.liked}</p>

            <p>
              <strong>😡 Frustrated:</strong>
            </p>
            <p>{item.frustrated}</p>

            <p>
              <strong>💡 Feature Request:</strong>
            </p>
            <p>{item.feature}</p>

            <hr />

            <small>{item.created_at}</small>
          </div>
        ))
      )}
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        background: "linear-gradient(145deg,#1e293b,#111827)",
        borderRadius: "18px",
        padding: "28px",
        border: `2px solid ${color}`,
        boxShadow: `0 0 25px ${color}25`,
        transition: "0.3s",
      }}
    >
      <p
        style={{
          color: "#94a3b8",
          margin: 0,
          fontSize: "14px",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {title}
      </p>

      <h1
        style={{
          marginTop: "15px",
          marginBottom: "0",
          color,
          fontSize: "52px",
          fontWeight: "bold",
        }}
      >
        {value}
      </h1>
    </div>
  );
}