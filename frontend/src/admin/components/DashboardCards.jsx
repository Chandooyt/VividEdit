import {
  FiUsers,
  FiStar,
  FiTrendingUp,
  FiMessageSquare,
} from "react-icons/fi";

import StatCard from "./StatCard";

export default function DashboardCards({ feedback }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "24px",
        marginBottom: "35px",
      }}
    >
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
        value={feedback.filter(f => f.rating === 5).length}
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
  );
}