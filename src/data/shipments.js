// src/data/shipments.js
// Sample shipment data for ParcelPilot demo
// NOTE: All data is simulated. This is not real courier telemetry.

export const SERVICE_TYPES = {
  EXPRESS: 'Express',
  STANDARD: 'Standard',
  ECONOMY: 'Economy',
};

export const STATUSES = {
  PENDING_PICKUP: 'Pending Pickup',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  EXCEPTION: 'Exception',
};

export const CARRIERS = ['ParcelPilot Express', 'FastShip India', 'SwiftMove Logistics'];

export const INDIAN_CITIES = [
  'Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai', 'Delhi',
  'Pune', 'Kochi', 'Kolkata', 'Ahmedabad', 'Jaipur',
  'Surat', 'Lucknow', 'Nagpur', 'Visakhapatnam', 'Indore',
];

// Simulated tracking timelines for demo shipments
const inTransitTimeline = [
  {
    id: 'ev-001',
    event: 'Package picked up',
    location: 'Hyderabad Hub, Telangana',
    timestamp: '2026-10-22T09:15:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-002',
    event: 'Departed origin facility',
    location: 'Hyderabad Hub, Telangana',
    timestamp: '2026-10-22T14:30:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-003',
    event: 'Arrived at transit hub',
    location: 'Pune Sorting Centre, Maharashtra',
    timestamp: '2026-10-23T08:45:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-004',
    event: 'In transit to destination',
    location: 'Mumbai Gateway, Maharashtra',
    timestamp: '2026-10-24T11:00:00+05:30',
    isLatest: true,
  },
];

const outForDeliveryTimeline = [
  {
    id: 'ev-101',
    event: 'Package picked up',
    location: 'Bengaluru Hub, Karnataka',
    timestamp: '2026-10-21T10:00:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-102',
    event: 'Departed origin facility',
    location: 'Bengaluru Hub, Karnataka',
    timestamp: '2026-10-21T17:00:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-103',
    event: 'Arrived at destination facility',
    location: 'Chennai Central Hub, Tamil Nadu',
    timestamp: '2026-10-24T06:30:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-104',
    event: 'Out for delivery',
    location: 'Chennai Local Depot, Tamil Nadu',
    timestamp: '2026-10-25T08:15:00+05:30',
    isLatest: true,
  },
];

const deliveredTimeline = [
  {
    id: 'ev-201',
    event: 'Package picked up',
    location: 'Mumbai Hub, Maharashtra',
    timestamp: '2026-10-18T09:00:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-202',
    event: 'Departed origin facility',
    location: 'Mumbai Hub, Maharashtra',
    timestamp: '2026-10-18T15:00:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-203',
    event: 'Arrived at transit hub',
    location: 'Kochi Sorting Centre, Kerala',
    timestamp: '2026-10-20T07:30:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-204',
    event: 'Out for delivery',
    location: 'Kochi Local Depot, Kerala',
    timestamp: '2026-10-21T09:00:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-205',
    event: 'Package delivered successfully',
    location: 'Kochi, Kerala',
    timestamp: '2026-10-21T14:22:00+05:30',
    isLatest: true,
  },
];

const pendingPickupTimeline = [
  {
    id: 'ev-301',
    event: 'Shipment created',
    location: 'Delhi Office, Delhi',
    timestamp: '2026-10-25T07:00:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-302',
    event: 'Awaiting pickup by carrier',
    location: 'Delhi Pickup Point, Delhi',
    timestamp: '2026-10-25T09:30:00+05:30',
    isLatest: true,
  },
];

const exceptionTimeline = [
  {
    id: 'ev-401',
    event: 'Package picked up',
    location: 'Pune Hub, Maharashtra',
    timestamp: '2026-10-20T10:00:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-402',
    event: 'Departed origin facility',
    location: 'Pune Hub, Maharashtra',
    timestamp: '2026-10-20T16:00:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-403',
    event: 'Arrived at transit hub',
    location: 'Ahmedabad Sorting Centre, Gujarat',
    timestamp: '2026-10-22T05:00:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-404',
    event: 'Delivery attempted — recipient unavailable',
    location: 'Jaipur Local Depot, Rajasthan',
    timestamp: '2026-10-23T11:30:00+05:30',
    isLatest: false,
  },
  {
    id: 'ev-405',
    event: 'Exception: Address not found. Package held at facility.',
    location: 'Jaipur Central Facility, Rajasthan',
    timestamp: '2026-10-24T09:00:00+05:30',
    isLatest: true,
  },
];

export const INITIAL_SHIPMENTS = [
  {
    id: 'PP-2048-7316',
    recipient: {
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      phone: '+91 98765 43210',
    },
    origin: 'Hyderabad',
    destination: 'Mumbai',
    status: STATUSES.IN_TRANSIT,
    service: SERVICE_TYPES.EXPRESS,
    weight: '2.4 kg',
    estimatedDelivery: '2026-10-26',
    createdAt: '2026-10-22T09:00:00+05:30',
    carrier: CARRIERS[0],
    shippingFee: '₹480',
    timeline: inTransitTimeline,
    exceptionMessage: null,
  },
  {
    id: 'PP-2048-7315',
    recipient: {
      name: 'Priya Krishnamurthy',
      email: 'priya.k@example.com',
      phone: '+91 87654 32109',
    },
    origin: 'Bengaluru',
    destination: 'Chennai',
    status: STATUSES.OUT_FOR_DELIVERY,
    service: SERVICE_TYPES.EXPRESS,
    weight: '1.1 kg',
    estimatedDelivery: '2026-10-25',
    createdAt: '2026-10-21T10:00:00+05:30',
    carrier: CARRIERS[1],
    shippingFee: '₹320',
    timeline: outForDeliveryTimeline,
    exceptionMessage: null,
  },
  {
    id: 'PP-2048-7314',
    recipient: {
      name: 'Sneha Iyer',
      email: 'sneha.iyer@example.com',
      phone: '+91 76543 21098',
    },
    origin: 'Mumbai',
    destination: 'Kochi',
    status: STATUSES.DELIVERED,
    service: SERVICE_TYPES.STANDARD,
    weight: '3.8 kg',
    estimatedDelivery: '2026-10-21',
    createdAt: '2026-10-18T08:45:00+05:30',
    carrier: CARRIERS[2],
    shippingFee: '₹560',
    timeline: deliveredTimeline,
    exceptionMessage: null,
  },
  {
    id: 'PP-2048-7313',
    recipient: {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      phone: '+91 65432 10987',
    },
    origin: 'Delhi',
    destination: 'Pune',
    status: STATUSES.PENDING_PICKUP,
    service: SERVICE_TYPES.ECONOMY,
    weight: '5.2 kg',
    estimatedDelivery: '2026-10-30',
    createdAt: '2026-10-25T07:00:00+05:30',
    carrier: CARRIERS[0],
    shippingFee: '₹390',
    timeline: pendingPickupTimeline,
    exceptionMessage: null,
  },
  {
    id: 'PP-2048-7312',
    recipient: {
      name: 'Kavya Reddy',
      email: 'kavya.reddy@example.com',
      phone: '+91 54321 09876',
    },
    origin: 'Pune',
    destination: 'Jaipur',
    status: STATUSES.EXCEPTION,
    service: SERVICE_TYPES.STANDARD,
    weight: '0.9 kg',
    estimatedDelivery: '2026-10-23',
    createdAt: '2026-10-20T10:00:00+05:30',
    carrier: CARRIERS[1],
    shippingFee: '₹275',
    timeline: exceptionTimeline,
    exceptionMessage: 'Delivery attempted but address could not be located. Package is held at the Jaipur Central Facility. Please contact support or provide updated address within 5 business days.',
  },
];

export const INITIAL_ACTIVITY = [
  {
    id: 'act-001',
    event: 'In transit to Mumbai Gateway',
    trackingId: 'PP-2048-7316',
    recipient: 'Arjun Mehta',
    location: 'Mumbai Gateway, Maharashtra',
    timestamp: '2026-10-24T11:00:00+05:30',
    status: STATUSES.IN_TRANSIT,
  },
  {
    id: 'act-002',
    event: 'Out for delivery',
    trackingId: 'PP-2048-7315',
    recipient: 'Priya Krishnamurthy',
    location: 'Chennai Local Depot, Tamil Nadu',
    timestamp: '2026-10-25T08:15:00+05:30',
    status: STATUSES.OUT_FOR_DELIVERY,
  },
  {
    id: 'act-003',
    event: 'Package delivered successfully',
    trackingId: 'PP-2048-7314',
    recipient: 'Sneha Iyer',
    location: 'Kochi, Kerala',
    timestamp: '2026-10-21T14:22:00+05:30',
    status: STATUSES.DELIVERED,
  },
  {
    id: 'act-004',
    event: 'Shipment created — awaiting pickup',
    trackingId: 'PP-2048-7313',
    recipient: 'Rohan Sharma',
    location: 'Delhi Pickup Point, Delhi',
    timestamp: '2026-10-25T09:30:00+05:30',
    status: STATUSES.PENDING_PICKUP,
  },
  {
    id: 'act-005',
    event: 'Exception: Address not found',
    trackingId: 'PP-2048-7312',
    recipient: 'Kavya Reddy',
    location: 'Jaipur Central Facility, Rajasthan',
    timestamp: '2026-10-24T09:00:00+05:30',
    status: STATUSES.EXCEPTION,
  },
];
