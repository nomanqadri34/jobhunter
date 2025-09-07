import React from 'react';
import { Search, User, Bell, Settings, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '/logo.png';

export const Navbar = ({ onSearch, onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout();
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      window.dispatchEvent(new Event('authStatusChanged'));
      navigate('/login');
    } catch (error) {
      navigate('/login');
    }
  };

  return (
    <header className="navbar" role="banner">
      <div className="navbar-container">
        <div className="navbar-left">
          <button
            className="sidebar-toggle"
            type="button"
            aria-label="Open sidebar"
            title="Menu"
            onClick={onToggleSidebar}
          >
            <Menu size={24} />
          </button>
          <a className="brand" href="#" aria-label="Home">
            <img src={logo} alt="Logo" className="navbar-logo" />

          </a>
        </div>

        <form className="navbar-search" role="search" aria-label="Site search" onSubmit={(e) => e.preventDefault()}>
          <Search className="search-icon" />
          <input
            type="search"
            placeholder="Search jobs, companies..."
            aria-label="Search jobs or companies"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </form>

        <div className="navbar-actions" role="group" aria-label="User actions">
          <button className="icon-btn" type="button" aria-label="Notifications" title="Notifications">
            <Bell size={20} />
            <span className="sr-only">Notifications</span>
          </button>

          <div className="user-menu">
            <button className="user-btn" type="button" aria-haspopup="menu" aria-expanded="false">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name || 'User'} className="avatar" />
              ) : (
                <User size={20} />
              )}
              <span className="user-name">{user?.name || 'Account'}</span>
            </button>

            <div className="dropdown" role="menu">
              <button className="dropdown-item" type="button">
                <Settings size={16} />
                Settings
              </button>
              <button className="dropdown-item" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
