'use client';
import { useState, useEffect } from 'react';

import { API_BASE } from './config';

interface ForecastResult {
  store: number;
  forecasted_demand: number;
  current_price: number;
}

interface PriceResult {
  recommended_price: number;
  expected_demand: number;
  expected_revenue: number;
  current_price: number;
  elasticity_used: number;
}

export default function Home() {
  const [stores, setStores] = useState<number[]>([]);
  const [selectedStore, setSelectedStore] = useState<number>(1);
  const [promo, setPromo] = useState<boolean>(false);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/stores`).then(res => res.json()).then(data => setStores(data.stores));
  }, []);

  const runForecast = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store: selectedStore, promo: promo ? 1 : 0, day_of_week: new Date().getDay() || 7 }),
    });
    setForecast(await res.json());
    setPriceResult(null);
    setLoading(false);
  };

  const runOptimizer = async () => {
    if (!forecast) return;
    setLoading(true);
    const res = await fetch(`${API_BASE}/optimize-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store: selectedStore,
        current_price: forecast.current_price,
        forecasted_demand: forecast.forecasted_demand,
        objective: 'revenue',
      }),
    });
    setPriceResult(await res.json());
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Forecasting
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Store Forecast
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '4px' }}>
          Select a store and run the XGBoost model to get a demand forecast and optimal price.
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
      }}>
        <span>ℹ</span>
        <span>
          <strong>How to use:</strong> Pick a store from the dropdown, check &quot;Promo&quot; if a promotion is running,
          then click &quot;forecast →&quot;. Once you have a forecast, click &quot;find optimal price →&quot; to run the price optimizer.
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(Number(e.target.value))}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(128,128,128,0.4)',
            padding: '6px 4px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {stores.map(s => <option key={s} value={s}>Store {s}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
          <input type="checkbox" checked={promo} onChange={(e) => setPromo(e.target.checked)} />
          Promo active
        </label>
        <button
          onClick={runForecast}
          disabled={loading}
          style={{
            marginLeft: 'auto',
            background: loading ? 'rgba(128,128,128,0.15)' : 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.4 : 1,
            letterSpacing: '0.01em',
            transition: '0.15s ease',
          }}
        >
          {loading ? 'loading…' : 'Run Forecast →'}
        </button>
      </div>

      {forecast && (
        <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(128,128,128,0.15)' }}>
          <div style={{ fontSize: '11px', opacity: 0.4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Store {forecast.store} — Result
          </div>
          <div style={{ display: 'flex', gap: '48px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                {forecast.forecasted_demand.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.45, marginTop: '2px' }}>units forecasted</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                ₹{forecast.current_price}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.45, marginTop: '2px' }}>current price</div>
            </div>
          </div>
          <button
            onClick={runOptimizer}
            disabled={loading}
            style={{
              background: loading ? 'rgba(128,128,128,0.15)' : 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.3)',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#34d399',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.4 : 1,
              letterSpacing: '0.01em',
              transition: '0.15s ease',
            }}
          >
            {loading ? 'loading…' : 'Find Optimal Price →'}
          </button>
        </div>
      )}

      {priceResult && (
        <div>
          <div style={{ fontSize: '11px', opacity: 0.4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Recommendation
          </div>
          <div style={{ fontSize: '42px', fontWeight: 700, letterSpacing: '-0.02em', color: '#34d399', marginBottom: '4px' }}>
            ₹{priceResult.recommended_price}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.45, marginBottom: '20px' }}>
            was ₹{priceResult.current_price} · elasticity used: {priceResult.elasticity_used}
          </div>
          <div style={{ display: 'flex', gap: '40px', fontSize: '13px', opacity: 0.7 }}>
            <div>{priceResult.expected_demand.toLocaleString()} expected units</div>
            <div>₹{priceResult.expected_revenue.toLocaleString()} expected revenue</div>
          </div>
        </div>
      )}
    </div>
  );
}