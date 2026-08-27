import ServiceLayout from '../../components/ServiceLayout';

const tabs = [
  { path: '/monitoring/metrics', label: 'Metrics' },
  { path: '/monitoring/logs', label: 'Logs' },
  { path: '/monitoring/alerts', label: 'Alerts' },
  { path: '/monitoring/health', label: 'Health' },
];

export default function MonitoringLayout() {
  return (
    <ServiceLayout
      serviceName="Monitoring"
      tabs={tabs}
      breadcrumbBase={[{ label: 'Home', path: '/dashboard' }, { label: 'Monitoring' }]}
    />
  );
}
