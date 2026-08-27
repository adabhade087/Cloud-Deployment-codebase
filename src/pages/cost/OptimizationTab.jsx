import { optimizationRecommendations } from '../../data/mockData';

export default function OptimizationTab() {
  const totalSavings = optimizationRecommendations.reduce((sum, r) => sum + r.savings, 0);

  return (
    <div>
      <div className="tab-header">
        <div>
          <h2 className="section-title">Cost Optimization</h2>
          <p className="page-subtitle">Potential savings: ₹{totalSavings.toLocaleString()}/month</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {optimizationRecommendations.map((rec) => (
          <div key={rec.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: rec.priority === 'high' ? 'rgba(239,68,68,0.15)' : rec.priority === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
            }}>
              {rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵'}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, marginBottom: 4 }}>{rec.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{rec.description}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-green)' }}>₹{rec.savings.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>/month</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
