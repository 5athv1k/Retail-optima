'use client';
import { useState } from 'react';

const API_BASE = 'http://localhost:8000';

interface Scenario {
  price: number;
  demand: number;
  revenue: number;
}

interface WhatIfResult {
  scenarios: Scenario[];
  elasticity_used: number;
}

export default function WhatIf() {
  const [currentPrice, setCurrentPrice] = useState('300');
  const [forecastedDemand, setForecastedDemand] = useState('5000');
  const [priceRangePct, setPriceRangePct] = useState('30');
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/what-if`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_price: parseFloat(currentPrice),
          forecasted_demand: parseFloat(forecastedDemand),
          price_range_pct: parseFloat(priceRangePct),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Could not reach backend. Make sure the server is running on port 8000.');
    }
    setLoading(false);
  };

  const bestRevenue = result
    ? Math.max(...result.scenarios.map((s) => s.revenue))
    : 0;

  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-stone-500 mb-6">
        What-If Analysis
      </div>

      <p className="text-sm text-stone-600 mb-6">
        Enter a price and demand level, then choose how wide a range to explore.
        The model will simulate 7 price points and show you the expected outcome
        at each — using the estimated price elasticity of demand.
      </p>

      <div className="border-b border-stone-300 pb-6 mb-6">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
              Current Price (₹)
            </label>
            <input
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              className="w-full border-b border-stone-400 bg-transparent text-sm py-1 focus:outline-none focus:border-stone-700"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
              Forecasted Demand (units)
            </label>
            <input
              type="number"
              value={forecastedDemand}
              onChange={(e) => setForecastedDemand(e.target.value)}
              className="w-full border-b border-stone-400 bg-transparent text-sm py-1 focus:outline-none focus:border-stone-700"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-500 mb-1">
              Price Range (± %)
            </label>
            <input
              type="number"
              value={priceRangePct}
              onChange={(e) => setPriceRangePct(e.target.value)}
              className="w-full border-b border-stone-400 bg-transparent text-sm py-1 focus:outline-none focus:border-stone-700"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            marginTop: '24px',
            background: loading ? 'rgba(128,128,128,0.15)' : 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.4 : 1,
            letterSpacing: '0.01em',
            transition: '0.15s ease',
          }}
        >
          {loading ? 'running scenarios…' : 'Run What-If →'}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {result && (
        <div>
          <div className="flex justify-between items-baseline mb-4">
            <div className="text-xs uppercase tracking-wider text-stone-500">
              Scenarios
            </div>
            <div className="text-xs text-stone-400">
              elasticity used: {result.elasticity_used.toFixed(4)}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone-500 border-b border-stone-300">
                <th className="py-2 font-normal">Price (₹)</th>
                <th className="py-2 font-normal">Expected Demand</th>
                <th className="py-2 font-normal">Expected Revenue (₹)</th>
                <th className="py-2 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {result.scenarios.map((s, i) => {
                const isBest = s.revenue === bestRevenue;
                return (
                  <tr
                    key={i}
                    className={`border-b border-stone-200 ${isBest ? 'bg-emerald-50' : ''}`}
                  >
                    <td className="py-2">{s.price.toFixed(2)}</td>
                    <td className="py-2">{s.demand.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className={`py-2 ${isBest ? 'text-emerald-700 font-medium' : ''}`}>
                      {s.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2 text-xs text-stone-400">
                      {isBest ? '← best revenue' : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="mt-4 text-xs text-stone-400">
            Demand is adjusted using the elasticity formula: new demand = base demand × (new price / current price)^elasticity
          </p>
        </div>
      )}
    </div>
  );
}
