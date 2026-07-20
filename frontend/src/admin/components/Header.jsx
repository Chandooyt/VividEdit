import { FiBell, FiSearch } from "react-icons/fi";

export default function Header() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "28px 35px",
        borderBottom: "1px solid #1f2937",
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "34px",
            fontWeight: "700",
          }}
        >
          Dashboard
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#94a3b8",
          }}
        >
          Welcome back, Admin! 👋
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#111827",
            border: "1px solid #27272a",
            borderRadius: "15px",
            padding: "12px 18px",
            width: "420px",
          }}
        >
          <FiSearch
            size={18}
            color="#8b8b8b"
          />

          <input
            placeholder="Search anything..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              marginLeft: "12px",
              color: "white",
              width: "100%",
              fontSize: "15px",
            }}
          />
        </div>

        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "#111827",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <FiBell size={20} />
        </div>

        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "#6d28d9",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            fontSize: "22px",
          }}
        >
          V
        </div>
      </div>
    </div>
  );
}