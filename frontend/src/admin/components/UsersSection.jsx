export default function UsersSection() {
  return (
    <div
      style={{
        background: "#151b2d",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "30px",
        minHeight: "500px",
        boxShadow: "0 20px 50px rgba(0,0,0,.15)",
      }}
    >
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
            VIVID Users
          </h2>

          <p
            style={{
              color: "#94a3b8",
              margin: "6px 0 0",
              fontSize: "13px",
            }}
          >
            Manage users and account activity
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
          USERS
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <Stat label="Total Users" value="0" />
        <Stat label="Active Users" value="0" />
        <Stat label="New Users" value="0" />
      </div>

      <div
        style={{
          background: "#101625",
          borderRadius: "16px",
          padding: "40px",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div
          style={{
            fontSize: "42px",
            marginBottom: "15px",
          }}
        >
          👥
        </div>

        <h3
          style={{
            color: "white",
            margin: "0 0 8px",
          }}
        >
          No users yet
        </h3>

        <p
          style={{
            color: "#94a3b8",
            margin: 0,
          }}
        >
          User accounts will appear here when authentication is connected.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        background: "#1b2238",
        borderRadius: "16px",
        padding: "18px",
        border: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div
        style={{
          color: "#94a3b8",
          fontSize: "12px",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "white",
          fontSize: "26px",
          fontWeight: "700",
        }}
      >
        {value}
      </div>
    </div>
  );
}