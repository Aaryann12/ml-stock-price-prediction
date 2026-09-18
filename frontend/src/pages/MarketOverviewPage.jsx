import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Search,
  Layers,
  Database,
  Calendar,
  DollarSign,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { fetchMarketSummary, fetchStocksUniverse } from '../services/api';

export default function MarketOverviewPage({ onSelectStockToPredict }) {
  const [summary, setSummary] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, univRes] = await Promise.all([
        fetchMarketSummary(),
        fetchStocksUniverse()
      ]);
      setSummary(sumRes);
      if (univRes?.stocks) {
        setStocks(univRes.stocks);
      }
    } catch (err) {
      console.error("Market data load error:", err);
      setError("Failed to connect to FastAPI backend for market data.");
    } finally {
      setLoading(false);
    }
  };

  // Filter stocks by search query
  const filteredStocks = stocks.filter(s => {
    const cleanSym = s.symbol.replace(/\.NS$/i, '').toUpperCase();
    return cleanSym.includes(searchQuery.trim().toUpperCase());
  });

  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatNum = (val) => Number(val || 0).toLocaleString('en-IN');

  const barColors = ['#8B5CF6', '#6366F1', '#3B82F6', '#06B6D4', '#10B981', '#34D399', '#A855F7', '#EC4899', '#F43F5E', '#F59E0B'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* 4 Summary Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>

        {/* Total Stocks Listed */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <Layers size={20} color="#C084FC" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                Total Stocks Listed
              </span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', fontFamily: 'var(--font-display)' }}>
                {summary?.total_stocks || 502}
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '8px', display: 'block' }}>
            Nifty 500 Stock Universe
          </span>
        </div>

        {/* Total Dataset Records */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              <Database size={20} color="#6366F1" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                Total Dataset Records
              </span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', fontFamily: 'var(--font-display)' }}>
                {formatNum(summary?.total_records || 289189)}
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '8px', display: 'block' }}>
            Historical Trading Days
          </span>
        </div>

        {/* Historical Date Range */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              <Calendar size={20} color="#06B6D4" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                Historical Date Range
              </span>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
                {summary?.date_range || '2024-01-01 to 2026-06-18'}
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '8px', display: 'block' }}>
            2.5 Years Continuous Data
          </span>
        </div>

        {/* Average Close Price */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(74, 222, 128, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(74, 222, 128, 0.3)'
            }}>
              <DollarSign size={20} color="#4ADE80" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                Average Close Price
              </span>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', fontFamily: 'var(--font-display)' }}>
                {formatINR(summary?.average_close || 2249.32)}
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '8px', display: 'block' }}>
            Across Entire Universe
          </span>
        </div>

      </div>

      {/* Top Traded Stocks By Volume Chart Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
            TOP TRADED STOCKS BY VOLUME
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Top 10 most active equities by total aggregate volume in Nifty 500 dataset
          </p>
        </div>

        <div style={{ width: '100%', height: '280px' }}>
          {summary?.top_traded_stocks && summary.top_traded_stocks.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.top_traded_stocks} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis
                  dataKey="symbol"
                  stroke="var(--text-dim)"
                  tick={{ fill: '#FFFFFF', fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <YAxis
                  stroke="var(--text-dim)"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1e9).toFixed(0)}B`}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 16, 32, 0.95)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)'
                  }}
                  labelStyle={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    marginBottom: '4px'
                  }}
                  itemStyle={{
                    color: '#CBD5E1',
                    fontSize: '0.88rem',
                    fontWeight: 500
                  }}
                  formatter={(value) => [formatNum(value), 'Total Volume']}
                />
                <Bar dataKey="total_volume" radius={[8, 8, 0, 0]}>
                  {summary.top_traded_stocks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Loading volume analytics...
            </div>
          )}
        </div>
      </div>

      {/* Indian Stock Universe Table Card */}
      <div className="glass-card" style={{ padding: '24px' }}>

        {/* Header & Search Input */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
              INDIAN STOCK UNIVERSE
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Showing {filteredStocks.length} of {stocks.length} stocks
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search stock symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', borderRadius: '20px' }}
            />
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.84rem'
          }}>
            <thead>
              <tr style={{
                background: 'rgba(15, 15, 30, 0.9)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'var(--text-muted)',
                fontSize: '0.76rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <th style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>SYMBOL</th>
                <th style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>LAST DATE</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>OPEN (₹)</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>HIGH (₹)</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>LOW (₹)</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>CLOSE (₹)</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>VOLUME</th>
                <th style={{ padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                      <div className="spinner" />
                      <span>Loading Stock Universe...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStocks.length > 0 ? (
                filteredStocks.slice(0, 100).map((s, idx) => {
                  const cleanSym = s.symbol.replace(/\.NS$/i, '').replace(/\(.*\)/, '').trim();
                  return (
                    <tr
                      key={s.symbol}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)'}
                    >
                      <td style={{ padding: '10px 10px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                        {cleanSym}
                      </td>
                      <td style={{ padding: '10px 10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {s.last_date}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                        {s.open.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: 'var(--success-green)', whiteSpace: 'nowrap' }}>
                        {s.high.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: 'var(--danger-red)', whiteSpace: 'nowrap' }}>
                        {s.low.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                        {s.close.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {formatNum(s.volume)}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => onSelectStockToPredict(cleanSym)}
                          style={{
                            background: 'rgba(99, 102, 241, 0.2)',
                            border: '1px solid rgba(99, 102, 241, 0.4)',
                            color: '#C084FC',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.4)';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                            e.currentTarget.style.color = '#C084FC';
                          }}
                        >
                          <span>Predict</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No stock symbols matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
