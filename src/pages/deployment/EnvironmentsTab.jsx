import StatusBadge from '../../components/StatusBadge';
import { deploymentEnvironments } from '../../data/mockData';

export default function EnvironmentsTab() {
  return (
    <div>
      <h2 className="section-title">Deployment Environments</h2>
      <div className="grid-3">
        {deploymentEnvironments.map((env) => (
          <div key={env.id} className="card card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18 }}>{env.name}</h3>
              <StatusBadge status={env.status} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>URL:</strong> {env.url}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Deployments:</strong> {env.deployments}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Last deploy:</strong> {env.lastDeploy}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
