import { FiBell, FiSearch } from "react-icons/fi";

export default function Header() {
  return (
    <header className="dashboard-header">

      <div className="header-title">
        <h1>Dashboard</h1>

        <p>
          Welcome back, Admin! 👋
        </p>
      </div>

      <div className="header-actions">

        {/* Search */}
        <div className="header-search">
          <FiSearch size={18} />

          <input
            type="text"
            placeholder="Search anything..."
          />
        </div>

        {/* Notifications */}
        <button className="header-icon">
          <FiBell size={20} />
        </button>

        {/* Admin */}
        <div className="header-avatar">
          V
        </div>

      </div>

    </header>
  );
}