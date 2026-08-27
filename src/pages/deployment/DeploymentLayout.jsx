import ServiceLayout from '../../components/ServiceLayout';

const tabs = [
  { path: '/deployment/deployments', label: 'Deployments' },
  { path: '/deployment/environments', label: 'Environments' },
  { path: '/deployment/releases', label: 'Releases' },
  { path: '/deployment/rollbacks', label: 'Rollbacks' },
];

const breadcrumb = [
  { label: 'Home', path: '/dashboard' },
  { label: 'Deployment' },
];

export default function DeploymentLayout() {
  return (
    <ServiceLayout serviceName="Deployment" tabs={tabs} breadcrumbBase={breadcrumb} />
  );
}
