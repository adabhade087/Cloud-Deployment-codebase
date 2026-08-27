import StatusBadge from './StatusBadge';
import './ResourceCard.css';

export default function ResourceCard({ resource }) {
  return (
    <div className="resource-card card">
      <div className="resource-card-header">
        <div>
          <h4 className="resource-name">{resource.name}</h4>
          <span className="resource-type">{resource.type}</span>
        </div>
        <StatusBadge status={resource.status} />
      </div>
      <div className="resource-details">
        <div className="resource-detail">
          <span className="detail-label">Region</span>
          <span className="detail-value">{resource.region}</span>
        </div>
        {resource.cpu > 0 && (
          <div className="resource-detail">
            <span className="detail-label">CPU</span>
            <div className="resource-bar">
              <div className="resource-bar-fill" style={{ width: `${resource.cpu}%` }} />
            </div>
            <span className="detail-value">{resource.cpu}%</span>
          </div>
        )}
        {resource.memory > 0 && (
          <div className="resource-detail">
            <span className="detail-label">Memory</span>
            <div className="resource-bar">
              <div className="resource-bar-fill memory" style={{ width: `${resource.memory}%` }} />
            </div>
            <span className="detail-value">{resource.memory}%</span>
          </div>
        )}
        <div className="resource-detail">
          <span className="detail-label">Cost</span>
          <span className="detail-value cost">₹{resource.cost.toLocaleString()}/mo</span>
        </div>
      </div>
    </div>
  );
}
