import StatusBadge from '../../components/StatusBadge';
import { pipelineRuns } from '../../data/mockData';

export default function PipelineRuns() {
  return (
    <div>
      <h2 className="section-title">Pipeline Runs</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Pipeline</th><th>Status</th><th>Branch</th><th>Commit</th><th>Duration</th><th>Date</th></tr>
          </thead>
          <tbody>
            {pipelineRuns.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.pipeline}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>{r.branch}</td>
                <td><code style={{ fontSize: 12 }}>{r.commit}</code></td>
                <td>{r.duration}</td>
                <td>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
