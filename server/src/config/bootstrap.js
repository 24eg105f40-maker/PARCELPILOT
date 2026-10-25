// server/src/config/bootstrap.js
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Shipment from '../models/Shipment.js';

export const DEMO_SHIPMENTS = [
  {
    trackingId: 'PP-2048-7316',
    recipient: { name: 'Arjun Mehta', email: 'arjun.mehta@example.com', phone: '+91 98765 43210' },
    origin: 'Hyderabad', destination: 'Mumbai',
    status: 'In Transit', service: 'Express',
    weight: '2.4 kg', shippingFee: '₹480', carrier: 'ParcelPilot Express',
    estimatedDelivery: new Date('2026-10-26'),
    exceptionMessage: null,
    timeline: [
      { event: 'Package picked up', location: 'Hyderabad Hub, Telangana', status: 'Picked Up', isLatest: false, timestamp: new Date('2026-10-22T09:15:00+05:30') },
      { event: 'Departed origin facility', location: 'Hyderabad Hub, Telangana', status: 'Picked Up', isLatest: false, timestamp: new Date('2026-10-22T14:30:00+05:30') },
      { event: 'Arrived at transit hub', location: 'Pune Sorting Centre, Maharashtra', status: 'In Transit', isLatest: false, timestamp: new Date('2026-10-23T08:45:00+05:30') },
      { event: 'In transit to destination', location: 'Mumbai Gateway, Maharashtra', status: 'In Transit', isLatest: true, timestamp: new Date('2026-10-24T11:00:00+05:30') },
    ],
  },
  {
    trackingId: 'PP-2048-7315',
    recipient: { name: 'Priya Krishnamurthy', email: 'priya.k@example.com', phone: '+91 87654 32109' },
    origin: 'Bengaluru', destination: 'Chennai',
    status: 'Out for Delivery', service: 'Express',
    weight: '1.1 kg', shippingFee: '₹320', carrier: 'FastShip India',
    estimatedDelivery: new Date('2026-10-25'),
    exceptionMessage: null,
    timeline: [
      { event: 'Package picked up', location: 'Bengaluru Hub, Karnataka', status: 'Picked Up', isLatest: false, timestamp: new Date('2026-10-21T10:00:00+05:30') },
      { event: 'Departed origin facility', location: 'Bengaluru Hub, Karnataka', status: 'Picked Up', isLatest: false, timestamp: new Date('2026-10-21T17:00:00+05:30') },
      { event: 'Arrived at destination facility', location: 'Chennai Central Hub, Tamil Nadu', status: 'In Transit', isLatest: false, timestamp: new Date('2026-10-24T06:30:00+05:30') },
      { event: 'Out for delivery', location: 'Chennai Local Depot, Tamil Nadu', status: 'Out for Delivery', isLatest: true, timestamp: new Date('2026-10-25T08:15:00+05:30') },
    ],
  },
  {
    trackingId: 'PP-2048-7314',
    recipient: { name: 'Sneha Iyer', email: 'sneha.iyer@example.com', phone: '+91 76543 21098' },
    origin: 'Mumbai', destination: 'Kochi',
    status: 'Delivered', service: 'Standard',
    weight: '3.8 kg', shippingFee: '₹560', carrier: 'SwiftMove Logistics',
    estimatedDelivery: new Date('2026-10-21'),
    exceptionMessage: null,
    timeline: [
      { event: 'Package picked up', location: 'Mumbai Hub, Maharashtra', status: 'Picked Up', isLatest: false, timestamp: new Date('2026-10-18T09:00:00+05:30') },
      { event: 'Departed origin facility', location: 'Mumbai Hub, Maharashtra', status: 'Picked Up', isLatest: false, timestamp: new Date('2026-10-18T15:00:00+05:30') },
      { event: 'Arrived at transit hub', location: 'Kochi Sorting Centre, Kerala', status: 'In Transit', isLatest: false, timestamp: new Date('2026-10-20T07:30:00+05:30') },
      { event: 'Out for delivery', location: 'Kochi Local Depot, Kerala', status: 'Out for Delivery', isLatest: false, timestamp: new Date('2026-10-21T09:00:00+05:30') },
      { event: 'Package delivered successfully', location: 'Kochi, Kerala', status: 'Delivered', isLatest: true, timestamp: new Date('2026-10-21T14:22:00+05:30') },
    ],
  },
  {
    trackingId: 'PP-2048-7313',
    recipient: { name: 'Rohan Sharma', email: 'rohan.s@example.com', phone: '+91 65432 10987' },
    origin: 'Delhi', destination: 'Kolkata',
    status: 'Pending Pickup', service: 'Economy',
    weight: '0.8 kg', shippingFee: '₹180', carrier: 'BlueDart Line',
    estimatedDelivery: new Date('2026-10-29'),
    exceptionMessage: null,
    timeline: [
      { event: 'Shipment created', location: 'Delhi Office, Delhi', status: 'Pending Pickup', isLatest: false, timestamp: new Date('2026-10-25T08:30:00+05:30') },
      { event: 'Awaiting pickup by carrier', location: 'Delhi Pickup Point, Delhi', status: 'Pending Pickup', isLatest: true, timestamp: new Date('2026-10-25T09:30:00+05:30') },
    ],
  },
  {
    trackingId: 'PP-2048-7312',
    recipient: { name: 'Vikram Patel', email: 'vikram.p@example.com', phone: '+91 54321 09876' },
    origin: 'Ahmedabad', destination: 'Jaipur',
    status: 'Exception', service: 'Standard',
    weight: '5.2 kg', shippingFee: '₹720', carrier: 'Delhivery Surface',
    estimatedDelivery: new Date('2026-10-24'),
    exceptionMessage: 'Incorrect delivery address provided. Package held at facility pending address verification.',
    timeline: [
      { event: 'Package picked up', location: 'Ahmedabad Hub, Gujarat', status: 'Picked Up', isLatest: false, timestamp: new Date('2026-10-20T11:00:00+05:30') },
      { event: 'Departed origin facility', location: 'Ahmedabad Hub, Gujarat', status: 'Picked Up', isLatest: false, timestamp: new Date('2026-10-20T16:00:00+05:30') },
      { event: 'Arrived at transit hub', location: 'Udaipur Gateway, Rajasthan', status: 'In Transit', isLatest: false, timestamp: new Date('2026-10-22T08:00:00+05:30') },
      { event: 'Delivery attempted — address unreachable', location: 'Jaipur Delivery Office, Rajasthan', status: 'Exception', isLatest: true, timestamp: new Date('2026-10-24T10:30:00+05:30') },
    ],
  },
];

export async function autoBootstrapIfEmpty() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@parcelpilot.demo').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'ParcelPilot Admin';

    // 1. Auto-create admin if user collection is empty or admin doesn't exist
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'admin',
      });
      console.log(`👤 Initial administrator auto-created: ${adminEmail}`);
    }

    // 2. Auto-seed demo shipments if shipments collection is empty
    const shipmentCount = await Shipment.countDocuments();
    if (shipmentCount === 0) {
      for (const s of DEMO_SHIPMENTS) {
        await Shipment.create(s);
      }
      console.log(`📦 Initial demo shipments auto-populated (5 records)`);
    }
  } catch (err) {
    console.warn('⚠️ Auto-bootstrap warning:', err.message);
  }
}
