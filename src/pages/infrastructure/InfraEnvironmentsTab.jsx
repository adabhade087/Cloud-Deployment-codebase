import StatusBadge from '../../components/StatusBadge';
import { infraEnvironments } from '../../data/mockData';

export default function InfraEnvironmentsTab() {
  return (
    <div>
      <h2 className="section-title">Infrastructure Environments</h2>
      <div className="grid-3">
        {infraEnvironments.map((env) => (
          <div key={env.name} className="card card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3>{env.name}</h3>
              <StatusBadge status={env.status} />
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              <div><strong>Resources:</strong> {env.resources}</div>
              <div><strong>Monthly cost:</strong> ₹{env.cost.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
