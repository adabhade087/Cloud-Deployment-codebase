import { useState } from 'react';
import { regions } from '../../data/mockData';
import { api } from '../../services/api';

export default function CostEstimator() {
  const [form, setForm] = useState({
    provider: 'aws',
    region: regions[0],
    instanceSize: 'medium',
    compute: true,
    storage: true,
    database: false,
    network: true,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = () => {
    setLoading(true);
    setTimeout(() => {
      const cost = api.calculateCost(form);
      setResult(cost);
      setLoading(false);
    }, 800);
  };

  return (
    <div>
      <h2 className="section-title">Cost Estimator</h2>
      <div className="grid-2">
        <div className="card">
          <div className="form-group">
            <label className="form-label">Cloud Provider</label>
            <select className="form-input form-select" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}>
              <option value="aws">AWS</option>
              <option value="gcp">Google Cloud</option>
              <option value="azure">Azure</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Region</label>
            <select className="form-input form-select" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Compute Instance Size</label>
            <select className="form-input form-select" value={form.instanceSize} onChange={(e) => setForm({ ...form, instanceSize: e.target.value })}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Resources</label>
            {['compute', 'storage', 'database', 'network'].map((key) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
            ))}
          </div>
          <button className="btn btn-primary" onClick={calculate} disabled={loading} style={{ width: '100%' }}>
            {loading ? <><div className="spinner" /> Calculating...</> : 'Calculate Cost'}
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          {result !== null ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>Estimated Monthly Cost</div>
              <div style={{ fontSize: 48, fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ₹{result.toLocaleString()}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12 }}>
                {form.provider.toUpperCase()} · {form.region}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
              <p>Configure resources and click Calculate Cost</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
