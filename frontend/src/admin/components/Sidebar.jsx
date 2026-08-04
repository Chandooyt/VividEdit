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

export default function Sidebar() {
  const menu = [
    {
      icon: <FiGrid />,
      title: "Dashboard",
      active: true,
    },
    {
      icon: <FiBarChart2 />,
      title: "Analytics",
    },
    {
      icon: <FiUsers />,
      title: "Users",
    },
    {
      icon: <FiFilm />,
      title: "Videos",
    },
    {
      icon: <FiShoppingBag />,
      title: "Products",
    },
    {
      icon: <FiCreditCard />,
      title: "Orders",
    },
    {
      icon: <FiCreditCard />,
      title: "Transactions",
    },
    {
      icon: <FiFileText />,
      title: "Reports",
    },
    {
      icon: <FiMessageSquare />,
      title: "Messages",
    },
    {
      icon: <FiSettings />,
      title: "Settings",
    },
    {
      icon: <FiLink />,
      title: "Integrations",
    },
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

            <p>
              AI VIDEO EDITOR
            </p>
          </div>

        </div>

        {/* SIDEBAR MENU */}

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
          ))}

        </div>

      </div>

      {/* SIDEBAR BOTTOM */}

      <div className="sidebarBottom">

        {/* FOUNDER CARD */}

        <div className="founderCard">

          <div className="founderIcon">
            V
          </div>

          <div>
            <h3>
              VIVID
            </h3>

            <p>
              Building the Agentic
              AI video editor
            </p>
          </div>

        </div>

        {/* FOUNDER PROFILE */}

        <div className="adminProfile">

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

        </div>

        {/* LOGOUT */}

        <button className="logout">

          <FiLogOut />

          Logout

        </button>

      </div>

    </aside>
  );
}