import ServiceLayout from '../../components/ServiceLayout';

const tabs = [
  { path: '/cost/overview', label: 'Cost Overview' },
  { path: '/cost/estimator', label: 'Cost Estimator' },
  { path: '/cost/budget', label: 'Budget' },
  { path: '/cost/optimization', label: 'Optimization' },
];

export default function CostLayout() {
  return (
    <ServiceLayout
      serviceName="Cost Estimation"
      tabs={tabs}
      breadcrumbBase={[{ label: 'Home', path: '/dashboard' }, { label: 'Cost Estimation' }]}
    />
  );
}
