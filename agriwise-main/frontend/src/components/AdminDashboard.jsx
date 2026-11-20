import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Database, Activity, Lock, 
  Unlock, RefreshCw, CheckCircle, AlertTriangle, FileText
} from 'lucide-react';
import { api } from '../api';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, uRes, lRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAllUsers(),
        api.getAuditLogs()
      ]);
      setMetrics(mRes);
      setUsers(uRes || []);
      setAuditLogs(lRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.toggleUserStatus(userId, newStatus);
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      loadAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <RefreshCw className="animate-spin" size={32} color="var(--emerald-500)" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px 0' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald">Platform Administration</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>RBAC Tier 1 Access</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>System Health, User Governance & Audit Trail</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Platform-wide administrative controls, account access authorization, AI model invocation telemetry, and immutable audit logs.
          </p>
        </div>

        <button className="btn-secondary" onClick={loadAdminData}>
          <RefreshCw size={16} /> Refresh Telemetry
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL REGISTERED USERS</span>
            <Users size={20} color="var(--forest-800)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
            {metrics?.total_users || 0}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--forest-800)', marginTop: '4px', fontWeight: 500 }}>
            Across 4 Authorized Roles
          </p>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FARMS & ACREAGE</span>
            <Database size={20} color="var(--sage-500)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
            {metrics?.farms_registered || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Farms</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--sage-500)', marginTop: '4px', fontWeight: 500 }}>
            Geocoded Land Records
          </p>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MARKETPLACE TURNOVER</span>
            <Activity size={20} color="var(--forest-800)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
            ₹{Number(metrics?.marketplace_orders?.gmv_turnover || 0).toLocaleString()}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {metrics?.marketplace_orders?.count || 0} Processed Orders
          </p>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AI INVOCATIONS</span>
            <ShieldCheck size={20} color="var(--sage-500)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', fontFamily: "'Fraunces', serif" }}>
            {(metrics?.ai_service_telemetry?.crop_recommendations_computed || 0) + (metrics?.ai_service_telemetry?.disease_vision_scans || 0)}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Crop ML + Vision Diagnostics
          </p>
        </div>
      </div>

      {/* User Governance Table */}
      <div className="glass-card" style={{ padding: '26px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif", marginBottom: '6px' }}>User Account Governance & Role RBAC</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          Enforces role-based permissions and account active/suspended state toggles.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px' }}>USER</th>
                <th style={{ padding: '12px 14px' }}>EMAIL</th>
                <th style={{ padding: '12px 14px' }}>ROLE</th>
                <th style={{ padding: '12px 14px' }}>STATUS</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <select 
                      className="form-select" 
                      style={{ padding: '4px 8px', fontSize: '0.78rem', width: '120px' }}
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="Farmer">Farmer</option>
                      <option value="Buyer">Buyer</option>
                      <option value="FPO">FPO</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${u.account_status === 'ACTIVE' ? 'badge-emerald' : 'badge-rose'}`}>
                      {u.account_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleToggleStatus(u.id, u.account_status)}
                    >
                      {u.account_status === 'ACTIVE' ? <Lock size={12} /> : <Unlock size={12} />}
                      {u.account_status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Logs Viewer */}
      <div className="glass-card" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontFamily: "'Fraunces', serif" }}>Security & Transaction Audit Trail</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Records all high-impact actions, authentication sessions, and contract creations without exposing credentials.
            </p>
          </div>
          <span className="badge badge-sky">{auditLogs.length} Events</span>
        </div>

        <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>ACTION</th>
                <th style={{ padding: '10px 12px' }}>ACTOR</th>
                <th style={{ padding: '10px 12px' }}>RESOURCE</th>
                <th style={{ padding: '10px 12px' }}>DETAILS</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--forest-800)' }}>{l.action}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>{l.actor_email}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{l.resource_type} #{l.resource_id || ''}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{l.details || '-'}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', textAlign: 'right' }}>{l.created_at.replace('T', ' ').slice(0, 19)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
