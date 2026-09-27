'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, Store, DollarSign, BarChart2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

interface StoreResult {
  store: number;
  forecasted_demand: number;
  current_price: number;
  recommended_price: number;
  expected_revenue: number;
}

export default function Dashboard() {
  const [results, setResults] = useState<StoreResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/forecast-all`)
      .then((r) => r.json())
      .then((d) => {
        setResults(d.results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalStores = results.length;
  const avgDemand = results.length
    ? Math.round(results.reduce((s, r) => s + r.forecasted_demand, 0) / results.length)
    : 0;
  const totalRevenue = results.reduce((s, r) => s + r.expected_revenue, 0);
  const topStore = results.length
    ? results.reduce((a, b) => (a.expected_revenue > b.expected_revenue ? a : b))
    : null;

  const stats = [
    {
      icon: Store,
      label: 'Total Stores',
      value: loading ? '—' : totalStores.toString(),
      sub: 'Rossmann stores in dataset',
    },
    {
      icon: TrendingUp,
      label: 'Avg Forecasted Demand',
      value: loading ? '—' : avgDemand.toLocaleString(),
      sub: 'units per store (today)',
    },
    {
      icon: DollarSign,
      label: 'Total Expected Revenue',
      value: loading ? '—' : '₹' + (totalRevenue / 1_000_000).toFixed(1) + 'M',
      sub: 'across all stores at optimal price',
    },
    {
      icon: BarChart2,
      label: 'Top Store',
      value: loading ? '—' : topStore ? `Store ${topStore.store}` : '—',
      sub: loading || !topStore ? '' : `₹${topStore.expected_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} expected revenue`,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Overview
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '4px' }}>
          Live summary across all stores — powered by XGBoost forecasting and price optimization.
        </p>
      </div>

      {/* Info banner */}
      <div style={{
        border: '1px solid rgba(128,128,128,0.2)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '12px',
        opacity: 0.6,
        marginBottom: '32px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '14px' }}>ℹ</span>
        <span>
          <strong>What you&apos;re seeing:</strong> Demand is forecast per store using the trained XGBoost model.
          Revenue figures assume the optimizer&apos;s recommended price is applied. All numbers update live from the backend.
        </span>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              border: '1px solid rgba(128,128,128,0.18)',
              borderRadius: '10px',
              padding: '20px 22px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.45 }}>
              <s.icon size={15} />
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {s.label}
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Top 5 stores table */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>
          Top 5 Stores by Expected Revenue
        </div>
        {loading ? (
          <p style={{ fontSize: '13px', opacity: 0.4 }}>Loading…</p>
        ) : (
          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.2)', textAlign: 'left' }}>
                <th style={{ padding: '8px 0', fontWeight: 500, opacity: 0.45 }}>Store</th>
                <th style={{ padding: '8px 0', fontWeight: 500, opacity: 0.45 }}>Demand</th>
                <th style={{ padding: '8px 0', fontWeight: 500, opacity: 0.45 }}>Current Price</th>
                <th style={{ padding: '8px 0', fontWeight: 500, opacity: 0.45 }}>Recommended</th>
                <th style={{ padding: '8px 0', fontWeight: 500, opacity: 0.45 }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[...results]
                .sort((a, b) => b.expected_revenue - a.expected_revenue)
                .slice(0, 5)
                .map((r) => (
                  <tr key={r.store} style={{ borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
                    <td style={{ padding: '10px 0' }}>Store {r.store}</td>
                    <td style={{ padding: '10px 0' }}>{r.forecasted_demand.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td style={{ padding: '10px 0' }}>₹{r.current_price}</td>
                    <td style={{ padding: '10px 0', color: '#34d399', fontWeight: 600 }}>₹{r.recommended_price}</td>
                    <td style={{ padding: '10px 0' }}>₹{r.expected_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Model info strip */}
      <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(128,128,128,0.15)', display: 'flex', gap: '32px', fontSize: '12px', opacity: 0.4 }}>
        <span>Model: XGBoost</span>
        <span>MAE: 819.95 units</span>
        <span>MAPE: 12.68%</span>
        <span>Elasticity: −0.2037</span>
        <span>Training rows: 668,204</span>
      </div>
    </div>
  );
}
