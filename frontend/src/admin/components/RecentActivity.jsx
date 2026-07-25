const activities = [
  {
    icon: "🎥",
    title: "Video Uploaded",
    description: "intro.mp4 uploaded",
    time: "2 min ago",
    color: "#22d3ee",
  },
  {
    icon: "🤖",
    title: "AI Processing Started",
    description: "Silence detection running",
    time: "4 min ago",
    color: "#a855f7",
  },
  {
    icon: "✂️",
    title: "Silence Removed",
    description: "Dead air successfully removed",
    time: "7 min ago",
    color: "#22d3ee",
  },
  {
    icon: "📦",
    title: "Video Exported",
    description: "Final video exported",
    time: "11 min ago",
    color: "#22d3ee",
  },
];

export default function RecentActivity() {
  return (
    <div className="activity-card">
      <div className="activity-header">
        <h2>Recent Activity</h2>
        <button>View All</button>
      </div>

      {activities.map((activity, index) => (
        <div className="activity-item" key={index}>
          <div
            className="activity-icon"
            style={{
              boxShadow: `0 0 18px ${activity.color}`,
            }}
          >
            {activity.icon}
          </div>

          <div className="activity-info">
            <h3>{activity.title}</h3>
            <p>{activity.description}</p>
          </div>

          <span>{activity.time}</span>
        </div>
      ))}
    </div>
  );
}