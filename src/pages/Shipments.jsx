// src/pages/Shipments.jsx
import { useState, useEffect } from 'react';
import { Plus, Download, Search, MapPin, Eye, RefreshCw, ChevronLeft, AlertTriangle } from 'lucide-react';
import { STATUSES } from '../data/shipments';
import { formatDate, formatDateTime, exportToCSV } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';
import CreateShipmentModal from '../components/CreateShipmentModal';
import UpdateStatusModal from '../components/UpdateStatusModal';

export default function Shipments({ shipments, onCreated, onStatusUpdate, initialId }) {
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('');
  const [createOpen, setCreateOpen]   = useState(false);
  const [selected, setSelected]       = useState(null);
  const [updateOpen, setUpdateOpen]   = useState(false);
  const [detailOpen, setDetailOpen]   = useState(false);

  // Open detail panel if navigated with an ID
  useEffect(() => {
    if (initialId) {
      const s = shipments.find(x => x.id === initialId);
      if (s) { setSelected(s); setDetailOpen(true); }
    }
  }, [initialId, shipments]);

  const filtered = shipments.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.id.toLowerCase().includes(q) || s.recipient.name.toLowerCase().includes(q);
    const matchF = !filter || s.status === filter;
    return matchQ && matchF;
  });

  // Sync selected when shipments update
  useEffect(() => {
    if (selected) {
      const updated = shipments.find(s => s.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [shipments]);

  const openDetail = (s) => { setSelected(s); setDetailOpen(true); };
  const closeDetail = () => { setDetailOpen(false); setSelected(null); };

  return (
    <div>
      {/* Header */}
      {!detailOpen && (
        <>
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Shipments</h1>
              <p className="page-subtitle">{shipments.length} total records · {filtered.length} shown</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-secondary" onClick={() => exportToCSV(shipments)} id="btn-export-shipments">
                <Download size={15}/>Export CSV
              </button>
              <button className="btn btn-primary" onClick={() => setCreateOpen(true)} id="btn-create-shipment">
                <Plus size={15}/>New Shipment
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="search-wrap">
              <Search size={14} className="search-icon" />
              <input
                className="search-input"
                placeholder="Search by tracking ID or recipient name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="input-shipments-search"
              />
            </div>
            <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)} id="select-shipments-filter">
              <option value="">All Statuses</option>
              {Object.values(STATUSES).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="card">
            <div className="card-body-p0">
              <div className="table-wrap">
                {filtered.length === 0 ? (
                  <div className="empty-state">
                    <Search size={36} className="empty-state-icon"/>
                    <div className="empty-state-title">No shipments found</div>
                    <div className="empty-state-sub">Adjust your search or create a new shipment</div>
                  </div>
                ) : (
                  <table>
                    <thead><tr>
                      <th>Tracking ID</th><th>Recipient</th><th>Route</th>
                      <th>Service</th><th>Status</th><th>Est. Delivery</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                      {filtered.map(s => (
                        <tr key={s.id}>
                          <td><span className="table-id">{s.id}</span></td>
                          <td>
                            <div className="table-name">{s.recipient.name}</div>
                            <div style={{fontSize:'12px',color:'var(--clr-muted)'}}>{s.recipient.email}</div>
                          </td>
                          <td>
                            <div className="table-city">
                              <MapPin size={12} style={{color:'var(--clr-muted)'}}/>
                              <span style={{fontSize:'13px'}}>{s.origin} → {s.destination}</span>
                            </div>
                          </td>
                          <td><span style={{fontSize:'13px',color:'var(--clr-slate)'}}>{s.service}</span></td>
                          <td><StatusBadge status={s.status}/></td>
                          <td className="table-date" style={{fontSize:'13px'}}>{formatDate(s.estimatedDelivery)}</td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => openDetail(s)}
                                id={`btn-detail-${s.id}`}
                                title="View details"
                              ><Eye size={13}/></button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => { setSelected(s); setUpdateOpen(true); }}
                                id={`btn-update-${s.id}`}
                                title="Update status"
                              ><RefreshCw size={13}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Detail Panel */}
      {detailOpen && selected && (
        <ShipmentDetail
          shipment={selected}
          onBack={closeDetail}
          onUpdateStatus={() => setUpdateOpen(true)}
        />
      )}

      {/* Modals */}
      {createOpen && (
        <CreateShipmentModal
          shipments={shipments}
          onClose={() => setCreateOpen(false)}
          onCreated={(s) => { onCreated(s); setCreateOpen(false); }}
        />
      )}
      {updateOpen && selected && (
        <UpdateStatusModal
          shipment={selected}
          onClose={() => setUpdateOpen(false)}
          onUpdated={(id, status, loc) => { onStatusUpdate(id, status, loc); setUpdateOpen(false); }}
        />
      )}
    </div>
  );
}

function ShipmentDetail({ shipment: s, onBack, onUpdateStatus }) {
  return (
    <div>
      <div className="page-header-row" style={{marginBottom:'var(--space-6)'}}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={onBack} style={{marginBottom:'var(--space-3)'}} id="btn-back-detail">
            <ChevronLeft size={15}/> Back to Shipments
          </button>
          <h1 className="page-title">{s.id}</h1>
          <p className="page-subtitle">{s.recipient.name} · {s.origin} → {s.destination}</p>
        </div>
        <button className="btn btn-primary" onClick={onUpdateStatus} id="btn-update-detail">
          <RefreshCw size={14}/> Update Status
        </button>
      </div>

      {s.exceptionMessage && (
        <div className="notice danger" style={{marginBottom:'var(--space-5)'}}>
          <AlertTriangle size={16} style={{flexShrink:0}}/>
          <span>{s.exceptionMessage}</span>
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-5)', marginBottom:'var(--space-5)'}}>
        <div className="card">
          <div className="card-header"><span className="card-title">Shipment Info</span></div>
          <div className="card-body">
            <div className="info-grid">
              {[
                ['Status', <StatusBadge key="sb-detail" status={s.status}/>],
                ['Tracking ID', <span key="ti-detail" className="info-val mono">{s.id}</span>],
                ['Origin', s.origin],
                ['Destination', s.destination],
                ['Service', s.service],
                ['Weight', s.weight],
                ['Shipping Fee', s.shippingFee],
                ['Carrier', s.carrier],
                ['Est. Delivery', formatDate(s.estimatedDelivery)],
                ['Created', formatDateTime(s.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="info-row">
                  <span className="info-key">{k}</span>
                  {typeof v === 'string' ? <span className="info-val">{v}</span> : v}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Recipient</span></div>
          <div className="card-body">
            <div className="info-grid">
              {[
                ['Name', s.recipient.name],
                ['Email', s.recipient.email],
                ['Phone', s.recipient.phone],
              ].map(([k, v]) => (
                <div key={k} className="info-row">
                  <span className="info-key">{k}</span>
                  <span className="info-val">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="card-header"><span className="card-title">Tracking Timeline</span></div>
        <div className="timeline">
          {[...s.timeline].reverse().map((ev, i, arr) => (
            <div key={ev.id} className="timeline-item">
              <div className="timeline-line-wrap">
                <div className={`timeline-dot${ev.isLatest ? (s.status === 'Delivered' ? ' delivered' : s.status === 'Exception' ? ' exception' : ' latest') : ''}`}/>
                {i < arr.length - 1 && <div className="timeline-connector"/>}
              </div>
              <div className="timeline-content">
                <div className={`timeline-event${ev.isLatest ? ' latest' : ''}`}>
                  {ev.event}
                  {ev.isLatest && <span className="latest-badge">Latest</span>}
                </div>
                <div className="timeline-location">{ev.location}</div>
                <div className="timeline-timestamp">{formatDateTime(ev.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
