import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardCards from "./components/DashboardCards";
import AnalyticsSection from "./components/AnalyticsSection";
import RecentActivity from "./components/RecentActivity";
import FeedbackTable from "./components/FeedbackTable";
import UsersSection from "./components/UsersSection";
import VideosSection from "./components/VideosSection";

import "./styles/dashboard.css";

const API_URL =
  "https://p01--vivid-backend--5ykddwtmxz7v.code.run";

export default function AdminDashboard() {

  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  // Current sidebar page
  const [activePage, setActivePage] =
    useState("Dashboard");


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
        throw new Error(
          "Failed to fetch feedback"
        );
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

    const confirmDelete =
      window.confirm(
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
        throw new Error(
          "Delete failed"
        );
      }

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
  // LOGOUT
  // =========================================================

  function handleLogout() {

    const confirmLogout =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmLogout) {
      return;
    }

    // For now return to dashboard.
    // Authentication can be connected later.
    setActivePage("Dashboard");

    alert(
      "You have been logged out."
    );
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
          Loading Billion Startup VIVID Dashboard...
        </div>

      </div>
    );
  }


  // =========================================================
  // PAGE CONTENT
  // =========================================================

  function renderPage() {

    // -------------------------------------------------------
    // DASHBOARD
    // -------------------------------------------------------

    if (activePage === "Dashboard") {

      return (
        <>
          <DashboardCards
            feedback={feedback}
          />

          <div className="dashboard-grid">

            <div className="dashboard-left">

              <AnalyticsSection feedback={feedback} />

            </div>

            <div className="dashboard-right">

              <RecentActivity />

            </div>

          </div>

          <FeedbackTable
            feedback={feedback}
            deleteFeedback={deleteFeedback}
          />
        </>
      );
    }


    // -------------------------------------------------------
// USERS
// -------------------------------------------------------

if (activePage === "Users") {
  return <UsersSection />;
}

if (activePage === "Videos") {
  return <VideosSection />;
}

    // -------------------------------------------------------
    // OTHER PAGES
    // -------------------------------------------------------

    return (
      <div
        style={{
          background: "#151b2d",
          border:
            "1px solid rgba(255,255,255,.08)",
          borderRadius: "24px",
          padding: "50px",
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          boxShadow:
            "0 20px 60px rgba(0,0,0,.25)",
        }}
      >

        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "20px",
            background:
              "linear-gradient(135deg,#8b5cf6,#6d28d9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: "30px",
            fontWeight: "bold",
            marginBottom: "24px",
            boxShadow:
              "0 0 35px rgba(139,92,246,.35)",
          }}
        >
          V
        </div>

        <h1
          style={{
            margin: "0 0 12px",
            color: "white",
            fontSize: "30px",
          }}
        >
          {activePage}
        </h1>

        <p
          style={{
            margin: 0,
            color: "#94a3b8",
            fontSize: "15px",
            maxWidth: "500px",
            lineHeight: "1.7",
          }}
        >
          The {activePage} section is ready
          for development.
        </p>

        <div
          style={{
            marginTop: "24px",
            padding: "10px 18px",
            borderRadius: "12px",
            background:
              "rgba(139,92,246,.12)",
            border:
              "1px solid rgba(139,92,246,.3)",
            color: "#a78bfa",
            fontSize: "13px",
          }}
        >
          VIVID • Coming next
        </div>

      </div>
    );
  }


  // =========================================================
  // MAIN DASHBOARD
  // =========================================================

  return (

    <div className="dashboard-page">

      {/* SIDEBAR */}

      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
      />


      {/* MAIN */}

      <main className="dashboard-main">

        {/* HEADER */}

        <Header />


        {/* CONTENT */}

        <div className="dashboard-content">

          {renderPage()}

        </div>

      </main>

    </div>
  );
}