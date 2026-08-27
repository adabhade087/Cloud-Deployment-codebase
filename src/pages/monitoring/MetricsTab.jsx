import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { metricCharts, monitoringMetrics } from '../../data/mockData';

function MetricChart({ title, data, color }) {
  return (
    <div className="card chart-card">
      <h3 className="section-title">{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="time" stroke="#71717a" fontSize={11} />
          <YAxis stroke="#71717a" fontSize={11} />
          <Tooltip contentStyle={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MetricsTab() {
  const { system, application } = monitoringMetrics;

  return (
    <div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'CPU', value: `${system.cpu}%` },
          { label: 'Memory', value: `${system.memory}%` },
          { label: 'Disk', value: `${system.disk}%` },
          { label: 'Network', value: `${system.network}%` },
        ].map((m) => (
          <div key={m.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{m.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <MetricChart title="CPU Usage" data={metricCharts.cpu} color="#6366f1" />
        <MetricChart title="Memory Usage" data={metricCharts.memory} color="#8b5cf6" />
        <MetricChart title="Network I/O" data={metricCharts.network} color="#06b6d4" />
        <MetricChart title="Disk Usage" data={metricCharts.disk} color="#f59e0b" />
      </div>

      <h3 className="section-title">Application Health</h3>
      <div className="grid-4">
        <div className="card"><div style={{ fontSize: 22, fontWeight: 700 }}>{application.requests.toLocaleString()}</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Requests/min</div></div>
        <div className="card"><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-red)' }}>{application.errorRate}%</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Error Rate</div></div>
        <div className="card"><div style={{ fontSize: 22, fontWeight: 700 }}>{application.responseTime}ms</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Response Time</div></div>
        <div className="card"><div style={{ fontSize: 22, fontWeight: 700 }}>{application.throughput}</div><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Throughput req/s</div></div>
      </div>
    </div>
  );
}
