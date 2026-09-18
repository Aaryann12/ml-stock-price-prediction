import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Header({ title, subtitle, highlightWord }) {
  // Render title with styled highlight word if provided
  const renderTitle = () => {
    if (!highlightWord) return title;
    const parts = title.split(highlightWord);
    return (
      <>
        {parts[0]}
        <span className="gradient-text-purple">{highlightWord}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '28px',
      padding: '4px 0'
    }}>
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.85rem',
          fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: '-0.02em',
          lineHeight: 1.2
        }}>
          {renderTitle()}
        </h2>
        {subtitle && (
          <p style={{
            fontSize: '0.92rem',
            color: 'var(--text-muted)',
            marginTop: '4px'
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* User Profile Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px 6px 6px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#FFFFFF'
          }}>
            AP
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>
            Aryan Patel
          </span>
          <ChevronDown size={16} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
}
