import { monitoringMetrics, alerts } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';

export default function MonitoringOverview() {
  const { system, application } = monitoringMetrics;

  return (
    <div>
      <h2 className="section-title">Monitoring Dashboard</h2>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 className="section-title">System Health</h3>
          <div className="grid-2" style={{ gap: 12 }}>
            {Object.entries(system).filter(([k]) => k !== 'uptime').map(([k, v]) => (
              <div key={k}><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k.toUpperCase()}</span><div style={{ fontSize: 22, fontWeight: 700 }}>{v}{k !== 'uptime' ? '%' : ''}</div></div>
            ))}
            <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>UPTIME</span><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-green)' }}>{system.uptime}%</div></div>
          </div>
        </div>
        <div className="card">
          <h3 className="section-title">Application Health</h3>
          <div className="grid-2" style={{ gap: 12 }}>
            <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Requests</span><div style={{ fontSize: 22, fontWeight: 700 }}>{application.requests.toLocaleString()}</div></div>
            <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Error Rate</span><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-red)' }}>{application.errorRate}%</div></div>
            <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Response Time</span><div style={{ fontSize: 22, fontWeight: 700 }}>{application.responseTime}ms</div></div>
            <div><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Throughput</span><div style={{ fontSize: 22, fontWeight: 700 }}>{application.throughput} req/s</div></div>
          </div>
        </div>
      </div>
      <h3 className="section-title">Active Alerts</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {alerts.filter(a => a.status === 'active').map((a) => (
          <div key={a.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusBadge status={a.severity} />
            <span style={{ flex: 1, fontSize: 14 }}>{a.message}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
