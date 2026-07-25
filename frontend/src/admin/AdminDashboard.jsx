import { useEffect, useState } from "react";

import {
  FiUsers,
  FiStar,
  FiTrendingUp,
  FiMessageSquare,
} from "react-icons/fi";

import Sidebar from "./components/Sidebar";
import "./styles/dashboard.css";

import Header from "./components/Header";
import StatCard from "./components/StatCard";
import DashboardCards from "./components/DashboardCards";
import AnalyticsSection from "./components/AnalyticsSection";
import RecentActivity from "./components/RecentActivity";

import FeedbackTable from "./components/FeedbackTable";

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

<DashboardCards feedback={feedback} />

<div className="dashboard-grid">

  <div className="dashboard-left">
    <AnalyticsSection />
  </div>

  <div className="dashboard-right">
    <RecentActivity />
  </div>

</div>

<FeedbackTable
  feedback={feedback}
  deleteFeedback={deleteFeedback}
/>

</div>   // closes padding div

</div>   // closes flex column

</div>   // closes main wrapper

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