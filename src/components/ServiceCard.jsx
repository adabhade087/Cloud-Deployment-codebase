import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import './ServiceCard.css';

export default function ServiceCard({ icon, name, description, status, route, onClick }) {
  const content = (
    <div className="service-card card card-hover">
      <div className="service-card-icon">{icon}</div>
      <h3 className="service-card-name">{name}</h3>
      <p className="service-card-desc">{description}</p>
      <div className="service-card-footer">
        <StatusBadge status={status || 'operational'} />
        <span className="service-card-action">View Service →</span>
      </div>
    </div>
  );

  if (route) {
    return <Link to={route}>{content}</Link>;
  }

  return <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>{content}</div>;
}
