import {
  FiGrid,
  FiBarChart2,
  FiFilm,
  FiUsers,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

export default function Sidebar() {
  const menu = [
    { icon: <FiGrid />, title: "Dashboard", active: true },
    { icon: <FiBarChart2 />, title: "Analytics" },
    { icon: <FiFilm />, title: "Videos" },
    { icon: <FiUsers />, title: "Users" },
    { icon: <FiSettings />, title: "Settings" },
  ];

  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logoIcon">V</div>

        <div>
          <h2>VIVID</h2>
          <p>AI Video Editor</p>
        </div>
      </div>

      <div className="menu">

        {menu.map((item, index) => (
          <button
            key={index}
            className={
              item.active
                ? "menuItem active"
                : "menuItem"
            }
          >
            {item.icon}
            <span>{item.title}</span>
          </button>
        ))}

      </div>

      <div className="sidebarBottom">

        <button className="logout">

          <FiLogOut />

          Logout

        </button>

      </div>

    </aside>
  );
}