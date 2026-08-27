import StatusBadge from '../../components/StatusBadge';
import { releases } from '../../data/mockData';

export default function ReleasesTab() {
  return (
    <div>
      <h2 className="section-title">Release History</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Version</th><th>Project</th><th>Date</th><th>Notes</th><th>Status</th></tr>
          </thead>
          <tbody>
            {releases.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.version}</td>
                <td>{r.project}</td>
                <td>{r.date}</td>
                <td>{r.notes}</td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
