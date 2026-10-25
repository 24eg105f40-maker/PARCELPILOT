// src/components/CreateShipmentModal.jsx
import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import {
  generateUniqueTrackingId,
  calculateEstimatedDelivery,
  calculateShippingFee,
} from '../utils/helpers';
import { STATUSES, SERVICE_TYPES, INDIAN_CITIES, CARRIERS } from '../data/shipments';
import { shipmentApi } from '../services/api';

const EMPTY = {
  recipientName: '', recipientEmail: '', recipientPhone: '',
  origin: '', destination: '', service: SERVICE_TYPES.STANDARD, weight: '',
};

export default function CreateShipmentModal({ shipments = [], onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.recipientName.trim()) e.recipientName = 'Required';
    if (!form.recipientEmail.trim()) e.recipientEmail = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.recipientEmail)) e.recipientEmail = 'Invalid email';
    if (!form.origin) e.origin = 'Required';
    if (!form.destination) e.destination = 'Required';
    if (form.origin && form.destination && form.origin === form.destination) {
      e.destination = 'Destination must differ from origin';
    }
    if (!form.weight) e.weight = 'Required';
    else if (isNaN(parseFloat(form.weight)) || parseFloat(form.weight) <= 0) e.weight = 'Enter a valid weight';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');

    const weightFormatted = `${parseFloat(form.weight).toFixed(1)} kg`;

    try {
      // 1. Send to MongoDB Express API
      const response = await shipmentApi.create({
        recipientName: form.recipientName.trim(),
        recipientEmail: form.recipientEmail.trim(),
        recipientPhone: form.recipientPhone.trim() || 'N/A',
        origin: form.origin,
        destination: form.destination,
        service: form.service,
        weight: weightFormatted,
      });

      const created = response.shipment || response;
      setLoading(false);
      onCreated(created);
    } catch (err) {
      // If server error or unauthenticated, handle cleanly
      if (err.response?.status === 401) {
        setApiError('Session expired or unauthorized. Please sign in as staff or administrator to create shipments.');
        setLoading(false);
        return;
      }

      const msg = err.response?.data?.message || err.message;

      // If backend is offline, provide graceful offline fallback
      if (!err.response) {
        const existingIds = shipments.map(s => s.id || s.trackingId);
        const id = generateUniqueTrackingId(existingIds);
        const now = new Date().toISOString();

        const offlineShipment = {
          id,
          trackingId: id,
          recipient: {
            name: form.recipientName.trim(),
            email: form.recipientEmail.trim(),
            phone: form.recipientPhone.trim() || 'N/A',
          },
          origin: form.origin,
          destination: form.destination,
          status: STATUSES.PENDING_PICKUP,
          service: form.service,
          weight: weightFormatted,
          estimatedDelivery: calculateEstimatedDelivery(form.service, now),
          createdAt: now,
          carrier: CARRIERS[Math.floor(Math.random() * CARRIERS.length)],
          shippingFee: calculateShippingFee(form.service, form.weight),
          timeline: [
            {
              id: `ev-${Date.now()}-1`,
              event: 'Shipment created',
              location: `${form.origin} Office`,
              timestamp: now,
              isLatest: false,
            },
            {
              id: `ev-${Date.now()}-2`,
              event: 'Awaiting pickup by carrier',
              location: `${form.origin} Pickup Point`,
              timestamp: new Date(Date.now() + 60000).toISOString(),
              isLatest: true,
            },
          ],
          exceptionMessage: null,
        };

        setLoading(false);
        onCreated(offlineShipment);
        return;
      }

      setApiError(msg || 'Failed to create shipment. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">Create New Shipment</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close" id="btn-close-modal"><X size={15}/></button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
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

            <div className="form-grid">
              {/* Recipient Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="f-name">Recipient Name<span className="required">*</span></label>
                <input id="f-name" className={`form-input${errors.recipientName ? ' error' : ''}`} placeholder="Arjun Mehta" value={form.recipientName} onChange={e => set('recipientName', e.target.value)} />
                {errors.recipientName && <span className="form-error">{errors.recipientName}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="f-email">Email<span className="required">*</span></label>
                <input id="f-email" type="email" className={`form-input${errors.recipientEmail ? ' error' : ''}`} placeholder="arjun@example.com" value={form.recipientEmail} onChange={e => set('recipientEmail', e.target.value)} />
                {errors.recipientEmail && <span className="form-error">{errors.recipientEmail}</span>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label" htmlFor="f-phone">Phone (optional)</label>
                <input id="f-phone" className="form-input" placeholder="+91 98765 43210" value={form.recipientPhone} onChange={e => set('recipientPhone', e.target.value)} />
              </div>

              {/* Origin */}
              <div className="form-group">
                <label className="form-label" htmlFor="f-origin">Origin City<span className="required">*</span></label>
                <select id="f-origin" className={`form-select${errors.origin ? ' error' : ''}`} value={form.origin} onChange={e => set('origin', e.target.value)}>
                  <option value="">Select city…</option>
                  {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.origin && <span className="form-error">{errors.origin}</span>}
              </div>

              {/* Destination */}
              <div className="form-group">
                <label className="form-label" htmlFor="f-dest">Destination City<span className="required">*</span></label>
                <select id="f-dest" className={`form-select${errors.destination ? ' error' : ''}`} value={form.destination} onChange={e => set('destination', e.target.value)}>
                  <option value="">Select city…</option>
                  {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.destination && <span className="form-error">{errors.destination}</span>}
              </div>

              {/* Service */}
              <div className="form-group">
                <label className="form-label" htmlFor="f-service">Service Type<span className="required">*</span></label>
                <select id="f-service" className="form-select" value={form.service} onChange={e => set('service', e.target.value)}>
                  <option value={SERVICE_TYPES.EXPRESS}>Express (1-2 days)</option>
                  <option value={SERVICE_TYPES.STANDARD}>Standard (3-5 days)</option>
                  <option value={SERVICE_TYPES.ECONOMY}>Economy (6-8 days)</option>
                </select>
              </div>

              {/* Weight */}
              <div className="form-group">
                <label className="form-label" htmlFor="f-weight">Parcel Weight (kg)<span className="required">*</span></label>
                <input id="f-weight" type="number" step="0.1" min="0.1" className={`form-input${errors.weight ? ' error' : ''}`} placeholder="1.5" value={form.weight} onChange={e => set('weight', e.target.value)} />
                {errors.weight && <span className="form-error">{errors.weight}</span>}
                {form.weight && !errors.weight && (
                  <span className="form-hint">Est. fee: {calculateShippingFee(form.service, form.weight)}</span>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} id="btn-cancel-modal">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="btn-submit-shipment">
              {loading ? 'Creating in MongoDB…' : 'Create Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
