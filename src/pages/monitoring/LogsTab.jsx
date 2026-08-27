import { logs } from '../../data/mockData';

const levelColors = { INFO: 'badge-info', WARNING: 'badge-warning', ERROR: 'badge-error' };

export default function LogsTab() {
  return (
    <div>
      <h2 className="section-title">Log Viewer</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Timestamp</th><th>Service</th><th>Level</th><th>Message</th></tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{log.timestamp}</td>
                <td>{log.service}</td>
                <td><span className={`badge ${levelColors[log.level]}`}>{log.level}</span></td>
                <td>{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
