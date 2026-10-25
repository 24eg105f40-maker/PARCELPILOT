// src/pages/Tracking.jsx
import { useState } from 'react';
import { Search, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatDate, formatDateTime } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';
import { STATUSES } from '../data/shipments';
import { shipmentApi } from '../services/api';

const DEMO_IDS = ['PP-2048-7316', 'PP-2048-7315', 'PP-2048-7314', 'PP-2048-7313', 'PP-2048-7312'];

export default function Tracking({ shipments = [] }) {
  const [query, setQuery]       = useState('');
  const [result, setResult]     = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [dataSource, setDataSource] = useState('');

  const doSearch = async (id) => {
    const q = (id || query).trim().toUpperCase();
    if (!q) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);

    // Try live Backend API first
    try {
      const res = await shipmentApi.track(q);
      const data = res?.shipment || res;
      if (data && (data.trackingId || data.id)) {
        setResult(data);
        setNotFound(false);
        setDataSource('Live MongoDB Backend');
        setLoading(false);
        return;
      }
    } catch (err) {
      // If 404 from API
      if (err.response?.status === 404) {
        // Fallback to local props if match found
        const localFound = shipments.find(s => s.id?.toUpperCase() === q || s.trackingId?.toUpperCase() === q);
        if (localFound) {
          setResult(localFound);
          setNotFound(false);
          setDataSource('Demo Sample Cache');
          setLoading(false);
          return;
        }
        setNotFound(true);
        setLoading(false);
        return;
      }
      // If network / connection error, try local fallback
      const localFound = shipments.find(s => s.id?.toUpperCase() === q || s.trackingId?.toUpperCase() === q);
      if (localFound) {
        setResult(localFound);
        setNotFound(false);
        setDataSource('Local Cache');
        setLoading(false);
        return;
      }
      setNotFound(true);
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') doSearch(); };
  const chipClick = (id) => { setQuery(id); doSearch(id); };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Parcel Tracking</h1>
        <p className="page-subtitle">Public tracking portal — track any parcel in real time without login</p>
      </div>

      {/* Search Panel */}
      <div className="tracking-search-wrap">
        <p className="tracking-hero-title">Track Your Shipment</p>
        <p className="tracking-hero-sub">Enter your ParcelPilot tracking number below</p>
        <div className="tracking-input-row">
          <input
            id="input-tracking-id"
            className="tracking-input"
            placeholder="PP-2048-XXXX"
            value={query}
            onChange={e => { setQuery(e.target.value.toUpperCase()); setNotFound(false); }}
            onKeyDown={handleKey}
          />
          <button className="btn btn-primary btn-lg" onClick={() => doSearch()} disabled={loading} id="btn-track-search">
            {loading ? <span className="spinner" style={{width:'16px',height:'16px',borderWidth:'2px'}}/> : <><Search size={15}/>Track</>}
          </button>
        </div>
        <div className="demo-ids">
          <span style={{fontSize:'12px',color:'var(--clr-muted)',alignSelf:'center'}}>Demo IDs:</span>
          {DEMO_IDS.map(id => (
            <button key={id} className="demo-id-chip" onClick={() => chipClick(id)} id={`chip-${id}`}>{id}</button>
          ))}
        </div>
      </div>

      {/* Not Found */}
      {notFound && (
        <div className="card">
          <div className="empty-state">
            <Search size={40} className="empty-state-icon"/>
            <div className="empty-state-title">Tracking ID not found</div>
            <div className="empty-state-sub">
              No shipment found for <strong>{query}</strong>. Please check the ID and try again.
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && <TrackingResult shipment={result} dataSource={dataSource} />}
    </div>
  );
}

function TrackingResult({ shipment: s, dataSource }) {
  const trackingNumber = s.trackingId || s.id;
  const serviceType = s.serviceType || s.service;
  const recipientName = s.recipient?.name || s.recipientName || 'Authorized Recipient';
  const recipientEmail = s.recipient?.email || s.recipientEmail;
  const recipientPhone = s.recipient?.phone || s.recipientPhone;
  const timeline = s.timeline || s.trackingEvents || [];

  return (
    <div className="tracking-result">
      {/* Timeline */}
      <div>
        <div className="card" style={{marginBottom:'var(--space-5)'}}>
          <div className="card-header">
            <div>
              <div className="card-title">{trackingNumber}</div>
              <div style={{fontSize:'12px',color:'var(--clr-muted)',marginTop:'2px'}}>
                {s.origin} → {s.destination}
                {dataSource && (
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: '#38bdf8',
                  }}>
                    {dataSource}
                  </span>
                )}
              </div>
            </div>
            <StatusBadge status={s.status}/>
          </div>
          {s.exceptionMessage && (
            <div style={{padding:'0 var(--space-6)'}}>
              <div className="notice danger" style={{marginTop:'var(--space-4)'}}>
                <AlertTriangle size={15} style={{flexShrink:0}}/>
                <span>{s.exceptionMessage}</span>
              </div>
            </div>
          )}
          <div className="card-header" style={{background:'var(--clr-surface-2)', borderTop:'1px solid var(--clr-border-light)', borderBottom:'none', padding:'var(--space-3) var(--space-6)'}}>
            <span className="card-title" style={{fontSize:'13px',fontWeight:700}}>Shipment Timeline</span>
            <span style={{fontSize:'12px',color:'var(--clr-muted)'}}>Verified tracking milestone history</span>
          </div>
          <div className="timeline">
            {[...timeline].reverse().map((ev, i, arr) => (
              <div key={ev._id || ev.id || i} className="timeline-item">
                <div className="timeline-line-wrap">
                  <div className={`timeline-dot${ev.isLatest
                    ? s.status === STATUSES.DELIVERED ? ' delivered'
                    : s.status === STATUSES.EXCEPTION ? ' exception'
                    : ' latest' : ''}`}/>
                  {i < arr.length - 1 && <div className="timeline-connector"/>}
                </div>
                <div className="timeline-content">
                  <div className={`timeline-event${ev.isLatest ? ' latest' : ''}`}>
                    {ev.event || ev.title}
                    {ev.isLatest && <span className="latest-badge">Latest</span>}
                  </div>
                  <div className="timeline-location">
                    <MapPin size={11} style={{display:'inline',marginRight:'3px',color:'var(--clr-muted)'}}/>
                    {ev.location}
                  </div>
                  <div className="timeline-timestamp">{formatDateTime(ev.timestamp || ev.createdAt)}</div>
                  {ev.description && (
                    <div style={{fontSize:'12px',color:'var(--clr-muted)',marginTop:'3px'}}>{ev.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div style={{display:'flex',flexDirection:'column',gap:'var(--space-5)'}}>
        <div className="card">
          <div className="card-header"><span className="card-title">Shipment Details</span></div>
          <div className="card-body">
            <div className="info-grid">
              {[
                ['Tracking No.', <span className="info-val mono" key="tn">{trackingNumber}</span>],
                ['Status', <StatusBadge key="st" status={s.status}/>],
                ['From', s.origin],
                ['To', s.destination],
                ['Est. Delivery', formatDate(s.estimatedDelivery)],
                ['Service', serviceType],
                ['Weight', s.weight],
                ['Carrier', s.carrier],
                ['Shipping Fee', s.shippingFee],
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
          <div className="card-header">
            <span className="card-title">Recipient & Privacy</span>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-row">
                <span className="info-key">Name</span>
                <span className="info-val">{recipientName}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Email</span>
                <span className="info-val">
                  {recipientEmail || <span style={{fontStyle:'italic',color:'var(--clr-muted)'}}>Protected (sign in to view)</span>}
                </span>
              </div>
              <div className="info-row">
                <span className="info-key">Phone</span>
                <span className="info-val">
                  {recipientPhone || <span style={{fontStyle:'italic',color:'var(--clr-muted)'}}>Protected (sign in to view)</span>}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="notice info">
          <ShieldCheck size={15} style={{flexShrink:0}}/>
          <span>Public tracking sanitizes sensitive customer contacts in compliance with data privacy standards.</span>
        </div>
      </div>
    </div>
  );
}
