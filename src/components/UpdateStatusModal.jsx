// src/components/UpdateStatusModal.jsx
import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { INDIAN_CITIES } from '../data/shipments';
import { getNextStatuses } from '../utils/helpers';
import StatusBadge from './StatusBadge';
import { shipmentApi } from '../services/api';

export default function UpdateStatusModal({ shipment, onClose, onUpdated }) {
  const next = getNextStatuses(shipment.status);
  const [newStatus, setNewStatus] = useState(next[0] || '');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const trackingNumber = shipment.trackingId || shipment.id;

  if (next.length === 0) {
    return (
      <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="update-modal-title">
          <div className="modal-header">
            <h2 className="modal-title" id="update-modal-title">Update Status</h2>
            <button className="close-btn" onClick={onClose} aria-label="Close"><X size={15}/></button>
          </div>
          <div className="modal-body">
            <p style={{color:'var(--clr-muted)', fontSize:'14px'}}>
              This shipment has been <strong>Delivered</strong> and cannot be updated further.
            </p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setLoading(true);
    setApiError('');

    try {
      // 1. Send update to MongoDB backend API
      const res = await shipmentApi.updateStatus(
        trackingNumber,
        newStatus,
        location || undefined,
        description || undefined
      );

      const updatedShipment = res.shipment || res;
      setLoading(false);
      onUpdated(trackingNumber, newStatus, location, updatedShipment);
    } catch (err) {
      if (err.response?.status === 401) {
        setApiError('Unauthorized. Only authenticated staff and administrators can update status.');
        setLoading(false);
        return;
      }

      // If offline, provide fallback
      if (!err.response) {
        setLoading(false);
        onUpdated(trackingNumber, newStatus, location);
        return;
      }

      const msg = err.response?.data?.message || err.message;
      setApiError(msg || 'Failed to update status on server.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="update-modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="update-modal-title">Update Shipment Status</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close" id="btn-close-update"><X size={15}/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {apiError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '13px',
                marginBottom: '16px',
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{apiError}</span>
              </div>
            )}

            <div className="info-row" style={{marginBottom:'var(--space-4)'}}>
              <span className="info-key">Tracking ID</span>
              <span className="info-val mono">{trackingNumber}</span>
            </div>
            <div className="info-row" style={{marginBottom:'var(--space-5)'}}>
              <span className="info-key">Current Status</span>
              <StatusBadge status={shipment.status} />
            </div>

            <div className="form-group" style={{marginBottom:'var(--space-4)'}}>
              <label className="form-label" htmlFor="us-status">New Status<span className="required">*</span></label>
              <select id="us-status" className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)} required>
                {next.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group" style={{marginBottom:'var(--space-4)'}}>
              <label className="form-label" htmlFor="us-location">Location (optional)</label>
              <select id="us-location" className="form-select" value={location} onChange={e => setLocation(e.target.value)}>
                <option value="">Auto-detect transit hub…</option>
                {INDIAN_CITIES.map(c => <option key={c} value={`${c} Hub`}>{c} Hub</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="us-notes">Event Notes / Description (optional)</label>
              <input
                id="us-notes"
                className="form-input"
                placeholder="e.g. Scanned at warehouse sorting conveyor #4"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !newStatus} id="btn-confirm-status">
              {loading ? 'Updating in MongoDB…' : 'Confirm Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
