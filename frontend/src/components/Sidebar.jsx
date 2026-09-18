import React from 'react';
import {
  TrendingUp,
  BarChart2,
  Info,
  Cpu
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, modelMetrics }) {
  const navItems = [
    { id: 'predict', label: 'Predict', icon: TrendingUp },
    { id: 'market', label: 'Market Overview', icon: BarChart2 },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: 'rgba(15, 16, 32, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      zIndex: 50,
      userSelect: 'none'
    }}>
      {/* Top Branding & Main Navigation */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 8px 24px 8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
          }}>
            <TrendingUp size={22} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              lineHeight: 1.1
            }}>
              NeuraStock <span style={{ color: '#8B5CF6' }}>AI</span>
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Nifty 500 Analytics
            </p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.85) 0%, rgba(79, 70, 229, 0.95) 100%)'
                    : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 20px rgba(99, 102, 241, 0.35)' : 'none'
                }}
              >
                <Icon size={18} color={isActive ? '#FFFFFF' : '#94A3B8'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Model Specs Card & Clean Footer */}
      <div>
        <div className="glass-card" style={{
          padding: '16px',
          background: 'rgba(22, 22, 46, 0.8)',
          borderRadius: '16px',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(139, 92, 246, 0.4)'
            }}>
              <Cpu size={16} color="#A855F7" />
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-white)' }}>
              Model Information
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Model</span>
              <span style={{ fontWeight: 600, color: '#C084FC' }}>
                {modelMetrics?.model_name || 'Linear Regression'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>R² Score</span>
              <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                {modelMetrics?.r2_score ? modelMetrics.r2_score.toFixed(4) : '0.9995'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>MAE</span>
              <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                ₹{modelMetrics?.mae ? modelMetrics.mae.toFixed(2) : '29.49'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>RMSE</span>
              <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                ₹{modelMetrics?.rmse ? modelMetrics.rmse.toFixed(2) : '76.32'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ color: 'var(--text-dim)' }}>Last Trained</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {modelMetrics?.last_trained || '31 May 2025'}
              </span>
            </div>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '0.68rem',
          color: 'var(--text-dim)',
          marginTop: '16px'
        }}>
          © 2025 NeuraStock AI. All rights reserved.
        </p>
      </div>
    </aside>
  );
}
