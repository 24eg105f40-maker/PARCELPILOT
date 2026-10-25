// src/pages/Overview.jsx
import { useState } from 'react';
import {
  Package, TrendingUp, CheckCircle, AlertTriangle,
  Plus, Download, ArrowRight, MapPin
} from 'lucide-react';
import { STATUSES } from '../data/shipments';
import { formatDate, needsAttention, exportToCSV } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';

export default function Overview({ shipments, activity, onCreateShipment, onNavigate }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  const total     = shipments.length;
  const inProg    = shipments.filter(s => [STATUSES.IN_TRANSIT, STATUSES.OUT_FOR_DELIVERY, STATUSES.PICKED_UP].includes(s.status)).length;
  const delivered = shipments.filter(s => s.status === STATUSES.DELIVERED).length;
  const attention = shipments.filter(needsAttention).length;

  const filtered = shipments.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.id.toLowerCase().includes(q) || s.recipient.name.toLowerCase().includes(q);
    const matchF = !filter || s.status === filter;
    return matchQ && matchF;
  }).slice(0, 8);

  const recentActivity = [...activity].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">India Operations — real-time demo dashboard</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => exportToCSV(shipments)} id="btn-export-overview">
            <Download size={15}/>Export Report
          </button>
          <button className="btn btn-primary" onClick={onCreateShipment} id="btn-create-overview">
            <Plus size={15}/>Create Shipment
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card indigo">
          <div className="kpi-top">
            <span className="kpi-label">Total Shipments</span>
            <div className="kpi-icon"><Package size={18}/></div>
          </div>
          <div className="kpi-value">{total}</div>
          <div className="kpi-sub">All time records</div>
        </div>
        <div className="kpi-card blue">
          <div className="kpi-top">
            <span className="kpi-label">In Progress</span>
            <div className="kpi-icon"><TrendingUp size={18}/></div>
          </div>
          <div className="kpi-value">{inProg}</div>
          <div className="kpi-sub">Active shipments</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-top">
            <span className="kpi-label">Delivered</span>
            <div className="kpi-icon"><CheckCircle size={18}/></div>
          </div>
          <div className="kpi-value">{delivered}</div>
          <div className="kpi-sub">{total > 0 ? Math.round(delivered/total*100) : 0}% delivery rate</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-top">
            <span className="kpi-label">Needs Attention</span>
            <div className="kpi-icon"><AlertTriangle size={18}/></div>
          </div>
          <div className="kpi-value">{attention}</div>
          <div className="kpi-sub">Exceptions requiring action</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Recent Shipments */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Shipments</span>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('shipments')} id="btn-view-all-shipments">
              View all <ArrowRight size={13}/>
            </button>
          </div>
          <div className="card-body-p0">
            <div style={{padding:'var(--space-4) var(--space-5)', borderBottom:'1px solid var(--clr-border-light)', display:'flex', gap:'var(--space-3)', flexWrap:'wrap'}}>
              <div className="search-wrap" style={{flex:1, minWidth:'160px'}}>
                <span className="search-icon" style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--clr-muted)'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </span>
                <input className="search-input" style={{fontSize:'13px'}} placeholder="Search ID or recipient…" value={search} onChange={e=>setSearch(e.target.value)} id="input-overview-search"/>
              </div>
              <select className="filter-select" style={{fontSize:'13px'}} value={filter} onChange={e=>setFilter(e.target.value)} id="select-overview-filter">
                <option value="">All Statuses</option>
                {Object.values(STATUSES).map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="table-wrap">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-title">No shipments found</div>
                  <div className="empty-state-sub">Try a different search or filter</div>
                </div>
              ) : (
                <table>
                  <thead><tr>
                    <th>Tracking ID</th><th>Recipient</th><th>Route</th><th>Status</th><th>Est. Delivery</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id} className="clickable" onClick={()=>onNavigate('shipments', s.id)}>
                        <td><span className="table-id">{s.id}</span></td>
                        <td>
                          <div className="table-name">{s.recipient.name}</div>
                          <div style={{fontSize:'12px',color:'var(--clr-muted)'}}>{s.recipient.email}</div>
                        </td>
                        <td>
                          <div className="table-city">
                            <MapPin size={12} style={{color:'var(--clr-muted)',flexShrink:0}}/>
                            <span style={{fontSize:'13px'}}>{s.origin} → {s.destination}</span>
                          </div>
                        </td>
                        <td><StatusBadge status={s.status}/></td>
                        <td className="table-date" style={{fontSize:'13px'}}>{formatDate(s.estimatedDelivery)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Activity Panel */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('activity')} id="btn-view-all-activity">
              View all <ArrowRight size={13}/>
            </button>
          </div>
          <div className="card-body">
            {recentActivity.map(act => (
              <ActivityEntry key={act.id} act={act} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityEntry({ act }) {
  const colorMap = {
    [STATUSES.IN_TRANSIT]: { bg: 'var(--clr-info-bg)', color: 'var(--clr-info)' },
    [STATUSES.OUT_FOR_DELIVERY]: { bg: 'var(--clr-purple-bg)', color: 'var(--clr-purple)' },
    [STATUSES.DELIVERED]: { bg: 'var(--clr-success-bg)', color: 'var(--clr-success)' },
    [STATUSES.PENDING_PICKUP]: { bg: 'var(--clr-warning-bg)', color: 'var(--clr-warning)' },
    [STATUSES.EXCEPTION]: { bg: 'var(--clr-danger-bg)', color: 'var(--clr-danger)' },
    [STATUSES.PICKED_UP]: { bg: 'var(--clr-indigo-light)', color: 'var(--clr-indigo)' },
  };
  const c = colorMap[act.status] || { bg: 'var(--clr-surface-2)', color: 'var(--clr-muted)' };
  const d = new Date(act.timestamp);
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="activity-item">
      <div className="activity-icon" style={{ background: c.bg, color: c.color }}>
        <Package size={15}/>
      </div>
      <div className="activity-content">
        <div className="activity-event">{act.event}</div>
        <div className="activity-meta">
          <span className="font-mono" style={{fontSize:'12px',color:'var(--clr-indigo)'}}>{act.trackingId}</span>
          {' · '}{act.recipient}
        </div>
        <div style={{fontSize:'12px',color:'var(--clr-muted)',marginTop:'2px'}}>{act.location}</div>
      </div>
      <div className="activity-time">{timeStr}</div>
    </div>
  );
}
