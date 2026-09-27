'use client';
import { useState, useRef } from 'react';
import { Upload, FileText, Download } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

interface BatchRow {
  store: number;
  promo: number;
  day_of_week: number;
  forecasted_demand: number;
  current_price: number;
  recommended_price: number;
  expected_revenue: number;
  error?: string;
}

const SAMPLE_CSV = `Store,Promo,DayOfWeek
1,1,3
5,0,6
12,1,2
20,0,4
33,1,5
`;

export default function BatchAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<BatchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResults([]);
    setDone(false);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResults([]);
    setDone(false);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/batch-forecast`, { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setResults(data.results); setDone(true); }
    } catch {
      setError('Could not reach backend. Make sure the server is running on port 8000.');
    }
    setLoading(false);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sample_batch.csv'; a.click();
  };

  const downloadResults = () => {
    const header = 'Store,Promo,DayOfWeek,ForecastedDemand,CurrentPrice,RecommendedPrice,ExpectedRevenue\n';
    const rows = results.map(r =>
      `${r.store},${r.promo},${r.day_of_week},${r.forecasted_demand},${r.current_price},${r.recommended_price},${r.expected_revenue}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'batch_results.csv'; a.click();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Forecasting
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Batch Analysis
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '4px' }}>
          Upload a CSV of store conditions and get demand forecasts + optimal prices for every row at once.
        </p>
      </div>

      {/* Info banner */}
      <div style={{ border: '1px solid rgba(128,128,128,0.2)', borderRadius: '8px', padding: '12px 16px', fontSize: '12px', opacity: 0.6, marginBottom: '32px', display: 'flex', gap: '10px' }}>
        <span>ℹ</span>
        <span>
          <strong>How to use:</strong> Upload a CSV with three columns — <strong>Store</strong> (store number 1–1115),{' '}
          <strong>Promo</strong> (0 or 1), <strong>DayOfWeek</strong> (1=Mon … 7=Sun).
          The model will run a forecast and price optimisation for every row.
          Not sure about the format? Download the sample CSV below.
        </span>
      </div>

      {/* Sample download */}
      <button
        onClick={downloadSample}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(128,128,128,0.1)',
          border: '1px solid rgba(128,128,128,0.2)',
          borderRadius: '8px', padding: '8px 16px',
          fontSize: '12px', cursor: 'pointer', marginBottom: '24px',
          opacity: 0.7,
        }}
      >
        <Download size={13} />
        Download Sample CSV
      </button>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${file ? 'rgba(52,211,153,0.4)' : 'rgba(128,128,128,0.25)'}`,
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '24px',
          transition: '0.2s ease',
          background: file ? 'rgba(52,211,153,0.04)' : 'transparent',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />
        {file ? (
          <div>
            <FileText size={28} style={{ margin: '0 auto 10px', opacity: 0.6, display: 'block', color: '#34d399' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#34d399' }}>{file.name}</div>
            <div style={{ fontSize: '12px', opacity: 0.4, marginTop: '4px' }}>
              {(file.size / 1024).toFixed(1)} KB — click to change
            </div>
          </div>
        ) : (
          <div>
            <Upload size={28} style={{ margin: '0 auto 10px', opacity: 0.3, display: 'block' }} />
            <div style={{ fontSize: '14px', opacity: 0.5 }}>Drop your CSV file here</div>
            <div style={{ fontSize: '12px', opacity: 0.3, marginTop: '4px' }}>or click to browse</div>
          </div>
        )}
      </div>

      {/* Analyse button */}
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        style={{
          background: !file || loading ? 'rgba(128,128,128,0.1)' : 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px', padding: '10px 24px',
          fontSize: '13px', fontWeight: 600,
          cursor: !file || loading ? 'not-allowed' : 'pointer',
          opacity: !file || loading ? 0.4 : 1,
          letterSpacing: '0.01em', transition: '0.15s ease',
          marginBottom: '32px',
        }}
      >
        {loading ? 'Analysing…' : 'Analyse Batch →'}
      </button>

      {error && (
        <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '24px' }}>
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {done && results.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Results — {results.length} rows
            </div>
            <button
              onClick={downloadResults}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(52,211,153,0.1)',
                border: '1px solid rgba(52,211,153,0.25)',
                borderRadius: '6px', padding: '6px 12px',
                fontSize: '12px', fontWeight: 600, color: '#34d399',
                cursor: 'pointer',
              }}
            >
              <Download size={12} />
              Download Results
            </button>
          </div>

          <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.2)', textAlign: 'left' }}>
                {['Store', 'Promo', 'Day', 'Demand', 'Current ₹', 'Recommended ₹', 'Revenue ₹'].map(h => (
                  <th key={h} style={{ padding: '8px 0', fontWeight: 500, opacity: 0.4, paddingRight: '16px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
                  <td style={{ padding: '10px 0', paddingRight: '16px' }}>Store {r.store}</td>
                  <td style={{ padding: '10px 0', paddingRight: '16px', opacity: 0.6 }}>{r.promo ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '10px 0', paddingRight: '16px', opacity: 0.6 }}>
                    {['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][r.day_of_week] ?? r.day_of_week}
                  </td>
                  <td style={{ padding: '10px 0', paddingRight: '16px' }}>
                    {r.error ? <span style={{ color: '#f87171', fontSize: '12px' }}>{r.error}</span>
                      : r.forecasted_demand.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ padding: '10px 0', paddingRight: '16px', opacity: 0.6 }}>{r.error ? '—' : r.current_price}</td>
                  <td style={{ padding: '10px 0', paddingRight: '16px', color: '#34d399', fontWeight: 600 }}>
                    {r.error ? '—' : r.recommended_price}
                  </td>
                  <td style={{ padding: '10px 0' }}>
                    {r.error ? '—' : `₹${r.expected_revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
