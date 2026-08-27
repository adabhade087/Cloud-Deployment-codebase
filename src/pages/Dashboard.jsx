import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import ServiceCard from '../components/ServiceCard';
import StatusBadge from '../components/StatusBadge';
import {
  dashboardMetrics, deploymentActivity, infrastructureHealth, pipelineActivity,
  cloudCostData, recentActivity, landingServices,
} from '../data/mockData';
import './Dashboard.css';

const COLORS = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#06b6d4'];

export default function Dashboard() {
  const pipelineData = [
    { name: 'Running', value: pipelineActivity.running, color: '#6366f1' },
    { name: 'Successful', value: pipelineActivity.successful, color: '#22c55e' },
    { name: 'Failed', value: pipelineActivity.failed, color: '#ef4444' },
    { name: 'Queued', value: pipelineActivity.queued, color: '#f59e0b' },
  ];

  return (
    <div className="dashboard-page">
      <div className="grid-4 dashboard-metrics">
        <MetricCard icon="deployments" value={dashboardMetrics.deployments.value} label={dashboardMetrics.deployments.label} trend={dashboardMetrics.deployments.trend} trendUp={dashboardMetrics.deployments.trendUp} color="blue" />
        <MetricCard icon="pipelines" value={dashboardMetrics.pipelines.value} label={dashboardMetrics.pipelines.label} trend={dashboardMetrics.pipelines.trend} trendUp={dashboardMetrics.pipelines.trendUp} color="green" />
        <MetricCard icon="infrastructure" value={dashboardMetrics.infrastructure.value} label={dashboardMetrics.infrastructure.label} trend={dashboardMetrics.infrastructure.trend} trendUp={dashboardMetrics.infrastructure.trendUp} color="purple" />
        <MetricCard icon="cost" value={dashboardMetrics.monthlyCost.value} label={dashboardMetrics.monthlyCost.label} trend={dashboardMetrics.monthlyCost.trend} trendUp={dashboardMetrics.monthlyCost.trendUp} color="orange" />
      </div>

      <div className="grid-2 dashboard-charts">
        <div className="card chart-card">
          <h3 className="section-title">Deployment Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deploymentActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip contentStyle={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3 className="section-title">Infrastructure Health</h3>
          <div className="health-bars">
            {Object.entries(infrastructureHealth).map(([key, val]) => (
              <div key={key} className="health-bar-item">
                <div className="health-bar-label">
                  <span>{key.toUpperCase()}</span>
                  <span>{val}%</span>
                </div>
                <div className="health-bar-track">
                  <div className="health-bar-fill" style={{ width: `${val}%`, background: val > 80 ? '#ef4444' : val > 60 ? '#f59e0b' : '#22c55e' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2 dashboard-charts">
        <div className="card chart-card">
          <h3 className="section-title">Pipeline Activity</h3>
          <div className="pipeline-summary">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {pipelineData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pipeline-legend">
              {pipelineData.map((p) => (
                <div key={p.name} className="legend-item">
                  <span className="legend-dot" style={{ background: p.color }} />
                  <span>{p.name}</span>
                  <strong>{p.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card chart-card">
          <h3 className="section-title">Cloud Cost</h3>
          <div className="cost-summary">
            <div className="cost-item">
              <span className="cost-label">Current</span>
              <span className="cost-value">₹{cloudCostData.current.toLocaleString()}</span>
            </div>
            <div className="cost-item">
              <span className="cost-label">Estimated Monthly</span>
              <span className="cost-value">₹{cloudCostData.estimated.toLocaleString()}</span>
            </div>
            <div className="cost-item">
              <span className="cost-label">Previous Month</span>
              <span className="cost-value">₹{cloudCostData.previous.toLocaleString()}</span>
            </div>
            <div className="cost-trend">
              <span className={cloudCostData.trend < 0 ? 'trend-down' : 'trend-up'}>
                {cloudCostData.trend < 0 ? '↓' : '↑'} {Math.abs(cloudCostData.trend)}% vs last month
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map((a) => (
            <div key={a.id} className="activity-item">
              <StatusBadge status={a.status === 'success' ? 'success' : a.status === 'warning' ? 'warning' : 'info'} />
              <span className="activity-message">{a.message}</span>
              <span className="activity-time">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="section-title">Quick Navigation</h3>
        <div className="grid-auto">
          {landingServices.map((s) => (
            <ServiceCard key={s.id} icon={s.icon} name={s.name} description={s.description} status={s.status} route={s.route} />
          ))}
        </div>
      </div>
    </div>
  );
}
