import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { day: "Mon", videos: 3 },
  { day: "Tue", videos: 8 },
  { day: "Wed", videos: 12 },
  { day: "Thu", videos: 15 },
  { day: "Fri", videos: 20 },
  { day: "Sat", videos: 27 },
  { day: "Sun", videos: 35 },
];

export default function AnalyticsSection() {
  return (
    <div
      style={{
        background: "#151b2d",
        borderRadius: "24px",
        padding: "30px",
        marginBottom: "35px",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <h2
        style={{
          color: "white",
          marginBottom: "25px",
        }}
      >
       Videos Processed
      </h2>

      <div
        style={{
          width: "100%",
          height: "320px",
        }}
      >
        <ResponsiveContainer>
  <LineChart data={data}>

    <defs>

      <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>

      <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
      </linearGradient>

    </defs>

    <CartesianGrid
      stroke="#26314d"
      strokeDasharray="5 5"
    />

    <XAxis
      dataKey="day"
      stroke="#94a3b8"
      tickLine={false}
      axisLine={false}
    />

    <YAxis
      stroke="#94a3b8"
      tickLine={false}
      axisLine={false}
    />

    <Tooltip
  formatter={(value) => [`${value}`, "Videos"]}
  contentStyle={{
    background: "#101625",
    border: "1px solid #22d3ee",
    borderRadius: "12px",
    color: "#fff",
  }}
/>

    <Area
      type="monotone"
      dataKey="videos"
      fill="url(#areaFill)"
      stroke="none"
    />

    <Line
      type="monotone"
      dataKey="videos"
      stroke="url(#lineColor)"
      strokeWidth={5}
      dot={{
        r: 5,
        fill: "#22d3ee",
      }}
      activeDot={{
        r: 8,
        fill: "#ffffff",
      }}
      animationDuration={1800}
    />

  </LineChart>
</ResponsiveContainer>
      </div>
    </div>
  );
}