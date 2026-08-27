import { useNavigate } from 'react-router-dom';
import { infrastructureResources } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function InfraOverview() {
  const navigate = useNavigate();
  const running = infrastructureResources.filter(r => r.status === 'running' || r.status === 'active').length;
  const totalCost = infrastructureResources.reduce((s, r) => s + r.cost, 0);

  return (
    <div>
      <div className="tab-header">
        <div>
          <h2 className="section-title">Infrastructure Overview</h2>
          <p className="page-subtitle">Cloud resource management dashboard</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/infrastructure/resources')}>Provision Infrastructure</button>
      </div>
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card"><div style={{ fontSize: 28, fontWeight: 800 }}>{infrastructureResources.length}</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Resources</div></div>
        <div className="card"><div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-green)' }}>{running}</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Running/Active</div></div>
        <div className="card"><div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-orange)' }}>₹{totalCost.toLocaleString()}</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Monthly Cost</div></div>
      </div>
      <h3 className="section-title">Resource Summary</h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Region</th></tr></thead>
          <tbody>
            {infrastructureResources.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</td>
                <td>{r.type}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>{r.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
