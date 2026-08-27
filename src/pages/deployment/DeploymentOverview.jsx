import { useNavigate } from 'react-router-dom';
import { deployments } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function DeploymentOverview() {
  const navigate = useNavigate();
  const successCount = deployments.filter(d => d.status === 'success').length;
  const activeCount = deployments.filter(d => d.status === 'deploying').length;

  return (
    <div>
      <div className="tab-header">
        <div>
          <h2 className="section-title">Deployment Overview</h2>
          <p className="page-subtitle">Manage deployments across all environments</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/deployment/deployments')}>Deploy Now</button>
      </div>
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card"><div style={{ fontSize: 28, fontWeight: 800 }}>{deployments.length}</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Deployments</div></div>
        <div className="card"><div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-green)' }}>{successCount}</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Successful</div></div>
        <div className="card"><div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-blue)' }}>{activeCount}</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>In Progress</div></div>
      </div>
      <h3 className="section-title">Recent Deployments</h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Project</th><th>Environment</th><th>Version</th><th>Status</th></tr></thead>
          <tbody>
            {deployments.slice(0, 4).map((d) => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.project}</td>
                <td>{d.environment}</td>
                <td>{d.version}</td>
                <td><StatusBadge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
