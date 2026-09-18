import React from 'react';
import { 
  Cpu, 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  Layers, 
  TrendingUp 
} from 'lucide-react';

export default function AboutPage({ theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Intro Overview Card */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
          }}>
            <TrendingUp size={24} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
              About NeuraStock AI
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              AI-driven Predictive Analytics Engine for Indian Equities (Nifty 500)
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          NeuraStock AI is an end-to-end Machine Learning web application designed to forecast tomorrow's 
          closing stock price across 500+ Indian public equities listed on the Nifty 500 index. By combining 
          historical price data, volume metrics, and one-hot categorical encoding with standardized numerical scaling, 
          the platform generates instant, quantitative price estimates.
        </p>
      </div>

      {/* Grid Row: Model Architecture + Feature Engineering */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Model Architecture */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Cpu size={22} color="var(--accent-magenta)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Machine Learning Model
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <div style={{ padding: '12px', background: 'var(--bg-inner)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Algorithm</span>
              <strong style={{ color: 'var(--text-main)', fontSize: '0.98rem' }}>Multiple Linear Regression</strong>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-inner)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Target Variable</span>
              <strong style={{ color: 'var(--success-green)', fontSize: '0.98rem' }}>TARGET_CLOSE (Next Trading Day Close Price)</strong>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-inner)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Total Model Inputs</span>
              <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.98rem' }}>506 Exact Feature Columns</strong>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-inner)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Model Performance</span>
              <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-main)' }}>R²: <strong>0.9995</strong></span>
                <span style={{ color: 'var(--text-main)' }}>MAE: <strong>₹29.49</strong></span>
                <span style={{ color: 'var(--text-main)' }}>RMSE: <strong>₹76.32</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Engineering */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Layers size={22} color="var(--accent-cyan)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Feature Engineering Pipeline
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <div>
              <h5 style={{ color: 'var(--text-main)', fontSize: '0.92rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} color="var(--success-green)" /> Standardized Numerical Features (5)
              </h5>
              <p style={{ lineHeight: 1.4 }}>
                <code style={{ background: 'var(--bg-inner)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                  Close, High, Low, Open, Volume
                </code> 
                {" "}were scaled using a fitted <code style={{ color: 'var(--accent-magenta)' }}>StandardScaler</code> during training.
              </p>
            </div>

            <div>
              <h5 style={{ color: 'var(--text-main)', fontSize: '0.92rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} color="var(--success-green)" /> One-Hot Encoded Categorical Symbols (501)
              </h5>
              <p style={{ lineHeight: 1.4 }}>
                The <code style={{ color: 'var(--text-main)' }}>SYMBOL</code> column was transformed using 
                <code style={{ color: 'var(--accent-cyan)' }}> pd.get_dummies(drop_first=True)</code> to isolate individual stock variance.
              </p>
            </div>

            <div>
              <h5 style={{ color: 'var(--text-main)', fontSize: '0.92rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} color="var(--success-green)" /> Strict Feature Order Alignment
              </h5>
              <p style={{ lineHeight: 1.4 }}>
                Feature ordering is strictly enforced via <code style={{ color: 'var(--accent-magenta)' }}>columns.pkl</code> to guarantee input dimension compatibility.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Grid Row: Tech Stack + Limitations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Technology Stack */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Code size={22} color="var(--primary-purple)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Technology Stack
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
            <div style={{ padding: '12px', background: 'var(--bg-inner)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--accent-magenta)', display: 'block', marginBottom: '4px' }}>Backend API</strong>
              <span style={{ color: 'var(--text-muted)' }}>FastAPI & Uvicorn (Python)</span>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-inner)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--accent-cyan)', display: 'block', marginBottom: '4px' }}>Machine Learning</strong>
              <span style={{ color: 'var(--text-muted)' }}>scikit-learn & pandas</span>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-inner)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--success-green)', display: 'block', marginBottom: '4px' }}>Frontend UI</strong>
              <span style={{ color: 'var(--text-muted)' }}>React 18 & Vite</span>
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-inner)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--danger-red)', display: 'block', marginBottom: '4px' }}>Charts & Icons</strong>
              <span style={{ color: 'var(--text-muted)' }}>Recharts & Lucide Icons</span>
            </div>
          </div>
        </div>

        {/* Model Limitations & Financial Disclaimer */}
        <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <AlertTriangle size={22} color="var(--danger-red)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Model Limitations & Disclaimer
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <p>
              Linear Regression provides a baseline linear mapping between historical prices, volume, and stock symbols. 
              However, real-world financial markets are subject to random walk dynamics and non-linear external forces.
            </p>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Market sentiment, news, and geopolitical events are not captured in price inputs alone.</li>
              <li>Macroeconomic policy decisions, RBI interest rates, and inflation affect actual outcomes.</li>
              <li>Earnings reports, corporate announcements, and regulatory changes can induce non-linear price gaps.</li>
            </ul>
            <p style={{ marginTop: '6px', fontWeight: 600, color: 'var(--danger-red)' }}>
              ⚠️ NeuraStock AI is built strictly for academic and analytical demonstration. Do not use for financial trading without professional consultation.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
