import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PredictPage from './pages/PredictPage';
import MarketOverviewPage from './pages/MarketOverviewPage';
import AboutPage from './pages/AboutPage';
import { fetchHealth, fetchStocksUniverse } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('predict');
  const [stocksList, setStocksList] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setLoading(true);
    setBackendError(false);

    try {
      // 1. Check health & fetch metrics
      const healthRes = await fetchHealth().catch(() => null);
      if (healthRes?.metrics) {
        setModelMetrics(healthRes.metrics);
      }

      // 2. Fetch stock universe
      const stocksRes = await fetchStocksUniverse().catch(() => null);
      if (stocksRes?.stocks && stocksRes.stocks.length > 0) {
        setStocksList(stocksRes.stocks);
      } else {
        setBackendError(true);
      }
    } catch (err) {
      console.error("App init error:", err);
      setBackendError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStockToPredict = (symbol) => {
    setActivePage('predict');
  };

  const getHeaderProps = () => {
    switch (activePage) {
      case 'predict':
        return {
          title: "AI STOCK PRICE PREDICTION",
          subtitle: "Predict tomorrow's closing price using Linear Regression",
          highlightWord: "PREDICTION"
        };
      case 'market':
        return {
          title: "MARKET OVERVIEW",
          subtitle: "Real-time analytics and universe statistics from Nifty 500 dataset",
          highlightWord: "OVERVIEW"
        };
      case 'about':
        return {
          title: "ABOUT NEURASTOCK AI",
          subtitle: "Machine Learning model, dataset specifications, and feature engineering details",
          highlightWord: "NEURASTOCK"
        };
      default:
        return {
          title: "AI STOCK PRICE PREDICTION",
          subtitle: "Predict tomorrow's closing price using Linear Regression",
          highlightWord: "PREDICTION"
        };
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>

      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        modelMetrics={modelMetrics}
      />

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: '28px 36px',
        maxWidth: '1600px',
        margin: '0 auto',
        width: 'calc(100vw - 260px)'
      }}>
        <Header {...getHeaderProps()} />

        {/* Backend Unreachable Error Banner */}
        {backendError && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-red)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={24} color="#F43F5E" />
              <div>
                <strong style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>
                  Backend Server Offline
                </strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '2px' }}>
                  Unable to connect to FastAPI backend at <code style={{ color: '#C084FC' }}>http://localhost:8000</code>. Please ensure uvicorn is running.
                </p>
              </div>
            </div>

            <button
              onClick={initApp}
              style={{
                background: 'rgba(244, 63, 94, 0.2)',
                border: '1px solid #F43F5E',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Dynamic Page Routing */}
        {activePage === 'predict' && (
          <PredictPage
            stocksList={stocksList}
            setModelMetrics={setModelMetrics}
          />
        )}

        {activePage === 'market' && (
          <MarketOverviewPage
            onSelectStockToPredict={handleSelectStockToPredict}
          />
        )}

        {activePage === 'about' && (
          <AboutPage />
        )}
      </main>

    </div>
  );
}
