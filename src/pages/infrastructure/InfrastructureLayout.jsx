import ServiceLayout from '../../components/ServiceLayout';

const tabs = [
  { path: '/infrastructure/resources', label: 'Resources' },
  { path: '/infrastructure/terraform', label: 'Terraform' },
  { path: '/infrastructure/kubernetes', label: 'Kubernetes' },
  { path: '/infrastructure/environments', label: 'Environments' },
];

export default function InfrastructureLayout() {
  return (
    <ServiceLayout
      serviceName="Infrastructure"
      tabs={tabs}
      breadcrumbBase={[{ label: 'Home', path: '/dashboard' }, { label: 'Infrastructure' }]}
    />
  );
}
