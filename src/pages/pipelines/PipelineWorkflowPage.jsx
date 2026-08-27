import PipelineWorkflow from '../../components/PipelineWorkflow';
import { pipelines } from '../../data/mockData';

export default function PipelineWorkflowPage() {
  return (
    <div>
      <h2 className="section-title">Pipeline Workflows</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {pipelines.map((pipe) => (
          <div key={pipe.id} className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>{pipe.name}</h3>
            <PipelineWorkflow stages={pipe.stages} animated />
          </div>
        ))}
      </div>
    </div>
  );
}
