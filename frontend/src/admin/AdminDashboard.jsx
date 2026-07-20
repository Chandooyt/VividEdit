import { useEffect, useState } from "react";

import {
  FiGrid,
  FiMessageSquare,
  FiBarChart2,
  FiSettings,
  FiBell,
  FiSearch,
  FiUsers,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";

import Sidebar from "./components/Sidebar";
import "./styles/dashboard.css";

import Header from "./components/Header";

const API_URL = "https://p01--vivid-backend--5ykddwtmxz7v.code.run";

export default function AdminDashboard() {

  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  async function deleteFeedback(id) {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this feedback?"
  );

  if (!confirmDelete) return;

  try {

    const response = await fetch(
      `${API_URL}/feedback/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    // Remove from UI instantly
    setFeedback(
      feedback.filter(item => item.id !== id)
    );

  } catch (error) {

    console.error(error);

    alert("Failed to delete feedback.");

  }

}

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
        display: "flex",
        minHeight: "100vh",
        background: "#0b1120",
        color: "white",
        fontFamily: "Inter, sans-serif",
      }}
    >

      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >

      <Header />

    <div
      style={{
        padding: "30px",
        overflowY: "auto",
        flex: 1,
      }}
    >

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
          marginBottom: "35px",
        }}
      >
      </div>

  <StatCard
    title="Total Feedback"
    value={feedback.length}
    color="#8b5cf6"
    icon={<FiUsers />}
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
    color="#06b6d4"
    icon={<FiStar />}
  />

  <StatCard
    title="5 Star Reviews"
    value={
      feedback.filter(f => f.rating === 5).length
    }
    color="#22c55e"
    icon={<FiTrendingUp />}
  />

  <StatCard
    title="Beta Users"
    value={feedback.length}
    color="#f59e0b"
    icon={<FiMessageSquare />}
  />

</div>

<div
  style={{
    margin: "0 35px 35px",
    background: "#151b2d",
    borderRadius: "24px",
    padding: "30px",
    border: "1px solid rgba(255,255,255,.08)",
  }}
>
  <h2
    style={{
      marginTop: 0,
      marginBottom: "25px",
      fontSize: "24px",
      fontWeight: "700",
    }}
  >
    Recent Feedback
  </h2>

  {feedback.length === 0 ? (
    <p style={{ color: "#94a3b8" }}>
      No feedback yet.
    </p>
  ) : (
    feedback.map((item, index) => (
      <div
        key={item.id}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 20px",
          marginBottom: "16px",
          borderRadius: "18px",
          background: "#1b2238",
          transition: ".25s",
        }}
      >
        {/* Left */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "#8b5cf6",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            {index + 1}
          </div>

          <div>
            <div
              style={{
                fontWeight: "600",
                fontSize: "16px",
              }}
            >
              Beta Tester #{index + 1}
            </div>

            <div
              style={{
                color: "#94a3b8",
                marginTop: "4px",
                maxWidth: "500px",
              }}
            >
              {item.feature}
            </div>
          </div>
        </div>

        {/* Right */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              background:
                item.rating >= 4
                  ? "#10b98122"
                  : "#f59e0b22",
              color:
                item.rating >= 4
                  ? "#10b981"
                  : "#f59e0b",
              padding: "8px 16px",
              borderRadius: "14px",
              fontWeight: "700",
            }}
          >
            ⭐ {item.rating}/5
          </div>

          <div
            style={{
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            {new Date(item.created_at).toLocaleDateString()}
          </div>

          <button
            onClick={() => deleteFeedback(item.id)}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Delete
          </button>

        </div>
      </div>
    ))
  )}
</div>

      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg,#171c2f,#111827)",
        borderRadius: "24px",
        padding: "28px",
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: `0 15px 40px ${color}25`,
        transition: "all .3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow =
          `0 20px 50px ${color}55`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow =
          `0 15px 40px ${color}25`;
      }}
    >
      {/* Glow */}

      <div
        style={{
          position: "absolute",
          right: "-30px",
          top: "-30px",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: color,
          opacity: ".12",
          filter: "blur(35px)",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            width: "55px",
            height: "55px",
            borderRadius: "16px",
            background: `${color}22`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: color,
            fontSize: "22px",
          }}
        >
         {icon}
        </div>

        <div
          style={{
            width: "90px",
            height: "40px",
            borderRadius: "10px",
            background:
              "linear-gradient(90deg,transparent,#8b5cf633,transparent)",
          }}
        />
      </div>

      <p
        style={{
          color: "#94a3b8",
          marginBottom: "8px",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h1
        style={{
          fontSize: "54px",
          margin: 0,
          fontWeight: "700",
        }}
      >
        {value}
      </h1>

      <div
        style={{
          marginTop: "18px",
          color,
          fontWeight: "600",
        }}
      >
        ▲ +12% this week
      </div>
    </div>
  );
}

function MenuItem({ icon, text, active = false }) {
  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        width: "100%",
        padding: "14px 18px",
        marginBottom: "12px",
        borderRadius: "14px",
        border: active
          ? "1px solid #8b5cf6"
          : "1px solid transparent",
        background: active
          ? "linear-gradient(90deg,#6d28d9,#8b5cf6)"
          : "transparent",
        color: "white",
        cursor: "pointer",
        transition: "all .25s ease",
        fontSize: "15px",
        fontWeight: 500,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "#1f2937";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <div
        style={{
          width: "22px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icon}
      </div>

      <span>{text}</span>
    </button>
  );
}