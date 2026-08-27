import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ServiceSwitcher from './ServiceSwitcher';
import './DashboardHeader.css';

export default function DashboardHeader({ title, subtitle, onMenuClick }) {
  const { user } = useAuth();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [environment, setEnvironment] = useState('Production');

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="header-titles">
          {title ? (
            <>
              <h1 className="header-title">{title}</h1>
              {subtitle && <p className="header-subtitle">{subtitle}</p>}
            </>
          ) : (
            <>
              <h1 className="header-title">{greeting()}, {user?.name?.split(' ')[0] || 'Anuj'}</h1>
              <p className="header-subtitle">Here's what's happening with your infrastructure today.</p>
            </>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="header-search hide-mobile">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input type="text" placeholder="Search resources, pipelines..." />
        </div>

        <div className="service-switcher-wrapper">
          <button
            className="header-btn"
            onClick={() => setShowSwitcher(!showSwitcher)}
            title="Switch service"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
          {showSwitcher && (
            <ServiceSwitcher onClose={() => setShowSwitcher(false)} />
          )}
        </div>

        <select
          className="env-selector hide-mobile"
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
        >
          <option>Development</option>
          <option>Staging</option>
          <option>Production</option>
        </select>

        <button className="header-btn notification-btn" title="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="notification-dot" />
        </button>

        <div className="header-avatar">
          {user?.name?.[0] || 'A'}
        </div>
      </div>
    </header>
  );
}
