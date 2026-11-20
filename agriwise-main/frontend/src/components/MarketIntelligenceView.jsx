import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, BarChart3, DollarSign, Calendar, ShieldCheck, 
  RefreshCw, ArrowUpRight, ArrowDownRight, Minus, AlertCircle,
  MapPin, CheckCircle2, Search, Filter, Phone, Navigation, Landmark
} from 'lucide-react';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import WavyLoader from './WavyLoader';

export default function MarketIntelligenceView() {
  const { t } = useLanguage();
  const [commodities, setCommodities] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState('Wheat');
  const [selectedState, setSelectedState] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratesData, setRatesData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pre-defined quick commodities
  const POPULAR_COMMODITIES = [
    { key: 'Wheat', label: 'Wheat (गेहूं)' },
    { key: 'Rice (Basmati)', label: 'Basmati Rice (धान)' },
    { key: 'Mustard', label: 'Mustard (सरसों)' },
    { key: 'Tomato', label: 'Tomato (टमाटर)' },
    { key: 'Onion', label: 'Onion (प्याज)' },
    { key: 'Potato', label: 'Potato (आलू)' },
    { key: 'Cotton', label: 'Cotton (कपास)' },
    { key: 'Chickpea (Chana)', label: 'Chana (चना)' },
    { key: 'Soybean', label: 'Soybean (सोयाबीन)' },
    { key: 'Maize', label: 'Maize (मक्का)' }
  ];

  const INDIAN_STATES_FILTER = [
    'All', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Gujarat', 
    'Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Delhi', 'Bihar'
  ];

  useEffect(() => {
    loadCommodities();
  }, []);

  useEffect(() => {
    if (selectedCommodity) {
      loadMandiRates(selectedCommodity, selectedState, searchQuery);
    }
  }, [selectedCommodity, selectedState]);

  const loadCommodities = async () => {
    try {
      const data = await api.getCommodities();
      if (data && data.length > 0) {
        setCommodities(data);
      }
    } catch {
      // ignore
    }
  };

  const loadMandiRates = async (commodity, state, search) => {
    setLoading(true);
    try {
      const data = await api.getMandiRates(commodity, state, search);
      setRatesData(data);
    } catch (err) {
      console.error('Error loading mandi rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMandiRates(selectedCommodity, selectedState, searchQuery);
  };

  const ratesList = ratesData?.rates || [];

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0 60px' }}>
      {/* Title & Authentic Mandi Feed Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2d6a4f', display: 'inline-block' }} />
              Live APMC Mandi Feeds • Agmarknet Verified
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Updated Today: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <h2 style={{ fontSize: '1.85rem', color: 'var(--text-primary)', margin: '4px 0 6px', fontFamily: "'Fraunces', serif" }}>
            Live Mandi Bhav & Market Rates
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '780px', margin: 0 }}>
            Real-time APMC auction rates, physical arrivals, and official MSP benchmarks.
          </p>
        </div>

        <button 
          onClick={() => loadMandiRates(selectedCommodity, selectedState, searchQuery)}
          className="btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Rates</span>
        </button>
      </div>

      {/* Commodity Quick Selector Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '20px',
        scrollbarWidth: 'thin'
      }}>
        {POPULAR_COMMODITIES.map(c => {
          const isSelected = selectedCommodity === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setSelectedCommodity(c.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                border: isSelected ? '1.5px solid #163326' : '1px solid rgba(27, 56, 43, 0.12)',
                background: isSelected ? '#163326' : '#ffffff',
                color: isSelected ? '#ffffff' : '#4a5e52',
                fontSize: '0.82rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 2px 8px rgba(22, 51, 38, 0.18)' : 'none'
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Search & State Filter Controls */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--forest-800)" />
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              STATE FILTER:
            </label>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="form-select"
              style={{ width: '170px', padding: '6px 12px', fontSize: '0.84rem' }}
            >
              {INDIAN_STATES_FILTER.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Indian States' : s}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Mandi name (e.g. Meerut, Azadpur, Khanna, Lasalgaon)..."
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.84rem' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.84rem' }}>
            Filter Mandis
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <WavyLoader label={`Fetching latest ${selectedCommodity} APMC Mandi rates...`} />
        </div>
      ) : ratesData ? (
        <div>
          {/* 4 Key Honest Metrics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '28px'
          }}>
            {/* Modal Benchmark */}
            <div className="glass-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  National Modal Benchmark
                </span>
                <DollarSign size={18} color="var(--forest-800)" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
                ₹{ratesData.national_avg_modal_quintal?.toLocaleString()} <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-muted)' }}>/Quintal</span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--forest-800)', marginTop: '4px', fontWeight: 600 }}>
                ₹{ratesData.national_avg_modal_kg} per kg wholesale
              </div>
            </div>

            {/* Official MSP Benchmark */}
            <div className="glass-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Govt Minimum Support Price (MSP)
                </span>
                <Landmark size={18} color="#2d6a4f" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
                {ratesData.msp_benchmark_quintal > 0 ? (
                  <>₹{ratesData.msp_benchmark_quintal?.toLocaleString()} <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-muted)' }}>/Quintal</span></>
                ) : (
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Market Driven</span>
                )}
              </div>
              <div style={{ marginTop: '6px' }}>
                {ratesData.msp_benchmark_quintal > 0 ? (
                  ratesData.national_avg_modal_quintal >= ratesData.msp_benchmark_quintal ? (
                    <span className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>
                      +₹{Math.round(ratesData.national_avg_modal_quintal - ratesData.msp_benchmark_quintal)}/Q Above MSP
                    </span>
                  ) : (
                    <span className="badge badge-critical" style={{ fontSize: '0.74rem' }}>
                      Below MSP Threshold
                    </span>
                  )
                ) : (
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Perishable Horticulture</span>
                )}
              </div>
            </div>

            {/* Total Daily Physical Arrivals */}
            <div className="glass-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Daily Mandi Physical Arrivals
                </span>
                <BarChart3 size={18} color="var(--forest-800)" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
                {ratesData.total_daily_arrivals_quintals?.toLocaleString()} <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-muted)' }}>Quintals</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Across {ratesData.total_reporting_mandis} reporting APMC yards
              </div>
            </div>

            {/* Price Spread Range */}
            <div className="glass-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Mandi Price Spread
                </span>
                <TrendingUp size={18} color="#b47818" />
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px', fontFamily: "'Fraunces', serif" }}>
                ₹{ratesData.lowest_mandi_modal_quintal?.toLocaleString()} - ₹{ratesData.highest_mandi_modal_quintal?.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b47818', marginTop: '4px', fontWeight: 600 }}>
                Spread: ₹{Math.round(ratesData.highest_mandi_modal_quintal - ratesData.lowest_mandi_modal_quintal)}/Quintal
              </div>
            </div>
          </div>

          {/* Mandi Price Comparison Bar Chart */}
          {ratesList.length > 0 && (
            <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontFamily: "'Fraunces', serif" }}>
                    Inter-Mandi Price Comparison ({selectedCommodity})
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                    Compare modal rates (₹/Quintal) across different Mandis to choose the best dispatch market.
                  </p>
                </div>
                <span className="badge badge-emerald">
                  Highest: ₹{ratesData.highest_mandi_modal_quintal}/Q
                </span>
              </div>

              {/* Visual Bars */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(ratesList.length, 6)}, 1fr)`,
                gap: '14px',
                alignItems: 'flex-end',
                height: '200px',
                padding: '16px 0 8px',
                borderBottom: '1px solid var(--border-card)'
              }}>
                {ratesList.slice(0, 6).map((r, idx) => {
                  const maxRate = ratesData.highest_mandi_modal_quintal || 3000;
                  const heightPct = Math.max(30, Math.min(100, (r.modal_price / maxRate) * 100));
                  const isTop = r.modal_price === ratesData.highest_mandi_modal_quintal;

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isTop ? '#163326' : 'var(--text-secondary)', marginBottom: '4px' }}>
                        ₹{r.modal_price}
                      </span>
                      <div 
                        style={{
                          width: '100%',
                          maxWidth: '48px',
                          height: `${heightPct}%`,
                          background: isTop ? 'linear-gradient(180deg, #2d6a4f 0%, #163326 100%)' : 'var(--sage-200)',
                          borderRadius: '6px 6px 0 0',
                          border: isTop ? '1.5px solid #163326' : '1px solid var(--sage-300)',
                          boxShadow: isTop ? '0 4px 12px rgba(22, 51, 38, 0.25)' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                        title={`${r.mandi_name}: ₹${r.modal_price}/Q (${r.daily_arrivals_quintals} Q arrivals)`}
                      />
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: isTop ? 800 : 600,
                        color: isTop ? '#163326' : 'var(--text-secondary)',
                        marginTop: '8px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '90px'
                      }}>
                        {r.district}
                      </span>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                        {r.state.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                <span>* Dark green bar indicates highest auction modal rate in the region</span>
                <span>Rates quoted per Quintal (100 kg)</span>
              </div>
            </div>
          )}

          {/* Full Mandi Rates Table */}
          <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, fontFamily: "'Fraunces', serif" }}>
                Active Mandi Auction Rates for {selectedCommodity}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Showing {ratesList.length} APMC yards
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(27, 56, 43, 0.1)', background: '#f8faf7' }}>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#163326' }}>Mandi / APMC Yard</th>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#163326' }}>Variety / Grade</th>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#163326', textAlign: 'right' }}>Daily Arrivals</th>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#163326', textAlign: 'right' }}>Min Price</th>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#163326', textAlign: 'right' }}>Modal Price</th>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#163326', textAlign: 'right' }}>Max Price</th>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#163326', textAlign: 'center' }}>Daily Trend</th>
                    <th style={{ padding: '12px 14px', fontWeight: 800, color: '#163326', textAlign: 'center' }}>MSP Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ratesList.map((r, idx) => {
                    const isPositive = r.price_change > 0;
                    const isZero = r.price_change === 0;

                    return (
                      <tr 
                        key={idx} 
                        style={{ 
                          borderBottom: '1px solid rgba(27, 56, 43, 0.06)',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#f7faf8'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 800, color: '#163326', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} color="#2d6a4f" />
                            {r.mandi_name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginLeft: '20px' }}>
                            {r.district}, {r.state} {r.distance_km ? `(${r.distance_km} km away)` : ''}
                          </div>
                        </td>

                        <td style={{ padding: '14px', color: '#4a5e52', fontWeight: 500 }}>
                          {r.variety}
                        </td>

                        <td style={{ padding: '14px', textAlign: 'right', fontWeight: 700, color: '#163326' }}>
                          {r.daily_arrivals_quintals.toLocaleString()} <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>Q</span>
                        </td>

                        <td style={{ padding: '14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                          ₹{r.min_price}
                        </td>

                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: '#163326' }}>
                            ₹{r.modal_price}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#2d6a4f', fontWeight: 600 }}>
                            (₹{r.modal_price_kg}/kg)
                          </div>
                        </td>

                        <td style={{ padding: '14px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                          ₹{r.max_price}
                        </td>

                        <td style={{ padding: '14px', textAlign: 'center' }}>
                          {isZero ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <Minus size={14} /> ₹0
                            </span>
                          ) : isPositive ? (
                            <span style={{ fontSize: '0.8rem', color: '#2d6a4f', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <ArrowUpRight size={14} /> +₹{r.price_change}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--crimson-600)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <ArrowDownRight size={14} /> -₹{Math.abs(r.price_change)}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '14px', textAlign: 'center' }}>
                          {r.msp_quintal > 0 ? (
                            r.above_msp ? (
                              <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                                Above MSP (+₹{Math.round(r.msp_difference)})
                              </span>
                            ) : (
                              <span className="badge badge-critical" style={{ fontSize: '0.72rem' }}>
                                Below MSP (-₹{Math.abs(Math.round(r.msp_difference))})
                              </span>
                            )
                          ) : (
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              N/A (Perishable)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Honest Transparent Data Policy Notice */}
          <div style={{
            background: '#f8faf7',
            border: '1px solid rgba(22, 51, 38, 0.1)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color="#2d6a4f" />
              <div style={{ fontSize: '0.82rem', color: '#4a5e52' }}>
                <strong style={{ color: '#163326' }}>Transparent Agronomic Standard:</strong> Rates are directly synchronized with official APMC daily auction records and Agmarknet feeds. Speculative 90-day AI predictions have been removed in accordance with transparent farmer data standards.
              </div>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#688273', fontWeight: 600 }}>
              Agmarknet & CACP Govt of India
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
