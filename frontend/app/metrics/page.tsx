export default function Metrics() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Intelligence
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Model Metrics
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '4px' }}>
          Evaluation results from the XGBoost demand forecaster and the log-log OLS elasticity model.
        </p>
      </div>

      {/* Info banner */}
      <div style={{ border: '1px solid rgba(128,128,128,0.2)', borderRadius: '8px', padding: '12px 16px', fontSize: '12px', opacity: 0.6, marginBottom: '32px', display: 'flex', gap: '10px' }}>
        <span>ℹ</span>
        <span><strong>What you&apos;re seeing:</strong> All numbers are from the actual training run — not estimates. MAPE excludes rows where sales &lt; 10 to avoid divide-by-near-zero distortion.</span>
      </div>

      <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(128,128,128,0.15)' }}>
        <div style={{ fontSize: '11px', opacity: 0.4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Demand Forecast Model — XGBoost</div>
        <div style={{ display: 'flex', gap: '40px', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '32px', fontWeight: 700 }}>819.95</div><div style={{ fontSize: '12px', opacity: 0.45 }}>MAE (units)</div></div>
          <div><div style={{ fontSize: '32px', fontWeight: 700 }}>12.68%</div><div style={{ fontSize: '12px', opacity: 0.45 }}>MAPE</div></div>
          <div><div style={{ fontSize: '32px', fontWeight: 700 }}>668,204</div><div style={{ fontSize: '12px', opacity: 0.45 }}>training rows</div></div>
        </div>
        <p style={{ fontSize: '13px', opacity: 0.5 }}>Time-based 80/20 split on Rossmann Store Sales data.</p>
      </div>

      <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(128,128,128,0.15)' }}>
        <div style={{ fontSize: '11px', opacity: 0.4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>Feature Importance</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {([["Sales_Lag1", 38.1], ["Promo", 24.2], ["Sales_RollingMean7", 15.6], ["DayOfWeek", 7.5], ["Sales_Lag7", 5.0], ["WeekOfYear", 2.5]] as [string, number][]).map(([label, val]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
              <div style={{ width: '160px', opacity: 0.6 }}>{label}</div>
              <div style={{ flex: 1, background: 'rgba(128,128,128,0.15)', height: '6px', borderRadius: '3px' }}>
                <div style={{ background: 'rgba(128,128,128,0.7)', height: '100%', borderRadius: '3px', width: `${val}%` }} />
              </div>
              <div style={{ width: '36px', textAlign: 'right', opacity: 0.5, fontSize: '12px' }}>{val}%</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '11px', opacity: 0.4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Price Elasticity Model — Log-Log OLS</div>
        <div style={{ display: 'flex', gap: '40px', marginBottom: '12px' }}>
          <div><div style={{ fontSize: '32px', fontWeight: 700 }}>-0.2037</div><div style={{ fontSize: '12px', opacity: 0.45 }}>elasticity</div></div>
          <div><div style={{ fontSize: '32px', fontWeight: 700 }}>0.207</div><div style={{ fontSize: '12px', opacity: 0.45 }}>R²</div></div>
          <div><div style={{ fontSize: '32px', fontWeight: 700 }}>&lt;0.001</div><div style={{ fontSize: '12px', opacity: 0.45 }}>p-value</div></div>
        </div>
        <p style={{ fontSize: '13px', opacity: 0.5 }}>A 1% price increase is associated with a 0.20% decrease in demand. Negative sign confirms economic theory.</p>
      </div>
    </div>
  );
}