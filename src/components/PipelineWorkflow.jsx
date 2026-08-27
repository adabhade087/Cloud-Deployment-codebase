import StatusBadge from './StatusBadge';
import './PipelineWorkflow.css';

export default function PipelineWorkflow({ stages, animated = false }) {
  return (
    <div className="pipeline-workflow">
      {stages.map((stage, i) => (
        <div key={i} className="pipeline-stage-wrapper">
          <div className={`pipeline-stage ${animated && stage.status === 'running' ? 'stage-running' : ''}`}>
            <div className={`stage-icon stage-${stage.status}`}>
              {stage.status === 'success' && '✓'}
              {stage.status === 'running' && <div className="spinner" />}
              {stage.status === 'failed' && '✕'}
              {stage.status === 'queued' && '○'}
              {stage.status === 'skipped' && '—'}
            </div>
            <div className="stage-info">
              <span className="stage-name">{stage.name}</span>
              <span className="stage-duration">{stage.duration}</span>
            </div>
            <StatusBadge status={stage.status} dot={false} />
          </div>
          {i < stages.length - 1 && (
            <div className={`stage-connector ${stage.status === 'success' ? 'connector-active' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}
