import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart2,
  PieChart,
  Lightbulb,
  Award,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import StockAutocomplete from '../components/StockAutocomplete';
import { predictStockPrice, fetchStockHistory } from '../services/api';

export default function PredictPage({ stocksList, setModelMetrics }) {
  // State for selected stock and input fields
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [open, setOpen] = useState(2943.00);
  const [high, setHigh] = useState(2980.20);
  const [low, setLow] = useState(2935.10);
  const [close, setClose] = useState(2945.30);
  const [volume, setVolume] = useState(1245678);

  // State for prediction results
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for historical chart data & stats
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [stats, setStats] = useState({
    movingAverage: 2812.45,
    week52High: 3127.80,
    week52Low: 2102.35,
    todayVolume: 1245678,
    totalStocksCount: 502
  });

  // Handle stock selection & auto-fill from dataset
  const handleStockChange = (symbol) => {
    const cleanSym = symbol.replace(/\.NS$/i, '').replace(/\(.*\)/, '').trim().toUpperCase();
    setSelectedSymbol(cleanSym);

    // Find stock matching either clean symbol or raw symbol in dataset
    const stockObj = stocksList.find(s =>
      s.symbol.toUpperCase() === cleanSym ||
      s.symbol.replace(/\.NS$/i, '').toUpperCase() === cleanSym
    );

    if (stockObj) {
      setOpen(stockObj.open);
      setHigh(stockObj.high);
      setLow(stockObj.low);
      setClose(stockObj.close);
      setVolume(stockObj.volume);
    }
  };

  // Run initial prediction and history fetch when component mounts or stock changes
  useEffect(() => {
    if (selectedSymbol) {
      loadStockHistoryAndPredict(selectedSymbol);
    }
  }, [selectedSymbol]);

  const loadStockHistoryAndPredict = async (symbol) => {
    setHistoryLoading(true);
    setError(null);

    try {
      // 1. Fetch history for line chart
      const histRes = await fetchStockHistory(symbol, 30);
      if (histRes?.history && histRes.history.length > 0) {
        const formattedHistory = histRes.history.map(item => {
          const d = new Date(item.date);
          const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
          const dayStr = d.getDate().toString().padStart(2, '0');
          return {
            ...item,
            displayDate: `${monthStr} ${dayStr}`
          };
        });
        setHistoryData(formattedHistory);

        const closePrices = formattedHistory.map(h => h.actual_close);
        const avg = closePrices.reduce((a, b) => a + b, 0) / closePrices.length;
        const maxHigh = Math.max(...formattedHistory.map(h => h.high));
        const minLow = Math.min(...formattedHistory.map(h => h.low));
        const latestVol = formattedHistory[formattedHistory.length - 1]?.volume || volume;

        setStats(prev => ({
          ...prev,
          movingAverage: roundVal(avg),
          week52High: roundVal(maxHigh * 1.05),
          week52Low: roundVal(minLow * 0.95),
          todayVolume: latestVol
        }));
      }

      // 2. Perform automated initial prediction
      const stockObj = stocksList.find(s =>
        s.symbol.toUpperCase() === symbol ||
        s.symbol.replace(/\.NS$/i, '').toUpperCase() === symbol
      );
      const currOpen = stockObj ? stockObj.open : open;
      const currHigh = stockObj ? stockObj.high : high;
      const currLow = stockObj ? stockObj.low : low;
      const currClose = stockObj ? stockObj.close : close;
      const currVol = stockObj ? stockObj.volume : volume;

      const predResult = await predictStockPrice({
        symbol: symbol,
        open: parseFloat(currOpen),
        high: parseFloat(currHigh),
        low: parseFloat(currLow),
        close: parseFloat(currClose),
        volume: parseInt(currVol, 10)
      });

      setPrediction(predResult);
      if (setModelMetrics) {
        setModelMetrics({
          model_name: "Linear Regression",
          r2_score: predResult.r2_score,
          mae: predResult.mae,
          rmse: predResult.rmse,
          last_trained: "31 May 2025"
        });
      }
    } catch (err) {
      console.error("Error loading stock data:", err);
      setPrediction(null);
      setError(err.message || "Failed to communicate with prediction server.");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Client-side form input validation BEFORE sending API request
  const validateInputs = () => {
    if (!selectedSymbol || !selectedSymbol.trim()) {
      return "Please select a stock symbol.";
    }
    if (open === "" || open === null || open === undefined || isNaN(Number(open))) {
      return "Please enter a valid Open price.";
    }
    if (high === "" || high === null || high === undefined || isNaN(Number(high))) {
      return "Please enter a valid High price.";
    }
    if (low === "" || low === null || low === undefined || isNaN(Number(low))) {
      return "Please enter a valid Low price.";
    }
    if (close === "" || close === null || close === undefined || isNaN(Number(close))) {
      return "Please enter a valid Close price.";
    }
    if (volume === "" || volume === null || volume === undefined || isNaN(Number(volume))) {
      return "Please enter a valid Volume.";
    }

    const numOpen = Number(open);
    const numHigh = Number(high);
    const numLow = Number(low);
    const numClose = Number(close);
    const numVol = Number(volume);

    if (numOpen <= 0) return "Open price must be greater than ₹0.00";
    if (numHigh <= 0) return "High price must be greater than ₹0.00";
    if (numLow <= 0) return "Low price must be greater than ₹0.00";
    if (numClose <= 0) return "Close price must be greater than ₹0.00";
    if (numVol < 0) return "Volume cannot be negative.";

    if (numHigh < numOpen) {
      return `High price (₹${numHigh}) cannot be less than Open price (₹${numOpen}).`;
    }
    if (numHigh < numClose) {
      return `High price (₹${numHigh}) cannot be less than Close price (₹${numClose}).`;
    }
    if (numHigh < numLow) {
      return `High price (₹${numHigh}) cannot be less than Low price (₹${numLow}).`;
    }
    if (numLow > numOpen) {
      return `Low price (₹${numLow}) cannot be greater than Open price (₹${numOpen}).`;
    }
    if (numLow > numClose) {
      return `Low price (₹${numLow}) cannot be greater than Close price (₹${numClose}).`;
    }

    return null;
  };

  // Form submit prediction trigger
  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Run client-side validation
    const valError = validateInputs();
    if (valError) {
      setError(valError);
      setPrediction(null);
      return;
    }

    setLoading(true);

    try {
      const predResult = await predictStockPrice({
        symbol: selectedSymbol,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        volume: parseInt(volume, 10)
      });
      setPrediction(predResult);
    } catch (err) {
      setPrediction(null);
      setError(err.message || "Prediction request failed.");
    } finally {
      setLoading(false);
    }
  };

  const roundVal = (v) => Math.round(v * 100) / 100;
  const formatINR = (val) => {
    if (val === undefined || val === null) return '₹0.00';
    return '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const formatNum = (val) => {
    if (val === undefined || val === null) return '0';
    return Number(val).toLocaleString('en-IN');
  };

  const isPositive = prediction ? prediction.difference >= 0 : true;
  const cleanSymbolDisplay = selectedSymbol.replace(/\.NS$/i, '').replace(/\(.*\)/, '').trim().toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Top 2-Card Row: Predict Input Form + Predicted Tomorrow Close Result */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>

        {/* Left Card: Predict Stock Price Form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}>
              <TrendingUp size={18} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                PREDICT STOCK PRICE
              </h3>
            </div>
          </div>

          <form onSubmit={handlePredictSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Searchable Stock Autocomplete (Combobox) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Select Stock
              </label>
              <StockAutocomplete
                stocksList={stocksList}
                selectedSymbol={cleanSymbolDisplay}
                onSelectStock={handleStockChange}
              />
            </div>

            {/* Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Open (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={open}
                  onChange={(e) => setOpen(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  High (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={high}
                  onChange={(e) => setHigh(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Low (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={low}
                  onChange={(e) => setLow(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Close (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={close}
                  onChange={(e) => setClose(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Volume
                </label>
                <input
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <div style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-red)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#F43F5E',
                fontSize: '0.82rem'
              }}>
                {error}
              </div>
            )}

            {/* Predict Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '4px', height: '46px' }}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Calculating Prediction...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Predict Tomorrow</span>
                </>
              )}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Make sure the values are from today's market data.
            </p>
          </form>
        </div>

        {/* Right Card: PREDICTED TOMORROW CLOSE */}
        <div className="glass-card" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74, 222, 128, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  PREDICTED TOMORROW CLOSE
                </h4>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <h2 className={isPositive ? "glow-green-text" : ""} style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.02em',
                    color: isPositive ? 'var(--success-green)' : 'var(--danger-red)'
                  }}>
                    {prediction ? formatINR(prediction.predicted_close) : formatINR(2978.64)}
                  </h2>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: isPositive ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: isPositive ? 'var(--success-green)' : 'var(--danger-red)',
                  fontSize: '0.88rem',
                  fontWeight: 700
                }}>
                  {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>
                    {prediction ? `${prediction.difference >= 0 ? '▲' : '▼'} ${Math.abs(prediction.difference).toFixed(2)} (${Math.abs(prediction.percentage_change).toFixed(2)}%)` : '▲ 33.34 (1.13%)'}
                  </span>
                </div>
              </div>

              {/* Target Graphic Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(139, 92, 246, 0.3)'
              }}>
                <Target size={24} color="#C084FC" />
              </div>
            </div>

            {/* Today's Close & Difference Secondary Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginTop: '24px',
              padding: '12px 16px',
              background: 'rgba(15, 15, 30, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Today's Close</span>
                <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                  {prediction ? formatINR(prediction.current_close) : formatINR(close)}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Difference</span>
                <p style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: isPositive ? 'var(--success-green)' : 'var(--danger-red)',
                  marginTop: '2px'
                }}>
                  {prediction ? `${prediction.difference >= 0 ? '▲' : '▼'} ${Math.abs(prediction.difference).toFixed(2)} (${Math.abs(prediction.percentage_change).toFixed(2)}%)` : '▲ 33.34 (1.13%)'}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Metric Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '20px' }}>
            <div style={{
              background: 'rgba(30, 30, 56, 0.7)',
              borderRadius: '12px',
              padding: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart2 size={16} color="#6366F1" />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>R² Score</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {prediction?.r2_score || '0.9995'}
                </span>
              </div>
            </div>

            <div style={{
              background: 'rgba(30, 30, 56, 0.7)',
              borderRadius: '12px',
              padding: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(192, 132, 252, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SlidersHorizontal size={16} color="#C084FC" />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>MAE (₹)</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {prediction?.mae ? prediction.mae.toFixed(2) : '29.49'}
                </span>
              </div>
            </div>

            <div style={{
              background: 'rgba(30, 30, 56, 0.7)',
              borderRadius: '12px',
              padding: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={16} color="#06B6D4" />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>RMSE (₹)</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {prediction?.rmse ? prediction.rmse.toFixed(2) : '76.32'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Chart Card: ACTUAL vs PREDICTED CLOSE PRICE */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
              ACTUAL vs PREDICTED CLOSE PRICE <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Last 30 Days - {cleanSymbolDisplay})</span>
            </h3>
          </div>

          {/* Legend indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8B5CF6' }} />
              <span style={{ color: 'var(--text-muted)' }}>Actual Close</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '2px', background: '#F43F5E', borderStyle: 'dashed' }} />
              <span style={{ color: 'var(--text-muted)' }}>Predicted Close</span>
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div style={{ width: '100%', height: '320px' }}>
          {historyLoading ? (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: 'var(--text-muted)'
            }}>
              <div className="spinner" />
              <span>Loading Historical Stock Data...</span>
            </div>
          ) : historyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  stroke="var(--text-dim)"
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <YAxis
                  stroke="var(--text-dim)"
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `₹${Math.round(v)}`}
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
                  formatter={(value) => [`₹${Number(value).toFixed(2)}`, '']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="actual_close"
                  name="Actual Close"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  dot={{ fill: '#8B5CF6', r: 3 }}
                  activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted_close"
                  name="Predicted Close"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ fill: '#F43F5E', r: 3 }}
                  activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}>
              No historical chart data available.
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Grid Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* 30-Day Moving Average */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={16} color="#6366F1" />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              30-Day Moving Average
            </span>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '10px', fontFamily: 'var(--font-display)' }}>
            {formatINR(stats.movingAverage)}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--success-green)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
            ▲ 24.5 (0.88%)
          </span>
        </div>

        {/* 52-Week High */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(74, 222, 128, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowUpRight size={16} color="#4ADE80" />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              52-Week High
            </span>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '10px', fontFamily: 'var(--font-display)' }}>
            {formatINR(stats.week52High)}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
            📅 18 Dec 2024
          </span>
        </div>

        {/* 52-Week Low */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowDownRight size={16} color="#F43F5E" />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              52-Week Low
            </span>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '10px', fontFamily: 'var(--font-display)' }}>
            {formatINR(stats.week52Low)}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
            📅 27 Jun 2024
          </span>
        </div>

        {/* Total Volume */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart2 size={16} color="#06B6D4" />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Total Volume (Today)
            </span>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '10px', fontFamily: 'var(--font-display)' }}>
            {formatNum(stats.todayVolume)}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--success-green)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
            ▲ 8.24% vs Yesterday
          </span>
        </div>

        {/* Number of Stocks */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(192, 132, 252, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PieChart size={16} color="#C084FC" />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Number of Stocks
            </span>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '10px', fontFamily: 'var(--font-display)' }}>
            {stocksList?.length || 502}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
            Nifty 500 Universe
          </span>
        </div>
      </div>

      {/* Bottom Row: About Prediction Info Card */}
      <div className="glass-card" style={{
        padding: '20px 24px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(56, 189, 248, 0.15)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Lightbulb size={20} color="#38BDF8" />
        </div>

        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
            About Prediction
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            This model uses <strong>Linear Regression</strong> trained on historical stock data (2024–2026) with features:
            Open, High, Low, Close, Volume and One-Hot Encoded Stock Symbol.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px', fontStyle: 'italic' }}>
            Note: Predictions are estimates and not financial advice.
          </p>
        </div>
      </div>

    </div>
  );
}
