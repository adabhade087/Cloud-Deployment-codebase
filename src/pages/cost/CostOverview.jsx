import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cloudCostData, costByService, costTrend } from '../../data/mockData';

const COLORS = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#06b6d4'];

export default function CostOverview() {
  return (
    <div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card"><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Current Monthly</div><div style={{ fontSize: 28, fontWeight: 800 }}>₹{cloudCostData.current.toLocaleString()}</div></div>
        <div className="card"><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Estimated Monthly</div><div style={{ fontSize: 28, fontWeight: 800 }}>₹{cloudCostData.estimated.toLocaleString()}</div></div>
        <div className="card"><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Daily Cost</div><div style={{ fontSize: 28, fontWeight: 800 }}>₹{cloudCostData.daily.toLocaleString()}</div></div>
        <div className="card"><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Previous Month</div><div style={{ fontSize: 28, fontWeight: 800 }}>₹{cloudCostData.previous.toLocaleString()}</div></div>
      </div>

      <div className="grid-2">
        <div className="card chart-card">
          <h3 className="section-title">Cost Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={costTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip contentStyle={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} formatter={(v) => [`₹${v.toLocaleString()}`, 'Cost']} />
              <Line type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3 className="section-title">Cost by Service</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={costByService} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {costByService.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} formatter={(v) => [`₹${v.toLocaleString()}`, 'Cost']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
