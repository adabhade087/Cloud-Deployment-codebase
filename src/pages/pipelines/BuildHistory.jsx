import StatusBadge from '../../components/StatusBadge';
import { buildHistory } from '../../data/mockData';

export default function BuildHistory() {
  return (
    <div>
      <h2 className="section-title">Build History</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Build ID</th><th>Commit</th><th>Branch</th><th>Status</th><th>Duration</th><th>Date</th></tr>
          </thead>
          <tbody>
            {buildHistory.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.id}</td>
                <td><code style={{ fontSize: 12 }}>{b.commit}</code></td>
                <td>{b.branch}</td>
                <td><StatusBadge status={b.status} /></td>
                <td>{b.duration}</td>
                <td>{b.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
