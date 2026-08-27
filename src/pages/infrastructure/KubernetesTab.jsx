import StatusBadge from '../../components/StatusBadge';
import { kubernetesData } from '../../data/mockData';

export default function KubernetesTab() {
  return (
    <div>
      <h2 className="section-title">Kubernetes Clusters</h2>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {kubernetesData.clusters.map((c) => (
          <div key={c.name} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3>{c.name}</h3>
              <StatusBadge status={c.status} />
            </div>
            <div className="grid-3" style={{ gap: 12 }}>
              <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nodes</span><div style={{ fontSize: 20, fontWeight: 700 }}>{c.nodes}</div></div>
              <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pods</span><div style={{ fontSize: 20, fontWeight: 700 }}>{c.pods}</div></div>
              <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Services</span><div style={{ fontSize: 20, fontWeight: 700 }}>{c.services}</div></div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="section-title">Nodes</h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Node</th><th>Status</th><th>CPU</th><th>Memory</th><th>Pods</th></tr></thead>
          <tbody>
            {kubernetesData.nodes.map((n) => (
              <tr key={n.name}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{n.name}</td>
                <td><StatusBadge status={n.status} /></td>
                <td>{n.cpu}%</td>
                <td>{n.memory}%</td>
                <td>{n.pods}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
