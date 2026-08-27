import ServiceLayout from '../../components/ServiceLayout';

const tabs = [
  { path: '/pipelines', label: 'Pipeline Overview', end: true },
  { path: '/pipelines/runs', label: 'Pipeline Runs' },
  { path: '/pipelines/workflow', label: 'Workflow' },
  { path: '/pipelines/builds', label: 'Build History' },
];

export default function PipelinesLayout() {
  return (
    <ServiceLayout
      serviceName="Pipelines"
      tabs={tabs}
      breadcrumbBase={[{ label: 'Home', path: '/dashboard' }, { label: 'Pipelines' }]}
    />
  );
}
