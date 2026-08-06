import { useMemo, useState } from "react";

export default function VideosSection() {
  const [search, setSearch] = useState("");

  // Temporary demo data.
  // Later we will connect this directly to your VIVID backend.
  const videos = [
    {
      id: 1,
      name: "creator_video_01.mp4",
      status: "Completed",
      size: "24.5 MB",
      date: "Today",
    },
    {
      id: 2,
      name: "podcast_clip.mp4",
      status: "Completed",
      size: "41.2 MB",
      date: "Yesterday",
    },
    {
      id: 3,
      name: "youtube_short.mp4",
      status: "Processing",
      size: "18.7 MB",
      date: "Yesterday",
    },
  ];

  const filteredVideos = useMemo(() => {
    return videos.filter((video) =>
      video.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div>

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >

        <div>
          <h1
            style={{
              color: "white",
              margin: 0,
              fontSize: "30px",
            }}
          >
            Videos
          </h1>

          <p
            style={{
              color: "#94a3b8",
              marginTop: "8px",
            }}
          >
            Manage videos processed by VIVID.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search videos..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            background: "#151b2d",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: "12px",
            padding: "12px 16px",
            color: "white",
            outline: "none",
            minWidth: "220px",
          }}
        />

      </div>


      {/* STATS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "18px",
          marginBottom: "25px",
        }}
      >

        <Stat
          title="Total Videos"
          value={videos.length}
        />

        <Stat
          title="Completed"
          value={
            videos.filter(
              (v) => v.status === "Completed"
            ).length
          }
        />

        <Stat
          title="Processing"
          value={
            videos.filter(
              (v) => v.status === "Processing"
            ).length
          }
        />

      </div>


      {/* VIDEO TABLE */}

      <div
        style={{
          background: "#151b2d",
          borderRadius: "22px",
          border:
            "1px solid rgba(255,255,255,.08)",
          overflow: "hidden",
        }}
      >

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "2fr 1fr 1fr 1fr 1.2fr",
            padding: "18px 22px",
            color: "#94a3b8",
            fontSize: "13px",
            borderBottom:
              "1px solid rgba(255,255,255,.08)",
          }}
        >

          <span>VIDEO</span>
          <span>STATUS</span>
          <span>SIZE</span>
          <span>DATE</span>
          <span>ACTIONS</span>

        </div>


        {filteredVideos.map((video) => (

          <div
            key={video.id}
            style={{
              display: "grid",
              gridTemplateColumns:
                "2fr 1fr 1fr 1fr 1.2fr",
              alignItems: "center",
              padding: "20px 22px",
              borderBottom:
                "1px solid rgba(255,255,255,.05)",
              color: "white",
            }}
          >

            <strong>
              🎬 {video.name}
            </strong>

            <span
              style={{
                color:
                  video.status === "Completed"
                    ? "#22d3ee"
                    : "#facc15",
              }}
            >
              {video.status}
            </span>

            <span
              style={{
                color: "#94a3b8",
              }}
            >
              {video.size}
            </span>

            <span
              style={{
                color: "#94a3b8",
              }}
            >
              {video.date}
            </span>

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >

              <button
                type="button"
                disabled={
                  video.status !== "Completed"
                }
                onClick={() =>
                  alert(
                    `Download ${video.name}`
                  )
                }
                style={{
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  cursor:
                    video.status === "Completed"
                      ? "pointer"
                      : "not-allowed",
                  background:
                    video.status === "Completed"
                      ? "#22d3ee"
                      : "#334155",
                  color: "#020617",
                  fontWeight: "700",
                }}
              >
                Download
              </button>

              <button
                type="button"
                onClick={() =>
                  alert(
                    `Delete ${video.name}`
                  )
                }
                style={{
                  border: "1px solid rgba(239,68,68,.35)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  background:
                    "rgba(239,68,68,.08)",
                  color: "#f87171",
                }}
              >
                Delete
              </button>

            </div>

          </div>

        ))}


        {filteredVideos.length === 0 && (

          <div
            style={{
              padding: "60px",
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            No videos found.
          </div>

        )}

      </div>

    </div>
  );
}


function Stat({ title, value }) {

  return (
    <div
      style={{
        background: "#151b2d",
        borderRadius: "18px",
        padding: "22px",
        border:
          "1px solid rgba(255,255,255,.08)",
      }}
    >

      <div
        style={{
          color: "#94a3b8",
          fontSize: "13px",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "white",
          fontSize: "28px",
          fontWeight: "700",
        }}
      >
        {value}
      </div>

    </div>
  );
}