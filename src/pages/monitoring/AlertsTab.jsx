import { useState } from 'react';
import StatusBadge from '../../components/StatusBadge';
import { alerts as initialAlerts } from '../../data/mockData';
import { api } from '../../services/api';

export default function AlertsTab() {
  const [alertList, setAlertList] = useState(initialAlerts);
  const [loading, setLoading] = useState(null);

  const acknowledge = async (alert) => {
    setLoading(alert.id);
    try {
      await api.acknowledgeAlert(alert.id);
      setAlertList((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, status: 'acknowledged' } : a))
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <h2 className="section-title">Active Alerts</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {alertList.map((a) => (
          <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
            <StatusBadge status={a.severity} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{a.message}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{a.service} · {a.time}</div>
            </div>
            <StatusBadge status={a.status} />
            {a.status === 'active' && (
              <button className="btn btn-secondary btn-sm" onClick={() => acknowledge(a)} disabled={loading === a.id}>
                {loading === a.id ? <div className="spinner" /> : 'Acknowledge'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
