// client/src/components/Header.jsx
import { FaBars, FaBell, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import './Header.css';

const Header = ({ onMenuToggle, onLogout, title, subtitle, showSearch = true }) => {
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <button className="menu-toggle" onClick={onMenuToggle}>
            <FaBars />
          </button>
          <div className="header-title">
            <h1 className="welcome-title">{title}</h1>
            {subtitle && <p className="welcome-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="header-right">
          {showSearch && (
            <div className="header-search">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search..." 
              />
            </div>
          )}

          <button className="header-notifications">
            <FaBell />
            <span className="notification-badge"></span>
          </button>

          <button onClick={onLogout} className="logout-button">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;