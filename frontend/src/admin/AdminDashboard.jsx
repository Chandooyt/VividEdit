import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardCards from "./components/DashboardCards";
import AnalyticsSection from "./components/AnalyticsSection";
import RecentActivity from "./components/RecentActivity";
import FeedbackTable from "./components/FeedbackTable";

import "./styles/dashboard.css";

const API_URL =
  "https://p01--vivid-backend--5ykddwtmxz7v.code.run";

export default function AdminDashboard() {

  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // FETCH FEEDBACK
  // =========================================================

  useEffect(() => {
    fetchFeedback();
  }, []);

  async function fetchFeedback() {

    try {

      const response = await fetch(
        `${API_URL}/feedback`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }

      const data = await response.json();

      setFeedback(data);

    } catch (error) {

      console.error(
        "Failed to fetch feedback:",
        error
      );

    } finally {

      setLoading(false);

    }
  }


  // =========================================================
  // DELETE FEEDBACK
  // =========================================================

  async function deleteFeedback(id) {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this feedback?"
    );

    if (!confirmDelete) {
      return;
    }

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

      // Remove deleted feedback from the screen
      setFeedback(
        currentFeedback =>
          currentFeedback.filter(
            item => item.id !== id
          )
      );

    } catch (error) {

      console.error(
        "Failed to delete feedback:",
        error
      );

      alert(
        "Failed to delete feedback."
      );

    }
  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="dashboard-page">

        <div
          style={{
            width: "100%",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: "18px",
          }}
        >
          Loading VIVID Dashboard...
        </div>

      </div>
    );
  }


  // =========================================================
  // DASHBOARD
  // =========================================================

  return (

    <div className="dashboard-page">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <Sidebar />


      {/* =====================================================
          MAIN DASHBOARD
          ===================================================== */}

      <main className="dashboard-main">

        {/* TOP HEADER */}

        <Header />


        {/* DASHBOARD CONTENT */}

        <div className="dashboard-content">


          {/* =================================================
              STAT CARDS
              ================================================= */}

          <DashboardCards
            feedback={feedback}
          />


          {/* =================================================
              ANALYTICS + RECENT ACTIVITY
              ================================================= */}

          <div className="dashboard-grid">

            {/* LEFT */}

            <div className="dashboard-left">

              <AnalyticsSection />

            </div>


            {/* RIGHT */}

            <div className="dashboard-right">

              <RecentActivity />

            </div>

          </div>


          {/* =================================================
              FEEDBACK
              ================================================= */}

          <FeedbackTable
            feedback={feedback}
            deleteFeedback={deleteFeedback}
          />

        </div>

      </main>

    </div>
  );
}