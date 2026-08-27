import './MetricCard.css';

const icons = {
  deployments: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  pipelines: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  infrastructure: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="2" y="15" width="20" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 9v6M18 9v6" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  cost: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export default function MetricCard({ icon, value, label, trend, trendUp, color = 'blue' }) {
  return (
    <div className={`metric-card metric-card-${color}`}>
      <div className="metric-card-header">
        <div className="metric-icon">{icons[icon] || icons.deployments}</div>
        {trend && (
          <span className={`metric-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}
