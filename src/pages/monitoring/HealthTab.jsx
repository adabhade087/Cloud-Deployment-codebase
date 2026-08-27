import StatusBadge from '../../components/StatusBadge';
import { healthChecks } from '../../data/mockData';

export default function HealthTab() {
  return (
    <div>
      <h2 className="section-title">System Health</h2>
      <div className="grid-auto">
        {healthChecks.map((h) => (
          <div key={h.name} className="card card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16 }}>{h.name}</h3>
              <StatusBadge status={h.status} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
              <span>Uptime: <strong style={{ color: 'var(--accent-green)' }}>{h.uptime}%</strong></span>
              <span>{h.items} items</span>
            </div>
            <div style={{ marginTop: 12, height: 6, background: 'var(--bg-primary)', borderRadius: 3 }}>
              <div style={{ width: `${h.uptime}%`, height: '100%', background: h.status === 'healthy' ? 'var(--accent-green)' : 'var(--accent-orange)', borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
