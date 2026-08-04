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

      {/* LOGO */}

      <div>

        <div className="logo">

          <div className="logoIcon">
            V
          </div>

          <div>
            <h2>VIVID</h2>

            <p>
              ADMIN
            </p>
          </div>

        </div>

        {/* MENU */}

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

      {/* BOTTOM */}

      <div className="sidebarBottom">

        <div className="upgradeCard">

          <div className="upgradeIcon">
            ◆
          </div>

          <h3>
            Upgrade to Pro
          </h3>

          <p>
            Unlock all premium features
          </p>

          <button>
            Upgrade Now →
          </button>

        </div>

        <div className="adminProfile">

          <div className="adminAvatar">
            A
          </div>

          <div>
            <strong>
              Admin
            </strong>

            <span>
              Super Admin
            </span>
          </div>

          <span className="profileArrow">
            ›
          </span>

        </div>

        <button className="logout">
          <FiLogOut />
          Logout
        </button>

      </div>

    </aside>
  );
}