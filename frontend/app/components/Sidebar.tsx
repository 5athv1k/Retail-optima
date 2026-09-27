'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Store,
  SlidersHorizontal,
  BarChart3,
  BrainCircuit,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  PackageSearch,
} from 'lucide-react';

const sections = [
  {
    label: 'OVERVIEW',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    label: 'FORECASTING',
    items: [
      { icon: TrendingUp, label: 'Store Forecast', href: '/' },
      { icon: Store, label: 'Store Explorer', href: '/all-stores' },
      { icon: PackageSearch, label: 'Batch Analysis', href: '/batch' },
    ],
  },
  {
    label: 'PRICING',
    items: [
      { icon: SlidersHorizontal, label: 'What-If Analysis', href: '/what-if' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { icon: BarChart3, label: 'Analytics', href: '/analytics' },
      { icon: BrainCircuit, label: 'Model Metrics', href: '/metrics' },
    ],
  },
  {
    label: 'GUIDE',
    items: [
      { icon: BookOpen, label: 'How It Works', href: '/guide' },
    ],
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const current = usePathname();

  return (
    <aside
      style={{
        width: open ? '220px' : '60px',
        minHeight: '100vh',
        borderRight: '1px solid rgba(128,128,128,0.15)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: open ? '18px 16px' : '18px 10px',
          borderBottom: '1px solid rgba(128,128,128,0.15)',
          minHeight: '64px',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: '#78716c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShoppingCart size={17} color="white" />
        </div>
        {open && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '-0.01em' }}>
              RetailX
            </div>
            <div style={{ fontSize: '10px', opacity: 0.45, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '1px' }}>
              Demand & Pricing
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {sections.map((section) => (
          <div key={section.label} style={{ marginBottom: '4px' }}>
            {open && (
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  opacity: 0.35,
                  letterSpacing: '0.1em',
                  padding: '10px 8px 4px',
                  textTransform: 'uppercase',
                }}
              >
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = current === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: open ? '9px 8px' : '9px',
                    borderRadius: '7px',
                    marginBottom: '2px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    opacity: isActive ? 1 : 0.55,
                    background: isActive ? 'rgba(120,113,108,0.15)' : 'transparent',
                    transition: '0.15s ease',
                    justifyContent: open ? 'flex-start' : 'center',
                  }}
                >
                  <item.icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                  {open && <span>{item.label}</span>}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Toggle button */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(128,128,128,0.15)' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: open ? 'flex-end' : 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 4px',
            borderRadius: '6px',
            opacity: 0.4,
            fontSize: '11px',
          }}
        >
          {open ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
          {open && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
