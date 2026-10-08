import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import {
  projects,
  branches,
  environments
} from '../../data/mockData';
import { api } from '../../services/api';

export default function DeploymentsTab() {
  const [deployList, setDeployList] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ project: '', branch: branches[0], environment: environments[0], version: 'v1.0.0' });

  useEffect(() => {
  const loadDeployments = async () => {
    try {
      const result = await api.getDeployments();
      setDeployList(result.deployments || []);
    } catch (error) {
      console.error("Failed to load deployments:", error);
    }
  };

  loadDeployments();
}, []);

   useEffect(() => {
   const loadRepositories = async () => {
    try {
      const data = await api.getRepositories();

      const repos = Array.isArray(data.repositories)
        ? data.repositories
        : Array.isArray(data.data)
        ? data.data
        : [];

      setRepositories(repos);
    } catch (error) {
      console.error("Failed to load repositories:", error);
    }
  };

  loadRepositories();
}, []);

   useEffect(() => {
  if (repositories.length > 0 && !form.project) {
    setForm((prev) => ({
      ...prev,
      project: repositories[0].url,
    }));
  }
}, [repositories, form.project]);

  const handleDeploy = async () => {
  setLoading(true);
  setSuccess('');

  try {
    const result = await api.deploy(form);

    setDeployList((prev) => [
      result.deployment,
      ...prev,
    ]);

    setModalOpen(false);

    setSuccess(
      result.message || 'Deployment queued successfully!'
    );

    setTimeout(() => setSuccess(''), 4000);
  } catch (error) {
    console.error('Deployment failed:', error);
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
           {repositories.map((repo) => {
              const parts = repo.url?.split("/").filter(Boolean) || [];
              const name = (parts[parts.length - 1] || "Repository").replace(/\.git$/i, "");

              return (
             <option key={repo.id} value={repo.url}>
               {name}
             </option>
             );
           })}
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
