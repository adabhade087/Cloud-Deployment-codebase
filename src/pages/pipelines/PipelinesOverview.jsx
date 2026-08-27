import { useState } from 'react';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import PipelineWorkflow from '../../components/PipelineWorkflow';
import { pipelines as initialPipelines } from '../../data/mockData';
import { api } from '../../services/api';

const STAGE_NAMES = ['GitHub', 'Build', 'Test', 'Docker', 'Deploy', 'Kubernetes'];

export default function PipelinesOverview() {
  const [pipelineList, setPipelineList] = useState(initialPipelines);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPipe, setSelectedPipe] = useState(null);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');

  const openRun = (pipe) => {
    setSelectedPipe(pipe);
    setModalOpen(true);
  };

  const runPipeline = async () => {
    if (!selectedPipe) return;
    setRunning(true);
    setModalOpen(false);

    const stages = STAGE_NAMES.map((name) => ({ name, status: 'queued', duration: '—' }));
    setPipelineList((prev) =>
      prev.map((p) =>
        p.id === selectedPipe.id ? { ...p, status: 'running', stages } : p
      )
    );

    for (let i = 0; i < STAGE_NAMES.length; i++) {
      setPipelineList((prev) =>
        prev.map((p) => {
          if (p.id !== selectedPipe.id) return p;
          const newStages = p.stages.map((s, idx) => {
            if (idx < i) return { ...s, status: 'success', duration: `${Math.floor(Math.random() * 60 + 10)}s` };
            if (idx === i) return { ...s, status: 'running' };
            return s;
          });
          return { ...p, stages: newStages };
        })
      );
      await api.advancePipelineStage(i);
    }

    setPipelineList((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPipe.id) return p;
        return {
          ...p,
          status: 'success',
          stages: p.stages.map((s) => ({ ...s, status: 'success', duration: s.duration === '—' ? `${Math.floor(Math.random() * 60 + 10)}s` : s.duration })),
        };
      })
    );

    setMessage('Pipeline completed successfully!');
    setRunning(false);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div>
      <div className="tab-header">
        <div>
          <h2 className="section-title">All Pipelines</h2>
          <p className="page-subtitle">Manage CI/CD pipeline workflows</p>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {pipelineList.map((pipe) => (
          <div key={pipe.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, marginBottom: 4 }}>{pipe.name}</h3>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Last run: {pipe.lastRun} · {pipe.duration}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <StatusBadge status={pipe.status} />
                <button className="btn btn-primary btn-sm" onClick={() => openRun(pipe)} disabled={running}>
                  Run Pipeline
                </button>
              </div>
            </div>
            <PipelineWorkflow stages={pipe.stages} animated />
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Run Pipeline" size="sm">
        {selectedPipe && (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              Run pipeline <strong>{selectedPipe.name}</strong>?
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={runPipeline}>Run</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
