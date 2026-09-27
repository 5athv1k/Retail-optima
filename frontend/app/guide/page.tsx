import { Database, BrainCircuit, TrendingUp, SlidersHorizontal, ShieldCheck } from 'lucide-react';

export default function Guide() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Guide
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          How It Works
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '4px' }}>
          The data, models, and logic behind RetailIQ — explained end to end.
        </p>
      </div>

      {/* Info banner */}
      <div style={{
        border: '1px solid rgba(128,128,128,0.2)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '12px',
        opacity: 0.6,
        marginBottom: '40px',
        display: 'flex',
        gap: '10px',
      }}>
        <span>ℹ</span>
        <span>
          <strong>What you&apos;re seeing:</strong> A full walkthrough of the system — from raw retail data to a live pricing recommendation.
          This page is useful for understanding what each module does before exploring the tools.
        </span>
      </div>

      {/* Step cards */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
          System Pipeline
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {[
            { n: '01', title: 'Data Collection', body: 'Raw Rossmann Store Sales data from Kaggle (1M+ rows). A synthetic price column was generated per store using base price + noise + promo discount, since Rossmann does not publish real pricing data.' },
            { n: '02', title: 'Feature Engineering', body: 'ETL script builds lag features (Sales_Lag1, Lag7), a 7-day rolling mean, and calendar features (DayOfWeek, WeekOfYear, IsHoliday). Closed-store days are removed — 836,587 rows remain.' },
            { n: '03', title: 'Demand Forecasting', body: 'XGBoost regression trained on an 80/20 time-based split (668,204 rows). Achieves MAE = 819.95 units and MAPE = 12.68%. Top feature: Sales_Lag1 (38.1% importance).' },
            { n: '04', title: 'Elasticity Estimation', body: 'Log-log OLS regression (statsmodels) estimates how demand responds to price changes. Coefficient = −0.2037, R² = 0.207, p < 0.001. Negative sign confirms demand falls as price rises.' },
            { n: '05', title: 'Price Optimization', body: 'Grid search across ±30% of current price (50 candidates). For each candidate, demand is adjusted using the elasticity formula and revenue is computed. The price that maximises revenue is returned.' },
            { n: '06', title: 'What-If Simulation', body: 'Given any price and demand level, the model simulates 7 price points across a user-defined range. Each scenario shows expected demand and revenue — revealing the revenue-maximising price point.' },
          ].map((c) => (
            <div
              key={c.n}
              style={{
                border: '1px solid rgba(128,128,128,0.18)',
                borderRadius: '10px',
                padding: '20px',
              }}
            >
              <div style={{ fontSize: '22px', fontWeight: 800, opacity: 0.15, marginBottom: '8px', letterSpacing: '-0.02em' }}>
                {c.n}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>{c.title}</div>
              <div style={{ fontSize: '12px', opacity: 0.55, lineHeight: 1.6 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What each page does */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Pages in This App
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { icon: TrendingUp, page: 'Store Forecast', desc: 'Select a store and promo condition → get the forecasted demand and current price. Hit "find optimal price" to run the optimizer and see the recommended price with expected revenue.' },
            { icon: Database, page: 'Store Explorer', desc: 'Full table of all 50 stores with their forecasted demand, current price, optimizer-recommended price, and expected revenue. Searchable by store number.' },
            { icon: SlidersHorizontal, page: 'What-If Analysis', desc: 'Enter any price and demand level. Choose a price range. The model simulates 7 scenarios and highlights which price point would generate the highest revenue.' },
            { icon: BrainCircuit, page: 'Model Metrics', desc: 'XGBoost model performance stats (MAE, MAPE, training size) and feature importance breakdown. Elasticity model stats (coefficient, R², p-value).' },
            { icon: TrendingUp, page: 'Analytics', desc: 'Bar chart of average sales by day of week across the Rossmann dataset. Shows the weekly demand pattern — Saturday peaks, Sunday lowest.' },
          ].map((p) => (
            <div
              key={p.page}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '16px 0',
                borderBottom: '1px solid rgba(128,128,128,0.12)',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ marginTop: '2px', opacity: 0.4 }}>
                <p.icon size={16} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '3px' }}>{p.page}</div>
                <div style={{ fontSize: '12px', opacity: 0.5, lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Technology Used
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          {[
            { title: 'Frontend', items: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Lucide React'] },
            { title: 'Backend', items: ['Python 3.12', 'FastAPI', 'Pandas', 'NumPy'] },
            { title: 'Machine Learning', items: ['XGBoost', 'statsmodels OLS', 'scikit-learn', 'scipy optimize'] },
            { title: 'Data', items: ['Rossmann Store Sales (Kaggle)', '836,587 rows after cleaning', 'Synthetic price column'] },
            { title: 'Evaluation', items: ['MAE: 819.95 units', 'MAPE: 12.68%', 'Elasticity R²: 0.207'] },
          ].map((t) => (
            <div
              key={t.title}
              style={{
                border: '1px solid rgba(128,128,128,0.18)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>{t.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {t.items.map((i) => (
                  <div key={i} style={{ fontSize: '11px', opacity: 0.5 }}>{i}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{
        border: '1px solid rgba(128,128,128,0.2)',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
      }}>
        <ShieldCheck size={18} style={{ opacity: 0.5, flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Understanding the predictions</div>
          <div style={{ fontSize: '12px', opacity: 0.55, lineHeight: 1.7 }}>
            RetailIQ is a predictive decision-support prototype. All forecasts and pricing recommendations
            are model estimates based on historical Rossmann sales data and a synthetically generated price column.
            They should not be used as-is for real pricing decisions without validation against live sales data.
            Price elasticity was estimated via log-log OLS regression — results reflect the training distribution
            and may not generalise to stores or periods outside the dataset.
          </div>
        </div>
      </section>
    </div>
  );
}
