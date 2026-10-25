// src/pages/ActivityLog.jsx
import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { STATUSES } from '../data/shipments';
import { formatDateTime } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';

const STATUS_ICONS = {
  [STATUSES.PENDING_PICKUP]:     { Icon: Clock,         bg: 'var(--clr-warning-bg)',  color: 'var(--clr-warning)' },
  [STATUSES.PICKED_UP]:          { Icon: Package,       bg: 'var(--clr-indigo-light)',color: 'var(--clr-indigo)' },
  [STATUSES.IN_TRANSIT]:         { Icon: Truck,         bg: 'var(--clr-info-bg)',     color: 'var(--clr-info)' },
  [STATUSES.OUT_FOR_DELIVERY]:   { Icon: Truck,         bg: 'var(--clr-purple-bg)',   color: 'var(--clr-purple)' },
  [STATUSES.DELIVERED]:          { Icon: CheckCircle,   bg: 'var(--clr-success-bg)',  color: 'var(--clr-success)' },
  [STATUSES.EXCEPTION]:          { Icon: AlertTriangle, bg: 'var(--clr-danger-bg)',   color: 'var(--clr-danger)' },
};

export default function ActivityLog({ activity }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  const sorted = [...activity].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filtered = sorted.filter(act => {
    const q = search.toLowerCase();
    const matchQ = !q || act.trackingId.toLowerCase().includes(q)
      || act.recipient.toLowerCase().includes(q)
      || act.event.toLowerCase().includes(q);
    const matchF = !filter || act.status === filter;
    return matchQ && matchF;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Activity Log</h1>
        <p className="page-subtitle">All shipment events · {filtered.length} entries shown</p>
      </div>

      <div className="notice info" style={{marginBottom:'var(--space-5)'}}>
        <Package size={15} style={{flexShrink:0}}/>
        <span>Events are generated from demo sample data and simulated status updates. Entries marked with sample data are illustrative only.</span>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search by ID, recipient or event…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="input-activity-search"
          />
        </div>
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)} id="select-activity-filter">
          <option value="">All Statuses</option>
          {Object.values(STATUSES).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="card-body">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Search size={36} className="empty-state-icon"/>
              <div className="empty-state-title">No activity found</div>
              <div className="empty-state-sub">Try a different search or filter</div>
            </div>
          ) : (
            filtered.map(act => {
              const si = STATUS_ICONS[act.status] || STATUS_ICONS[STATUSES.PICKED_UP];
              const { Icon } = si;
              return (
                <div key={act.id} className="activity-item">
                  <div
                    className="activity-icon"
                    style={{ background: si.bg, color: si.color }}
                  >
                    <Icon size={15}/>
                  </div>
                  <div className="activity-content" style={{flex:1}}>
                    <div className="activity-event">{act.event}</div>
                    <div className="activity-meta" style={{display:'flex',gap:'var(--space-3)',flexWrap:'wrap',marginTop:'4px'}}>
                      <span className="font-mono" style={{fontSize:'12px',color:'var(--clr-indigo)',fontWeight:600}}>{act.trackingId}</span>
                      <span style={{color:'var(--clr-muted)'}}>·</span>
                      <span style={{fontSize:'12.5px',fontWeight:600,color:'var(--clr-navy)'}}>{act.recipient}</span>
                    </div>
                    <div style={{fontSize:'12px',color:'var(--clr-muted)',marginTop:'3px',display:'flex',alignItems:'center',gap:'4px'}}>
                      <MapPin size={11}/>
                      {act.location}
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'var(--space-2)',flexShrink:0}}>
                    <StatusBadge status={act.status}/>
                    <span style={{fontSize:'12px',color:'var(--clr-muted)',whiteSpace:'nowrap'}}>{formatDateTime(act.timestamp)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
