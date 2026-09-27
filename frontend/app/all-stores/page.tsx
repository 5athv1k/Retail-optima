'use client';
import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:8000';

interface StoreResult {
  store: number;
  forecasted_demand: number;
  current_price: number;
  recommended_price: number;
  expected_revenue: number;
}

export default function AllStores() {
  const [results, setResults] = useState<StoreResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/forecast-all`)
      .then(res => res.json())
      .then(data => {
        setResults(data.results);
        setLoading(false);
      });
  }, []);

  const filtered = results.filter(r => r.store.toString().includes(search));

  if (loading) return <p className="text-sm text-stone-500">Loading all stores…</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Forecasting
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Store Explorer
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '4px' }}>
          Forecasted demand and optimal pricing across all 50 Rossmann stores.
        </p>
      </div>

      {/* Info banner */}
      <div style={{ border: '1px solid rgba(128,128,128,0.2)', borderRadius: '8px', padding: '12px 16px', fontSize: '12px', opacity: 0.6, marginBottom: '32px', display: 'flex', gap: '10px' }}>
        <span>ℹ</span>
        <span><strong>What you&apos;re seeing:</strong> Each row is a live forecast + price optimization run for that store. Revenue figures assume the recommended price is applied. Search by store number using the box.</span>
      </div>

      <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs uppercase tracking-wider text-stone-500">All Stores ({filtered.length})</div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search store #"
          className="border-b border-stone-400 bg-transparent text-sm py-1 px-1"
        />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-stone-500 border-b border-stone-300">
            <th className="py-2 font-normal">Store</th>
            <th className="py-2 font-normal">Demand</th>
            <th className="py-2 font-normal">Current</th>
            <th className="py-2 font-normal">Recommended</th>
            <th className="py-2 font-normal">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.store} className="border-b border-stone-200">
              <td className="py-2">{r.store}</td>
              <td className="py-2">{r.forecasted_demand.toLocaleString()}</td>
              <td className="py-2">₹{r.current_price}</td>
              <td className="py-2 text-emerald-700 font-medium">₹{r.recommended_price}</td>
              <td className="py-2">₹{r.expected_revenue.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}