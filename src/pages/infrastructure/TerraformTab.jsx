import { useState } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import { terraformConfigs } from '../../data/mockData';
import { api } from '../../services/api';

export default function TerraformTab() {
  const [configs, setConfigs] = useState(terraformConfigs);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  const runPlan = async (config) => {
    setSelectedConfig(config);
    setModalTitle(`Terraform Plan — ${config.name}`);
    setLoading(true);
    setModalOpen(true);
    setOutput('Running terraform plan...');
    try {
      const result = await api.terraformPlan(config.name);
      setOutput(result.output);
    } finally {
      setLoading(false);
    }
  };

  const runApply = async (config) => {
    setSelectedConfig(config);
    setModalTitle(`Terraform Apply — ${config.name}`);
    setLoading(true);
    setModalOpen(true);
    setOutput('Applying terraform configuration...');
    try {
      const result = await api.terraformApply(config.name);
      setOutput(result.message);
      setConfigs((prev) =>
        prev.map((c) => (c.name === config.name ? { ...c, status: 'applied' } : c))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">Terraform Configurations</h2>
      <div className="grid-auto">
        {configs.map((c) => (
          <div key={c.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16 }}>{c.name}</h3>
              <StatusBadge status={c.status} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              {c.resources} resources · Last plan: {c.lastPlan}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => runPlan(c)}>Plan</button>
              <button className="btn btn-primary btn-sm" onClick={() => runApply(c)}>Apply</button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle} size="lg">
        {loading ? (
          <div className="loading-overlay"><div className="spinner spinner-lg" /><span>Processing...</span></div>
        ) : (
          <pre style={{ background: 'var(--bg-primary)', padding: 16, borderRadius: 8, fontSize: 13, color: 'var(--accent-green)', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {output}
          </pre>
        )}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Close</button>
        </div>
      </Modal>
    </div>
  );
}
