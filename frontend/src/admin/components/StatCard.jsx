export default function StatCard({ title, value, color, icon }) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg,#171c2f,#111827)",
        borderRadius: "24px",
        padding: "28px",
        border: "1px solid rgba(255,255,255,.08)",
        boxShadow: `0 15px 40px ${color}25`,
        transition: "all .3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = `0 20px 50px ${color}55`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = `0 15px 40px ${color}25`;
      }}
    >
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