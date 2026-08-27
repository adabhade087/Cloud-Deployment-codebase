// Structured mock data — replace with API responses later

export const dashboardMetrics = {
  deployments: { value: 24, label: 'Successful deployments', trend: '+12%', trendUp: true, status: 'healthy' },
  pipelines: { value: 12, label: 'Currently running', trend: '+3', trendUp: true, status: 'active' },
  infrastructure: { value: '98.4%', label: 'Healthy resources', trend: '+0.2%', trendUp: true, status: 'healthy' },
  monthlyCost: { value: '₹42,580', label: 'Estimated cloud usage', trend: '-5%', trendUp: false, status: 'normal' },
};

export const deploymentActivity = [
  { date: 'Mon', count: 4 },
  { date: 'Tue', count: 7 },
  { date: 'Wed', count: 5 },
  { date: 'Thu', count: 9 },
  { date: 'Fri', count: 6 },
  { date: 'Sat', count: 3 },
  { date: 'Sun', count: 8 },
];

export const infrastructureHealth = {
  cpu: 62,
  memory: 74,
  disk: 45,
  network: 38,
};

export const pipelineActivity = {
  running: 3,
  successful: 18,
  failed: 2,
  queued: 4,
};

export const cloudCostData = {
  current: 42580,
  estimated: 48200,
  previous: 45100,
  daily: 1420,
  trend: -5.2,
};

export const costByService = [
  { name: 'Compute', value: 18500 },
  { name: 'Storage', value: 8200 },
  { name: 'Database', value: 6800 },
  { name: 'Network', value: 4100 },
  { name: 'Kubernetes', value: 4980 },
];

export const costTrend = [
  { month: 'Mar', cost: 38200 },
  { month: 'Apr', cost: 40100 },
  { month: 'May', cost: 42800 },
  { month: 'Jun', cost: 41500 },
  { month: 'Jul', cost: 45100 },
  { month: 'Aug', cost: 42580 },
];

export const recentActivity = [
  { id: 1, type: 'deployment', message: 'Deployment completed for api-gateway v2.4.1', time: '2 min ago', status: 'success' },
  { id: 2, type: 'pipeline', message: 'Pipeline "frontend-build" started', time: '8 min ago', status: 'info' },
  { id: 3, type: 'infrastructure', message: 'EC2 instance i-0a8f3c provisioned in ap-south-1', time: '15 min ago', status: 'success' },
  { id: 4, type: 'alert', message: 'High CPU usage detected on prod-cluster', time: '22 min ago', status: 'warning' },
  { id: 5, type: 'cost', message: 'Cost threshold reached: 85% of monthly budget', time: '1 hr ago', status: 'warning' },
  { id: 6, type: 'deployment', message: 'Rollback completed for user-service v1.8.0', time: '2 hr ago', status: 'info' },
];

export const deployments = [
  { id: 'dep-001', project: 'api-gateway', environment: 'Production', version: 'v2.4.1', status: 'success', branch: 'main', deployedAt: '2026-08-13 10:30', deployedBy: 'Anuj M.' },
  { id: 'dep-002', project: 'frontend-app', environment: 'Staging', version: 'v3.1.0', status: 'success', branch: 'develop', deployedAt: '2026-08-13 09:15', deployedBy: 'Anuj M.' },
  { id: 'dep-003', project: 'user-service', environment: 'Production', version: 'v1.9.2', status: 'deploying', branch: 'release/1.9', deployedAt: '2026-08-13 11:00', deployedBy: 'Anuj M.' },
  { id: 'dep-004', project: 'payment-api', environment: 'Development', version: 'v0.8.5', status: 'failed', branch: 'feature/payments', deployedAt: '2026-08-12 16:45', deployedBy: 'Anuj M.' },
];

export const deploymentEnvironments = [
  { id: 'dev', name: 'Development', status: 'healthy', deployments: 8, url: 'dev.nexuscloud.io', lastDeploy: '2 hrs ago' },
  { id: 'staging', name: 'Staging', status: 'healthy', deployments: 12, url: 'staging.nexuscloud.io', lastDeploy: '45 min ago' },
  { id: 'prod', name: 'Production', status: 'healthy', deployments: 24, url: 'app.nexuscloud.io', lastDeploy: '15 min ago' },
];

export const releases = [
  { id: 'rel-001', version: 'v2.4.1', project: 'api-gateway', date: '2026-08-13', notes: 'Performance improvements, bug fixes', status: 'released' },
  { id: 'rel-002', version: 'v3.1.0', project: 'frontend-app', date: '2026-08-12', notes: 'New dashboard UI, auth improvements', status: 'released' },
  { id: 'rel-003', version: 'v1.9.2', project: 'user-service', date: '2026-08-13', notes: 'OAuth2 integration', status: 'pending' },
  { id: 'rel-004', version: 'v0.8.5', project: 'payment-api', date: '2026-08-11', notes: 'Stripe webhook support', status: 'released' },
];

export const rollbackVersions = [
  { id: 'rb-001', project: 'api-gateway', current: 'v2.4.1', previous: 'v2.4.0', environment: 'Production', date: '2026-08-13' },
  { id: 'rb-002', project: 'user-service', current: 'v1.9.2', previous: 'v1.9.1', environment: 'Production', date: '2026-08-12' },
  { id: 'rb-003', project: 'frontend-app', current: 'v3.1.0', previous: 'v3.0.8', environment: 'Staging', date: '2026-08-11' },
];

export const pipelines = [
  {
    id: 'pipe-001',
    name: 'Frontend CI/CD',
    status: 'success',
    lastRun: '2026-08-13 10:00',
    duration: '4m 32s',
    stages: [
      { name: 'GitHub', status: 'success', duration: '12s' },
      { name: 'Build', status: 'success', duration: '1m 45s' },
      { name: 'Test', status: 'success', duration: '58s' },
      { name: 'Docker', status: 'success', duration: '45s' },
      { name: 'Deploy', status: 'success', duration: '52s' },
      { name: 'Kubernetes', status: 'success', duration: '40s' },
    ],
  },
  {
    id: 'pipe-002',
    name: 'API Gateway Pipeline',
    status: 'running',
    lastRun: '2026-08-13 11:00',
    duration: '2m 15s',
    stages: [
      { name: 'GitHub', status: 'success', duration: '10s' },
      { name: 'Build', status: 'success', duration: '55s' },
      { name: 'Test', status: 'running', duration: '—' },
      { name: 'Docker', status: 'queued', duration: '—' },
      { name: 'Deploy', status: 'queued', duration: '—' },
      { name: 'Kubernetes', status: 'queued', duration: '—' },
    ],
  },
  {
    id: 'pipe-003',
    name: 'Infrastructure Deploy',
    status: 'failed',
    lastRun: '2026-08-12 18:30',
    duration: '6m 10s',
    stages: [
      { name: 'GitHub', status: 'success', duration: '8s' },
      { name: 'Build', status: 'success', duration: '2m 10s' },
      { name: 'Test', status: 'failed', duration: '1m 20s' },
      { name: 'Docker', status: 'skipped', duration: '—' },
      { name: 'Deploy', status: 'skipped', duration: '—' },
      { name: 'Kubernetes', status: 'skipped', duration: '—' },
    ],
  },
];

export const pipelineRuns = [
  { id: 'run-001', pipeline: 'Frontend CI/CD', status: 'success', branch: 'main', commit: 'a3f2b1c', duration: '4m 32s', date: '2026-08-13 10:00' },
  { id: 'run-002', pipeline: 'API Gateway Pipeline', status: 'running', branch: 'release/2.4', commit: 'd7e4f9a', duration: '2m 15s', date: '2026-08-13 11:00' },
  { id: 'run-003', pipeline: 'Infrastructure Deploy', status: 'failed', branch: 'infra/update', commit: 'b2c8d1e', duration: '6m 10s', date: '2026-08-12 18:30' },
  { id: 'run-004', pipeline: 'Frontend CI/CD', status: 'success', branch: 'develop', commit: 'f1a9c3b', duration: '3m 58s', date: '2026-08-12 14:20' },
];

export const buildHistory = [
  { id: 'build-1847', commit: 'a3f2b1c', branch: 'main', status: 'success', duration: '4m 32s', date: '2026-08-13 10:00' },
  { id: 'build-1846', commit: 'd7e4f9a', branch: 'release/2.4', status: 'running', duration: '2m 15s', date: '2026-08-13 11:00' },
  { id: 'build-1845', commit: 'b2c8d1e', branch: 'infra/update', status: 'failed', duration: '6m 10s', date: '2026-08-12 18:30' },
  { id: 'build-1844', commit: 'f1a9c3b', branch: 'develop', status: 'success', duration: '3m 58s', date: '2026-08-12 14:20' },
  { id: 'build-1843', commit: 'e5d2a7f', branch: 'main', status: 'success', duration: '4m 01s', date: '2026-08-11 16:45' },
];

export const infrastructureResources = [
  { id: 'res-001', name: 'prod-api-server', type: 'EC2', status: 'running', region: 'ap-south-1', cpu: 45, memory: 62, cost: 4200 },
  { id: 'res-002', name: 'k8s-prod-cluster', type: 'Kubernetes', status: 'running', region: 'ap-south-1', cpu: 58, memory: 71, cost: 8500 },
  { id: 'res-003', name: 'api-gateway-container', type: 'Docker', status: 'running', region: 'ap-south-1', cpu: 22, memory: 38, cost: 1800 },
  { id: 'res-004', name: 'main-vpc', type: 'VPC', status: 'active', region: 'ap-south-1', cpu: 0, memory: 0, cost: 500 },
  { id: 'res-005', name: 'prod-alb', type: 'Load Balancer', status: 'active', region: 'ap-south-1', cpu: 15, memory: 0, cost: 2200 },
  { id: 'res-006', name: 'postgres-primary', type: 'Database', status: 'running', region: 'ap-south-1', cpu: 35, memory: 55, cost: 6800 },
];

export const terraformConfigs = [
  { id: 'tf-001', name: 'vpc-network', status: 'applied', lastPlan: '2026-08-12', resources: 12 },
  { id: 'tf-002', name: 'k8s-cluster', status: 'applied', lastPlan: '2026-08-11', resources: 28 },
  { id: 'tf-003', name: 'rds-database', status: 'pending', lastPlan: '2026-08-13', resources: 8 },
];

export const kubernetesData = {
  clusters: [
    { name: 'prod-cluster', nodes: 6, pods: 48, services: 12, status: 'healthy' },
    { name: 'staging-cluster', nodes: 3, pods: 22, services: 8, status: 'healthy' },
  ],
  nodes: [
    { name: 'node-1', status: 'ready', cpu: 62, memory: 74, pods: 8 },
    { name: 'node-2', status: 'ready', cpu: 55, memory: 68, pods: 7 },
    { name: 'node-3', status: 'ready', cpu: 48, memory: 61, pods: 9 },
  ],
};

export const infraEnvironments = [
  { name: 'Development', resources: 8, status: 'healthy', cost: 8200 },
  { name: 'Staging', resources: 14, status: 'healthy', cost: 15800 },
  { name: 'Production', resources: 22, status: 'healthy', cost: 18580 },
];

export const monitoringMetrics = {
  system: { cpu: 62, memory: 74, disk: 45, network: 38, uptime: 99.97 },
  application: { requests: 12400, errorRate: 0.12, responseTime: 142, throughput: 850 },
};

export const metricCharts = {
  cpu: [
    { time: '00:00', value: 45 }, { time: '04:00', value: 38 }, { time: '08:00', value: 62 },
    { time: '12:00', value: 71 }, { time: '16:00', value: 58 }, { time: '20:00', value: 52 },
  ],
  memory: [
    { time: '00:00', value: 60 }, { time: '04:00', value: 55 }, { time: '08:00', value: 68 },
    { time: '12:00', value: 74 }, { time: '16:00', value: 70 }, { time: '20:00', value: 65 },
  ],
  network: [
    { time: '00:00', value: 20 }, { time: '04:00', value: 15 }, { time: '08:00', value: 35 },
    { time: '12:00', value: 42 }, { time: '16:00', value: 38 }, { time: '20:00', value: 30 },
  ],
  disk: [
    { time: '00:00', value: 40 }, { time: '04:00', value: 41 }, { time: '08:00', value: 43 },
    { time: '12:00', value: 44 }, { time: '16:00', value: 45 }, { time: '20:00', value: 45 },
  ],
};

export const logs = [
  { id: 1, timestamp: '2026-08-13 11:02:15', service: 'api-gateway', level: 'INFO', message: 'Request processed successfully — GET /api/v1/users' },
  { id: 2, timestamp: '2026-08-13 11:02:10', service: 'user-service', level: 'WARNING', message: 'Connection pool nearing capacity (85%)' },
  { id: 3, timestamp: '2026-08-13 11:01:55', service: 'payment-api', level: 'ERROR', message: 'Payment gateway timeout — retry attempt 2/3' },
  { id: 4, timestamp: '2026-08-13 11:01:40', service: 'k8s-prod-cluster', level: 'INFO', message: 'Pod frontend-app-7d4f scaled to 3 replicas' },
  { id: 5, timestamp: '2026-08-13 11:01:22', service: 'api-gateway', level: 'INFO', message: 'Health check passed — all endpoints responsive' },
  { id: 6, timestamp: '2026-08-13 11:00:58', service: 'postgres-primary', level: 'WARNING', message: 'Slow query detected — duration 2.4s' },
  { id: 7, timestamp: '2026-08-13 11:00:30', service: 'frontend-app', level: 'ERROR', message: 'Uncaught TypeError in dashboard component' },
];

export const alerts = [
  { id: 'alert-001', severity: 'critical', service: 'prod-cluster', message: 'High CPU usage detected', time: '22 min ago', status: 'active' },
  { id: 'alert-002', severity: 'warning', service: 'k8s-prod-cluster', message: 'Pod restart detected', time: '45 min ago', status: 'active' },
  { id: 'alert-003', severity: 'warning', service: 'api-gateway', message: 'API response time increased', time: '1 hr ago', status: 'active' },
  { id: 'alert-004', severity: 'info', service: 'payment-api', message: 'Scheduled maintenance in 2 hours', time: '2 hr ago', status: 'acknowledged' },
];

export const healthChecks = [
  { name: 'Applications', status: 'healthy', uptime: 99.98, items: 8 },
  { name: 'Servers', status: 'healthy', uptime: 99.95, items: 6 },
  { name: 'Containers', status: 'warning', uptime: 99.82, items: 48 },
  { name: 'Kubernetes', status: 'healthy', uptime: 99.97, items: 2 },
  { name: 'APIs', status: 'healthy', uptime: 99.99, items: 12 },
];

export const costPricing = {
  providers: {
    aws: { compute: { small: 3500, medium: 7200, large: 14500 }, storage: 800, database: 4500, network: 1200 },
    gcp: { compute: { small: 3200, medium: 6800, large: 13800 }, storage: 750, database: 4200, network: 1100 },
    azure: { compute: { small: 3400, medium: 7000, large: 14200 }, storage: 780, database: 4400, network: 1150 },
  },
  regions: { 'ap-south-1': 1.0, 'us-east-1': 0.95, 'eu-west-1': 1.05, 'ap-southeast-1': 1.02 },
};

export const optimizationRecommendations = [
  { id: 'opt-001', title: 'Stop unused EC2 instances', description: '3 instances idle for 30+ days', savings: 8400, priority: 'high' },
  { id: 'opt-002', title: 'Reduce oversized resources', description: '2 instances running at <20% CPU', savings: 5200, priority: 'medium' },
  { id: 'opt-003', title: 'Remove unused storage volumes', description: '5 unattached EBS volumes detected', savings: 2100, priority: 'medium' },
  { id: 'opt-004', title: 'Optimize Kubernetes workloads', description: 'Right-size 8 over-provisioned pods', savings: 3800, priority: 'low' },
];

export const landingServices = [
  { id: 'deployment', name: 'Deployment', description: 'Automated deployments across environments with rollback support', icon: '🚀', status: 'operational', route: '/deployment' },
  { id: 'pipelines', name: 'Pipelines', description: 'CI/CD pipeline orchestration with visual workflow stages', icon: '⚡', status: 'operational', route: '/pipelines' },
  { id: 'infrastructure', name: 'Infrastructure', description: 'Cloud resource management with Terraform and Kubernetes', icon: '🏗️', status: 'operational', route: '/infrastructure' },
  { id: 'monitoring', name: 'Monitoring', description: 'Real-time metrics, logs, alerts and health monitoring', icon: '📊', status: 'operational', route: '/monitoring' },
  { id: 'cost', name: 'Cost Estimation', description: 'Cloud cost tracking, budgeting and optimization insights', icon: '💰', status: 'operational', route: '/cost' },
];

export const projects = ['api-gateway', 'frontend-app', 'user-service', 'payment-api', 'notification-service'];
export const branches = ['main', 'develop', 'release/2.4', 'feature/auth', 'hotfix/security'];
export const environments = ['Development', 'Staging', 'Production'];
export const regions = ['ap-south-1', 'us-east-1', 'eu-west-1', 'ap-southeast-1'];
export const instanceSizes = ['small', 'medium', 'large'];
export const resourceTypes = ['EC2', 'Kubernetes', 'Docker', 'VPC', 'Load Balancer', 'Database'];
