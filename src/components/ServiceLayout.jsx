import { NavLink, Outlet } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import './ServiceLayout.css';

export default function ServiceLayout({ serviceName, tabs, breadcrumbBase }) {
  return (
    <div className="service-layout">
      <Breadcrumb items={breadcrumbBase} />
      <div className="service-layout-header">
        <h1 className="page-title">{serviceName}</h1>
      </div>
      <nav className="sub-nav">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
