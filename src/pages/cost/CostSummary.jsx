import { cloudCostData } from '../../data/mockData';

export default function CostSummary() {
  return (
    <div>
      <h2 className="section-title">Cost Summary</h2>
      <div className="grid-4">
        <div className="card"><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Current Monthly</div><div style={{ fontSize: 28, fontWeight: 800 }}>₹{cloudCostData.current.toLocaleString()}</div></div>
        <div className="card"><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Estimated</div><div style={{ fontSize: 28, fontWeight: 800 }}>₹{cloudCostData.estimated.toLocaleString()}</div></div>
        <div className="card"><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Daily</div><div style={{ fontSize: 28, fontWeight: 800 }}>₹{cloudCostData.daily.toLocaleString()}</div></div>
        <div className="card"><div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Trend</div><div style={{ fontSize: 28, fontWeight: 800, color: cloudCostData.trend < 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{cloudCostData.trend}%</div></div>
      </div>
      <p style={{ marginTop: 20, color: 'var(--text-secondary)', fontSize: 14 }}>Navigate to sub-services for detailed cost analysis, estimation, budgeting, and optimization.</p>
    </div>
  );
}
