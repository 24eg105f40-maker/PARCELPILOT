// src/utils/helpers.js
// Utility functions for ParcelPilot

import { SERVICE_TYPES, STATUSES } from '../data/shipments';

export function generateTrackingId() {
  const year = new Date().getFullYear().toString().slice(-2);
  const rand4 = () => Math.floor(1000 + Math.random() * 9000);
  return `PP-20${year}-${rand4()}`;
}

export function generateUniqueTrackingId(existingIds) {
  let id;
  let tries = 0;
  do {
    id = generateTrackingId();
    tries++;
  } while (existingIds.includes(id) && tries < 50);
  return id;
}

export function calculateEstimatedDelivery(service, createdAt) {
  const base = createdAt ? new Date(createdAt) : new Date();
  const days = service === SERVICE_TYPES.EXPRESS ? 2
    : service === SERVICE_TYPES.STANDARD ? 5
    : 8; // Economy
  base.setDate(base.getDate() + days);
  return base.toISOString().split('T')[0];
}

export function calculateShippingFee(service, weight) {
  const kg = parseFloat(weight) || 1;
  const base = service === SERVICE_TYPES.EXPRESS ? 150
    : service === SERVICE_TYPES.STANDARD ? 90
    : 60;
  const perKg = service === SERVICE_TYPES.EXPRESS ? 80
    : service === SERVICE_TYPES.STANDARD ? 50
    : 30;
  return `₹${Math.round(base + perKg * kg)}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export function getStatusColor(status) {
  switch (status) {
    case STATUSES.PENDING_PICKUP: return 'status-pending';
    case STATUSES.PICKED_UP: return 'status-picked-up';
    case STATUSES.IN_TRANSIT: return 'status-in-transit';
    case STATUSES.OUT_FOR_DELIVERY: return 'status-out-for-delivery';
    case STATUSES.DELIVERED: return 'status-delivered';
    case STATUSES.EXCEPTION: return 'status-exception';
    default: return 'status-pending';
  }
}

export function needsAttention(shipment) {
  return shipment.status === STATUSES.EXCEPTION;
}

export function exportToCSV(shipments) {
  const headers = [
    'Tracking ID', 'Recipient Name', 'Recipient Email',
    'Origin', 'Destination', 'Status', 'Service',
    'Weight', 'Shipping Fee', 'Carrier', 'Estimated Delivery', 'Created At',
  ];
  const rows = shipments.map(s => [
    s.id,
    s.recipient.name,
    s.recipient.email,
    s.origin,
    s.destination,
    s.status,
    s.service,
    s.weight,
    s.shippingFee,
    s.carrier,
    s.estimatedDelivery,
    s.createdAt,
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `parcelpilot-shipments-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getNextStatuses(currentStatus) {
  switch (currentStatus) {
    case STATUSES.PENDING_PICKUP: return [STATUSES.PICKED_UP];
    case STATUSES.PICKED_UP: return [STATUSES.IN_TRANSIT];
    case STATUSES.IN_TRANSIT: return [STATUSES.OUT_FOR_DELIVERY, STATUSES.EXCEPTION];
    case STATUSES.OUT_FOR_DELIVERY: return [STATUSES.DELIVERED, STATUSES.EXCEPTION];
    case STATUSES.EXCEPTION: return [STATUSES.IN_TRANSIT, STATUSES.OUT_FOR_DELIVERY];
    case STATUSES.DELIVERED: return [];
    default: return [];
  }
}

export function createTimelineEvent(status, location) {
  const eventMap = {
    [STATUSES.PICKED_UP]: 'Package picked up by carrier',
    [STATUSES.IN_TRANSIT]: 'In transit to next facility',
    [STATUSES.OUT_FOR_DELIVERY]: 'Out for delivery',
    [STATUSES.DELIVERED]: 'Package delivered successfully',
    [STATUSES.EXCEPTION]: 'Exception: Delivery issue encountered',
  };
  return {
    id: `ev-${Date.now()}`,
    event: eventMap[status] || `Status updated to ${status}`,
    location: location || 'India Hub',
    timestamp: new Date().toISOString(),
    isLatest: true,
  };
}
