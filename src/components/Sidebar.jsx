import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const mainNav = [
  { path: '/dashboard', label: 'Home / Overview', icon: 'home' },
  { path: '/deployment', label: 'Deployment', icon: 'deploy' },
  { path: '/pipelines', label: 'Pipelines', icon: 'pipeline' },
  { path: '/infrastructure', label: 'Infrastructure', icon: 'infra' },
  { path: '/monitoring', label: 'Monitoring', icon: 'monitor' },
  { path: '/cost', label: 'Cost Estimation', icon: 'cost' },
];

const bottomNav = [
  { path: '/dashboard', label: 'Settings', icon: 'settings' },
  { path: '/dashboard', label: 'Help', icon: 'help' },
];

const icons = {
  home: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.5" fill="none"/>,
  deploy: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none"/>,
  pipeline: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" fill="none"/>,
  infra: <><rect x="2" y="3" width="20" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="2" y="15" width="20" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/></>,
  monitor: <><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.5" fill="none"/></>,
  cost: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" fill="none"/>,
  settings: <><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5"/></>,
  help: <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  logout: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" fill="none"/>,
};

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} />}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#6366f1"/>
                <path d="M8 20L16 8L24 20H8Z" fill="#a5b4fc"/>
              </svg>
            </div>
            {!collapsed && <span className="logo-text">NexusCloud</span>}
          </div>
          <button className="sidebar-toggle hide-mobile" onClick={onToggle} aria-label="Toggle sidebar">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5h12M3 9h12M3 13h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {mainNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={item.label}
              onClick={onMobileClose}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{icons[item.icon]}</svg>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {bottomNav.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className="sidebar-link"
              title={item.label}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{icons[item.icon]}</svg>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          <div className="sidebar-user">
            <div className="user-avatar">{user?.name?.[0] || 'A'}</div>
            {!collapsed && (
              <div className="user-info">
                <span className="user-name">{user?.name || 'Anuj'}</span>
                <span className="user-email">{user?.email || 'anuj@nexuscloud.io'}</span>
              </div>
            )}
          </div>

          <button className="sidebar-link logout-btn" onClick={handleLogout} title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{icons.logout}</svg>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
