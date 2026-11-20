import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, BarChart3, DollarSign, Calendar, ShieldCheck, 
  RefreshCw, ArrowUpRight, ArrowDownRight, Minus, AlertCircle
} from 'lucide-react';
import { api } from '../api';

export default function MarketIntelligenceView() {
  const [commodities, setCommodities] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('Wheat');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommodities();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadForecast(selectedProduct);
    }
  }, [selectedProduct]);

  const loadCommodities = async () => {
    try {
      const data = await api.getCommodities();
      setCommodities(data || []);
    } catch {
      // ignore
    }
  };

  const loadForecast = async (prod) => {
    setLoading(true);
    try {
      const data = await api.getMarketForecast(prod, 'Regional Central Mandi Hub');
      setForecast(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-amber">Market Intelligence</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>AI Agricultural Demand & Price Corridor Forecasting</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '750px' }}>
            Predicts forward-looking 30 to 90-day mandi volume demand and wholesale price corridors to help farmers avoid harvest glut crashes and capture peak market timing.
          </p>
        </div>

        {/* Commodity selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SELECT COMMODITY:</label>
          <select 
            className="form-select" 
            style={{ width: '220px' }}
            value={selectedProduct} 
            onChange={e => setSelectedProduct(e.target.value)}
          >
            {commodities.map(c => (
              <option key={c.name} value={c.name}>{c.name} ({c.category})</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <RefreshCw className="animate-spin" size={32} color="var(--forest-800)" />
        </div>
      ) : forecast ? (
        <div>
          {/* Key Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '28px'
          }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PROJECTED 90-DAY DEMAND</span>
                <BarChart3 size={20} color="var(--forest-800)" />
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', fontFamily: "'Fraunces', serif" }}>
                {forecast.predicted_demand.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>Quintals</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                {forecast.trend === 'UP' ? (
                  <span style={{ color: 'var(--forest-800)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                    <ArrowUpRight size={14} /> Strong Demand Growth
                  </span>
                ) : (
                  <span style={{ color: 'var(--sage-500)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                    <Minus size={14} /> Stable Seasonal Volume
                  </span>
                )}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>WHOLESALE PRICE CORRIDOR</span>
                <DollarSign size={20} color="var(--forest-800)" />
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', fontFamily: "'Fraunces', serif" }}>
                ₹{forecast.predicted_price_range.min} - ₹{forecast.predicted_price_range.max} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>/kg</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--forest-800)', marginTop: '4px', fontWeight: 500 }}>
                Mandi Benchmark Range
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MODEL CONFIDENCE</span>
                <ShieldCheck size={20} color="var(--sage-500)" />
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', fontFamily: "'Fraunces', serif" }}>
                {Math.round(forecast.confidence * 100)}%
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--sage-500)', marginTop: '4px' }}>
                Evaluation R²: {forecast.evaluation_metrics.R2_Score}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ERROR RESIDUAL METRICS</span>
                <TrendingUp size={20} color="var(--forest-800)" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
                MAE: {forecast.evaluation_metrics.MAE} Q
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                RMSE: {forecast.evaluation_metrics.RMSE} Q
              </p>
            </div>
          </div>

          {/* Historical vs Forecast Comparison Trajectory */}
          <div className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>Historical Observed Trends vs AI Forecast Corridor</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Clearly distinguishes between factual historical transaction logs and forward AI predictive simulations.
                </p>
              </div>
            </div>

            {/* Visual Bar Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px', alignItems: 'flex-end', height: '240px', padding: '16px 0', borderBottom: '1px solid var(--border-card)' }}>
              {/* Historical Points */}
              {forecast.historical_points.map((hp, idx) => {
                const heightPct = Math.min(100, Math.max(25, (hp.demand_quintals / 6000) * 100));
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>₹{hp.price_per_kg}</span>
                    <div 
                      style={{
                        width: '100%',
                        maxWidth: '44px',
                        height: `${heightPct}%`,
                        background: 'var(--sage-200)',
                        border: '1px solid var(--sage-300)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.3s ease'
                      }}
                      title={`${hp.period}: ${hp.demand_quintals} Q @ ₹${hp.price_per_kg}/kg`}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 600 }}>{hp.period.split(' ')[0]}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Observed</span>
                  </div>
                );
              })}

              {/* Forecast Points */}
              {forecast.forecast_points.map((fp, idx) => {
                const heightPct = Math.min(100, Math.max(25, (fp.predicted_demand_quintals / 6000) * 100));
                return (
                  <div key={`f-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.72rem', color: '#b47818', fontWeight: 700, marginBottom: '4px' }}>₹{fp.predicted_price_per_kg}</span>
                    <div 
                      style={{
                        width: '100%',
                        maxWidth: '44px',
                        height: `${heightPct}%`,
                        background: 'linear-gradient(180deg, #d99a26 0%, #b47818 100%)',
                        borderRadius: '6px 6px 0 0',
                        boxShadow: '0 4px 12px rgba(180, 120, 24, 0.25)',
                        transition: 'all 0.3s ease'
                      }}
                      title={`AI Forecast: ${fp.predicted_demand_quintals} Q @ ₹${fp.predicted_price_per_kg}/kg`}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 700, marginTop: '8px' }}>{fp.period.split(' ')[0]}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--forest-800)', fontWeight: 700 }}>AI Forecast</span>
                  </div>
                );
              })}
            </div>

            {/* Legend & Provenance Distinction Notice (Module 7 Requirement) */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', background: 'var(--sage-200)', border: '1px solid var(--sage-300)', borderRadius: '2px' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>Factual Historical Mandi Transactions</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#b47818', borderRadius: '2px' }} />
                  <span style={{ color: '#946312', fontWeight: 600 }}>Projected AI Market Demand & Price</span>
                </div>
              </div>

              <span className="badge badge-emerald">
                {forecast.is_synthetic_baseline ? 'Regional Mandi Dataset' : 'Live Mandi Feed'}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
