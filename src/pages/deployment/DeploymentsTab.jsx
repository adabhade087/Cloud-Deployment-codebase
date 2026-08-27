import { useState } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { deployments as initialDeployments, projects, branches, environments } from '../../data/mockData';
import { api } from '../../services/api';

export default function DeploymentsTab() {
  const [deployList, setDeployList] = useState(initialDeployments);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ project: projects[0], branch: branches[0], environment: environments[0], version: 'v1.0.0' });

  const handleDeploy = async () => {
    setLoading(true);
    setSuccess('');
    const deploying = {
      id: `dep-${Date.now()}`,
      project: form.project,
      environment: form.environment,
      version: form.version,
      branch: form.branch,
      status: 'deploying',
      deployedAt: new Date().toLocaleString(),
      deployedBy: 'Anuj M.',
    };
    setDeployList((prev) => [deploying, ...prev]);
    setModalOpen(false);

    try {
      const result = await api.deploy(form);
      setDeployList((prev) =>
        prev.map((d) => (d.id === deploying.id ? { ...result.deployment, id: deploying.id } : d))
      );
      setSuccess('Deployment successful!');
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setDeployList((prev) =>
        prev.map((d) => (d.id === deploying.id ? { ...d, status: 'failed' } : d))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="tab-header">
        <div>
          <h2 className="section-title">Current Deployments</h2>
          <p className="page-subtitle">Manage and monitor your application deployments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Deploy Now</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Environment</th>
              <th>Version</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Deployed At</th>
              <th>By</th>
            </tr>
          </thead>
          <tbody>
            {deployList.map((d) => (
              <tr key={d.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.project}</td>
                <td>{d.environment}</td>
                <td>{d.version}</td>
                <td>{d.branch}</td>
                <td><StatusBadge status={d.status} /></td>
                <td>{d.deployedAt}</td>
                <td>{d.deployedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Deploy Configuration">
        <div className="form-group">
          <label className="form-label">Project</label>
          <select className="form-input form-select" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>
            {projects.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Branch</label>
          <select className="form-input form-select" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
            {branches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Environment</label>
          <select className="form-input form-select" value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })}>
            {environments.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Version</label>
          <input className="form-input" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleDeploy} disabled={loading}>
            {loading ? <><div className="spinner" /> Deploying...</> : 'Confirm Deployment'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
