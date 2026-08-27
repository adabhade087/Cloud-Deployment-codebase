import { useState } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { rollbackVersions as initialRollbacks } from '../../data/mockData';
import { api } from '../../services/api';

export default function RollbacksTab() {
  const [rollbacks, setRollbacks] = useState(initialRollbacks);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const openRollback = (item) => {
    setSelected(item);
    setModalOpen(true);
  };

  const confirmRollback = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.rollback(selected.project, selected.previous);
      setRollbacks((prev) =>
        prev.map((r) =>
          r.id === selected.id ? { ...r, current: selected.previous, status: 'rolled back' } : r
        )
      );
      setMessage(`Successfully rolled back ${selected.project} to ${selected.previous}`);
      setModalOpen(false);
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">Rollback Management</h2>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Project</th><th>Current</th><th>Previous</th><th>Environment</th><th>Date</th><th>Action</th></tr>
          </thead>
          <tbody>
            {rollbacks.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.project}</td>
                <td>{r.current}</td>
                <td>{r.previous}</td>
                <td>{r.environment}</td>
                <td>{r.date}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => openRollback(r)}>Rollback</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Confirm Rollback" size="sm">
        {selected && (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              Roll back <strong>{selected.project}</strong> from <strong>{selected.current}</strong> to <strong>{selected.previous}</strong> in {selected.environment}?
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmRollback} disabled={loading}>
                {loading ? <><div className="spinner" /> Rolling back...</> : 'Confirm Rollback'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
