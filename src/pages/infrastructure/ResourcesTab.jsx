import { useState } from 'react';
import Modal from '../../components/Modal';
import ResourceCard from '../../components/ResourceCard';
import { infrastructureResources as initialResources, resourceTypes, regions, instanceSizes, environments } from '../../data/mockData';
import { api } from '../../services/api';

export default function ResourcesTab() {
  const [resources, setResources] = useState(initialResources);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    type: resourceTypes[0], region: regions[0], instanceSize: instanceSizes[1], environment: environments[0],
  });

  const handleProvision = async () => {
    setLoading(true);
    setModalOpen(false);
    setMessage('Creating resource...');

    const temp = {
      id: `res-temp-${Date.now()}`,
      name: 'provisioning...',
      type: form.type,
      status: 'provisioning',
      region: form.region,
      cpu: 0,
      memory: 0,
      cost: 0,
    };
    setResources((prev) => [temp, ...prev]);

    try {
      const result = await api.provisionInfrastructure(form);
      setResources((prev) =>
        prev.map((r) => (r.id === temp.id ? result.resource : r))
      );
      setMessage('Resource provisioned successfully!');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="tab-header">
        <div>
          <h2 className="section-title">Cloud Resources</h2>
          <p className="page-subtitle">Manage EC2, Kubernetes, Docker, and more</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>Provision Infrastructure</button>
      </div>

      {message && <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-info'}`}>{message}</div>}

      <div className="grid-auto">
        {resources.map((r) => (
          <ResourceCard key={r.id} resource={r} />
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Provision Infrastructure">
        <div className="form-group">
          <label className="form-label">Resource Type</label>
          <select className="form-input form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {resourceTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Region</label>
          <select className="form-input form-select" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Instance Size</label>
          <select className="form-input form-select" value={form.instanceSize} onChange={(e) => setForm({ ...form, instanceSize: e.target.value })}>
            {instanceSizes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Environment</label>
          <select className="form-input form-select" value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })}>
            {environments.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleProvision} disabled={loading}>
            {loading ? <><div className="spinner" /> Provisioning...</> : 'Provision'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
