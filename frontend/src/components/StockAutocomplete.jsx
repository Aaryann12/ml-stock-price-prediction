import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export default function StockAutocomplete({ stocksList, selectedSymbol, onSelectStock }) {
  const [query, setQuery] = useState(selectedSymbol || 'RELIANCE');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Synchronize internal query state if selectedSymbol prop changes from parent
  useEffect(() => {
    if (selectedSymbol) {
      // Strip any .NS suffix or brackets if present in raw string
      const cleanSym = selectedSymbol.replace(/\.NS$/i, '').replace(/\(.*\)/, '').trim();
      setQuery(cleanSym);
    }
  }, [selectedSymbol]);

  // Handle click outside to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clean stock list items: format visible symbol cleanly without (SYMBOL.NS)
  const cleanStocksList = (stocksList || []).map(s => {
    const rawSym = typeof s === 'string' ? s : s.symbol;
    const cleanSym = rawSym.replace(/\.NS$/i, '').replace(/\(.*\)/, '').trim();
    return {
      rawObject: s,
      cleanSymbol: cleanSym,
      originalSymbol: rawSym
    };
  });

  // Filter matching suggestions ONLY when user has entered text
  const filteredSuggestions = query.trim() === ''
    ? []
    : cleanStocksList.filter(item =>
      item.cleanSymbol.toUpperCase().includes(query.trim().toUpperCase())
    ).slice(0, 10);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setHighlightedIndex(0);
    // Show suggestions only if user typed non-empty text
    if (val.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectOption = (item) => {
    setQuery(item.cleanSymbol);
    setIsOpen(false);
    onSelectStock(item.originalSymbol);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === 'ArrowDown' && query.trim().length > 0) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions[highlightedIndex]) {
        handleSelectOption(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={16}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length > 0 && filteredSuggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder="Search stock symbol (e.g. RELIANCE)..."
          className="form-input"
          style={{
            paddingLeft: '38px',
            paddingRight: '36px',
            fontWeight: 700,
            fontSize: '0.95rem',
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}
        />
        <ChevronDown
          size={16}
          color="var(--text-muted)"
          style={{
            position: 'absolute',
            right: '12px',
            pointerEvents: 'none',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </div>

      {/* Glassmorphic Autocomplete Suggestion Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: 'rgba(15, 16, 32, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: '12px',
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(99, 102, 241, 0.2)',
          zIndex: 999,
          maxHeight: '320px',
          overflowY: 'auto',
          padding: '6px'
        }}>
          {filteredSuggestions.map((item, index) => {
            const isHighlighted = index === highlightedIndex;
            const isSelected = item.cleanSymbol.toUpperCase() === query.trim().toUpperCase();

            return (
              <div
                key={item.originalSymbol}
                onClick={() => handleSelectOption(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: isHighlighted
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.35) 0%, rgba(139, 92, 246, 0.25) 100%)'
                    : 'transparent',
                  color: isHighlighted || isSelected ? '#FFFFFF' : 'var(--text-muted)',
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: '0.9rem',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: isHighlighted ? '#4ADE80' : '#8B5CF6', fontSize: '0.8rem' }}>•</span>
                  <span>{item.cleanSymbol}</span>
                </div>
                {isSelected && <Check size={16} color="#4ADE80" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
