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

export default function AnalyticsSection({ feedback = [] }) {

  // Build a simple rating/activity dataset from real feedback.
  // This keeps the chart functional with the data your backend already provides.
  const data = createAnalyticsData(feedback);

  return (
    <div
      style={{
        background: "#151b2d",
        borderRadius: "24px",
        padding: "30px",
        marginBottom: "35px",
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: "0 20px 50px rgba(0,0,0,.15)",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >

        <div>

          <h2
            style={{
              color: "white",
              margin: 0,
              fontSize: "24px",
            }}
          >
            VIVID Analytics
          </h2>

          <p
            style={{
              color: "#94a3b8",
              margin: "6px 0 0",
              fontSize: "13px",
            }}
          >
            Feedback activity and product performance
          </p>

        </div>

        <div
          style={{
            padding: "8px 14px",
            borderRadius: "12px",
            background: "rgba(34,211,238,.08)",
            border: "1px solid rgba(34,211,238,.25)",
            color: "#22d3ee",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          LIVE DATA
        </div>

      </div>


      {/* CHART */}

      <div
        style={{
          width: "100%",
          height: "320px",
        }}
      >

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <defs>

              <linearGradient
                id="lineColor"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor="#22d3ee"
                />

                <stop
                  offset="100%"
                  stopColor="#a855f7"
                />

              </linearGradient>


              <linearGradient
                id="areaFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="0%"
                  stopColor="#8b5cf6"
                  stopOpacity={0.35}
                />

                <stop
                  offset="100%"
                  stopColor="#8b5cf6"
                  stopOpacity={0}
                />

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
              allowDecimals={false}
            />


            <Tooltip
              formatter={(value) => [
                `${value}`,
                "Feedback",
              ]}
              contentStyle={{
                background: "#101625",
                border:
                  "1px solid #22d3ee",
                borderRadius: "12px",
                color: "#fff",
              }}
            />


            <Area
              type="monotone"
              dataKey="feedback"
              fill="url(#areaFill)"
              stroke="none"
            />


            <Line
              type="monotone"
              dataKey="feedback"
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
              animationDuration={1200}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>


      {/* BOTTOM STATS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "15px",
          marginTop: "20px",
        }}
      >

        <MiniStat
          label="Total Feedback"
          value={feedback.length}
        />

        <MiniStat
          label="Average Rating"
          value={getAverageRating(feedback)}
        />

        <MiniStat
          label="5 Star Reviews"
          value={
            feedback.filter(
              item => Number(item.rating) === 5
            ).length
          }
        />

      </div>

    </div>
  );
}


/* =========================================================
   CREATE ANALYTICS DATA
   ========================================================= */

function createAnalyticsData(feedback) {

  if (!feedback.length) {

    return [
      {
        day: "Mon",
        feedback: 0,
      },
      {
        day: "Tue",
        feedback: 0,
      },
      {
        day: "Wed",
        feedback: 0,
      },
      {
        day: "Thu",
        feedback: 0,
      },
      {
        day: "Fri",
        feedback: 0,
      },
      {
        day: "Sat",
        feedback: 0,
      },
      {
        day: "Sun",
        feedback: 0,
      },
    ];
  }


  const days = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];


  const counts = {
    Sun: 0,
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
  };


  feedback.forEach(item => {

    if (!item.created_at) {
      return;
    }

    const date =
      new Date(item.created_at);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const day =
      days[date.getDay()];

    counts[day]++;
  });


  return [
    {
      day: "Mon",
      feedback: counts.Mon,
    },
    {
      day: "Tue",
      feedback: counts.Tue,
    },
    {
      day: "Wed",
      feedback: counts.Wed,
    },
    {
      day: "Thu",
      feedback: counts.Thu,
    },
    {
      day: "Fri",
      feedback: counts.Fri,
    },
    {
      day: "Sat",
      feedback: counts.Sat,
    },
    {
      day: "Sun",
      feedback: counts.Sun,
    },
  ];
}


/* =========================================================
   AVERAGE RATING
   ========================================================= */

function getAverageRating(feedback) {

  if (!feedback.length) {
    return "0.0";
  }

  const total =
    feedback.reduce(
      (sum, item) =>
        sum + Number(item.rating || 0),
      0
    );

  return (
    total / feedback.length
  ).toFixed(1);
}


/* =========================================================
   MINI STAT
   ========================================================= */

function MiniStat({ label, value }) {

  return (
    <div
      style={{
        background: "#1b2238",
        borderRadius: "16px",
        padding: "16px 18px",
        border:
          "1px solid rgba(255,255,255,.06)",
      }}
    >

      <div
        style={{
          color: "#94a3b8",
          fontSize: "12px",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "white",
          fontSize: "24px",
          fontWeight: "700",
        }}
      >
        {value}
      </div>

    </div>
  );
}