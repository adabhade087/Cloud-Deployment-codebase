const statusMap = {
  success: 'badge-success',
  healthy: 'badge-success',
  running: 'badge-info',
  active: 'badge-info',
  deploying: 'badge-info',
  provisioning: 'badge-info',
  creating: 'badge-info',
  warning: 'badge-warning',
  queued: 'badge-warning',
  pending: 'badge-warning',
  failed: 'badge-error',
  error: 'badge-error',
  critical: 'badge-error',
  skipped: 'badge-neutral',
  acknowledged: 'badge-neutral',
  released: 'badge-success',
  operational: 'badge-success',
  ready: 'badge-success',
  info: 'badge-info',
  normal: 'badge-neutral',
};

export default function StatusBadge({ status, dot = true }) {
  const cls = statusMap[status?.toLowerCase()] || 'badge-neutral';
  return (
    <span className={`badge badge-dot ${cls}`}>
      {status}
    </span>
  );
}
