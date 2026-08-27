import { useState } from 'react';
import { cloudCostData } from '../../data/mockData';
import { api } from '../../services/api';

export default function BudgetTab() {
  const [budget, setBudget] = useState(50000);
  const [inputBudget, setInputBudget] = useState('50000');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const used = cloudCostData.current;
  const remaining = Math.max(budget - used, 0);
  const percentage = Math.min((used / budget) * 100, 100);

  const saveBudget = async () => {
    setLoading(true);
    try {
      await api.setBudget(Number(inputBudget));
      setBudget(Number(inputBudget));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">Budget Management</h2>

      {saved && <div className="alert alert-success">Budget updated successfully!</div>}

      <div className="grid-2">
        <div className="card">
          <div className="form-group">
            <label className="form-label">Monthly Budget (₹)</label>
            <input className="form-input" type="number" value={inputBudget} onChange={(e) => setInputBudget(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={saveBudget} disabled={loading}>
            {loading ? <><div className="spinner" /> Saving...</> : 'Set Budget'}
          </button>
        </div>

        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Budget Usage</span>
              <span style={{ fontWeight: 700 }}>{percentage.toFixed(1)}%</span>
            </div>
            <div style={{ height: 12, background: 'var(--bg-primary)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                width: `${percentage}%`,
                height: '100%',
                background: percentage > 85 ? 'var(--accent-red)' : percentage > 70 ? 'var(--accent-orange)' : 'var(--accent-green)',
                borderRadius: 6,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
          <div className="grid-3" style={{ gap: 16 }}>
            <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Budget</div><div style={{ fontSize: 20, fontWeight: 700 }}>₹{budget.toLocaleString()}</div></div>
            <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Used</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-orange)' }}>₹{used.toLocaleString()}</div></div>
            <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Remaining</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-green)' }}>₹{remaining.toLocaleString()}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
