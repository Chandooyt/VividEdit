import {
  FiGrid,
  FiBarChart2,
  FiFilm,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiShoppingBag,
  FiCreditCard,
  FiFileText,
  FiMessageSquare,
  FiLink,
} from "react-icons/fi";

export default function Sidebar({
  activePage = "Dashboard",
  onNavigate = () => {},
  onLogout = () => {},
}) {
  const menu = [
    { icon: <FiGrid />, title: "Dashboard" },
    { icon: <FiBarChart2 />, title: "Analytics" },
    { icon: <FiUsers />, title: "Users" },
    { icon: <FiFilm />, title: "Videos" },
    { icon: <FiShoppingBag />, title: "Products" },
    { icon: <FiCreditCard />, title: "Orders" },
    { icon: <FiCreditCard />, title: "Transactions" },
    { icon: <FiFileText />, title: "Reports" },
    { icon: <FiMessageSquare />, title: "Messages" },
    { icon: <FiSettings />, title: "Settings" },
    { icon: <FiLink />, title: "Integrations" },
  ];

  return (
    <aside className="sidebar">

      {/* VIVID LOGO */}
      <div>
        <div className="logo">
          <div className="logoIcon">
            V
          </div>

          <div>
            <h2>VIVID</h2>
            <p>AI VIDEO EDITOR</p>
          </div>
        </div>

        {/* MENU */}
        <div className="menu">

          {menu.map((item) => {
            const isActive = activePage === item.title;

            return (
              <button
                key={item.title}
                type="button"
                className={
                  isActive
                    ? "menuItem active"
                    : "menuItem"
                }
                onClick={() => onNavigate(item.title)}
              >
                <span className="menuIcon">
                  {item.icon}
                </span>

                <span>
                  {item.title}
                </span>

                {item.title === "Messages" && (
                  <span className="menuBadge">
                    5
                  </span>
                )}
              </button>
            );
          })}

        </div>
      </div>

      {/* BOTTOM */}
      <div className="sidebarBottom">

        {/* FOUNDER CARD */}
        <div className="founderCard">

          <div className="founderIcon">
            V
          </div>

          <div>
            <h3>VIVID</h3>

            <p>
              Building the Agentic
              AI video editor
            </p>
          </div>

        </div>

        {/* FOUNDER PROFILE */}
        <button
          type="button"
          className="adminProfile"
          onClick={() => onNavigate("Profile")}
        >

          <div className="adminAvatar">
            C
          </div>

          <div>
            <strong>
              Chandoo
            </strong>

            <span>
              CEO / Founder
            </span>
          </div>

          <span className="profileArrow">
            ›
          </span>

        </button>

        {/* LOGOUT */}
        <button
          type="button"
          className="logout"
          onClick={onLogout}
        >
          <FiLogOut />
          Logout
        </button>

      </div>

    </aside>
  );
}