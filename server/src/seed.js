// server/src/seed.js
// Safe to rerun — uses upsert. Will not duplicate records.
// Usage: node src/seed.js

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import Shipment from './models/Shipment.js';
import User from './models/User.js';

// ── Demo shipments matching the original frontend sample data ─────────────────
const DEMO_SHIPMENTS = [
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
    recipient: { name: 'Rohan Sharma', email: 'rohan.sharma@example.com', phone: '+91 65432 10987' },
    origin: 'Delhi', destination: 'Pune',
    status: 'Pending Pickup', service: 'Economy',
    weight: '5.2 kg', shippingFee: '₹390', carrier: 'ParcelPilot Express',
    estimatedDelivery: new Date('2026-10-30'),
    exceptionMessage: null,
    timeline: [
      { event: 'Shipment created', location: 'Delhi Office, Delhi', status: 'Pending Pickup', isLatest: false, timestamp: new Date('2026-10-25T07:00:00+05:30') },
      { event: 'Awaiting pickup by carrier', location: 'Delhi Pickup Point, Delhi', status: 'Pending Pickup', isLatest: true, timestamp: new Date('2026-10-25T09:30:00+05:30') },
    ],
  },
  {
    trackingId: 'PP-2048-7312',
    recipient: { name: 'Kavya Reddy', email: 'kavya.reddy@example.com', phone: '+91 54321 09876' },
    origin: 'Pune', destination: 'Jaipur',
    status: 'Exception', service: 'Standard',
    weight: '0.9 kg', shippingFee: '₹275', carrier: 'FastShip India',
    estimatedDelivery: new Date('2026-10-23'),
    exceptionMessage: 'Delivery attempted but address could not be located. Package is held at the Jaipur Central Facility. Please contact support or provide updated address within 5 business days.',
    timeline: [
      { event: 'Package picked up', location: 'Pune Hub, Maharashtra', status: 'Picked Up', isLatest: false, timestamp: new Date('2026-10-20T10:00:00+05:30') },
      { event: 'Departed origin facility', location: 'Pune Hub, Maharashtra', status: 'Picked Up', isLatest: false, timestamp: new Date('2026-10-20T16:00:00+05:30') },
      { event: 'Arrived at transit hub', location: 'Ahmedabad Sorting Centre, Gujarat', status: 'In Transit', isLatest: false, timestamp: new Date('2026-10-22T05:00:00+05:30') },
      { event: 'Delivery attempted — recipient unavailable', location: 'Jaipur Local Depot, Rajasthan', status: 'Exception', isLatest: false, timestamp: new Date('2026-10-23T11:30:00+05:30') },
      { event: 'Exception: Address not found. Package held at facility.', location: 'Jaipur Central Facility, Rajasthan', status: 'Exception', isLatest: true, timestamp: new Date('2026-10-24T09:00:00+05:30') },
    ],
  },
];

async function seed() {
  console.log('🌱 Starting ParcelPilot seed...\n');
  await connectDB();

  // ── Seed shipments (upsert by trackingId) ──────────────────────────────────
  let shipmentsCreated = 0;
  let shipmentsUpdated = 0;

  for (const data of DEMO_SHIPMENTS) {
    const existing = await Shipment.findOne({ trackingId: data.trackingId });
    if (existing) {
      console.log(`  ⟳ Skipped existing shipment: ${data.trackingId}`);
      shipmentsUpdated++;
    } else {
      await Shipment.create(data);
      console.log(`  ✓ Seeded shipment: ${data.trackingId} (${data.status})`);
      shipmentsCreated++;
    }
  }

  console.log(`\n📦 Shipments: ${shipmentsCreated} created, ${shipmentsUpdated} already existed.`);

  // ── Seed admin user ────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'ParcelPilot Admin';

  if (!adminEmail || !adminPassword) {
    console.warn('\n⚠️  ADMIN_EMAIL and ADMIN_PASSWORD not set in .env — skipping admin creation.');
    console.warn('   Set them and rerun: node src/seed.js');
  } else {
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingAdmin) {
      console.log(`\n👤 Admin already exists: ${adminEmail} — skipping.`);
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: 'admin',
      });
      console.log(`\n👤 Admin created: ${adminEmail}`);
    }
  }

  console.log('\n✅ Seed complete.\n');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
