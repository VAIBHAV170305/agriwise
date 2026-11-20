import React, { useState, useEffect } from 'react';
import { 
  Users, Layers, ShoppingBag, DollarSign, Award, 
  MapPin, CheckCircle, RefreshCw, FileText
} from 'lucide-react';
import { api } from '../api';

export default function FpoDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFpoData();
  }, []);

  const loadFpoData = async () => {
    setLoading(true);
    try {
      const res = await api.getFpoOverview();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <RefreshCw className="animate-spin" size={32} color="var(--emerald-500)" />
      </div>
    );
  }

  const org = data?.organization || {};
  const metrics = data?.metrics || {};
  const inventory = data?.pooled_inventory || [];
  const members = data?.member_farmers || [];

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      {/* Header Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        padding: '28px 32px',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">FPO Cooperative Management</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reg: {org.registration_number}</span>
        </div>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginTop: '8px', fontFamily: "'Fraunces', serif" }}>{org.name}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '700px', marginTop: '6px' }}>
          {org.description}
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MEMBER FARMERS</span>
            <Users size={20} color="var(--forest-800)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
            {metrics.registered_members || 0}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--forest-800)', marginTop: '4px', fontWeight: 500 }}>
            Active Cooperative Producers
          </p>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>POOLED ACREAGE</span>
            <Layers size={20} color="var(--sage-500)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
            {metrics.pooled_acreage || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Acres</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--sage-500)', marginTop: '4px', fontWeight: 500 }}>
            Across {metrics.total_farms || 0} Managed Plots
          </p>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>POOLED HARVEST LOTS</span>
            <ShoppingBag size={20} color="var(--forest-800)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
            {metrics.active_produce_batches || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Lots</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Available for Bulk Procurement
          </p>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AGGREGATED SALES VALUE</span>
            <DollarSign size={20} color="var(--forest-800)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
            ₹{Number(metrics.total_sales_value || 0).toLocaleString()}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Executed FPO Contracts
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Left Column: Aggregated Produce Supply */}
        <div className="glass-card" style={{ padding: '26px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif", marginBottom: '8px' }}>
            Aggregated Produce Inventory (Bulk Supply)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Consolidated produce stock pooled across member smallholders for institutional procurement.
          </p>

          {inventory.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
              No active produce listed by member farmers currently.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {inventory.map((inv, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inv.category}</span>
                      <span className="badge badge-emerald">{inv.farmers_count} Farmer(s)</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Avg Benchmark Price: ₹{inv.avg_price}/{inv.unit}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-800)' }}>
                      {inv.total_quantity.toLocaleString()} {inv.unit}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pooled Volume</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Member Farmers Directory */}
        <div className="glass-card" style={{ padding: '26px' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif", marginBottom: '8px' }}>
            Member Farmers Directory
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Authorized smallholder growers associated with this cooperative.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {members.map(m => (
              <div 
                key={m.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email} • {m.phone || 'N/A'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-emerald">{m.status}</span>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>Member since {m.joined_at}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
