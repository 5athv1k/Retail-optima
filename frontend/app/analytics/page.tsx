'use client';
import { useEffect, useState } from 'react';

export default function Analytics() {
  const [dayData, setDayData] = useState<{ day: string; avg: number }[]>([]);
  useEffect(() => {
    setDayData([
      { day: 'Mon', avg: 6800 }, { day: 'Tue', avg: 6400 }, { day: 'Wed', avg: 6100 },
      { day: 'Thu', avg: 6300 }, { day: 'Fri', avg: 6900 }, { day: 'Sat', avg: 7200 },
      { day: 'Sun', avg: 3100 },
    ]);
  }, []);
  const max = Math.max(...dayData.map(d => d.avg), 1);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Intelligence
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Analytics
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '4px' }}>
          Demand patterns observed across the Rossmann store sales dataset.
        </p>
      </div>

      {/* Info banner */}
      <div style={{ border: '1px solid rgba(128,128,128,0.2)', borderRadius: '8px', padding: '12px 16px', fontSize: '12px', opacity: 0.6, marginBottom: '32px', display: 'flex', gap: '10px' }}>
        <span>ℹ</span>
        <span>
          <strong>What you&apos;re seeing:</strong> Average sales per day of week across 836,587 cleaned rows of Rossmann data.
          This pattern directly influences the DayOfWeek feature used in the XGBoost model (7.5% importance).
        </span>
      </div>

      {/* Chart */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', opacity: 0.4, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
          Average Sales by Day of Week
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px', marginBottom: '8px' }}>
          {dayData.map(d => (
            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <div style={{ fontSize: '11px', opacity: 0.45, marginBottom: '4px' }}>{d.avg.toLocaleString()}</div>
              <div
                style={{
                  width: '100%',
                  background: d.day === 'Sat' ? 'rgba(52,211,153,0.7)' : 'rgba(128,128,128,0.35)',
                  height: `${(d.avg / max) * 100}%`,
                  borderRadius: '4px 4px 0 0',
                  transition: '0.2s ease',
                }}
              />
              <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px' }}>{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '13px', opacity: 0.5, marginTop: '20px' }}>
        Saturdays peak at ~7,200 avg units. Sundays are the lowest at ~3,100. The model captures this weekly seasonality via the DayOfWeek feature.
      </p>
    </div>
  );
}