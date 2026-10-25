// server/src/controllers/shipmentController.js
import Shipment from '../models/Shipment.js';

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateTrackingId() {
  const yr = new Date().getFullYear().toString().slice(-2);
  const rand = () => Math.floor(1000 + Math.random() * 9000);
  return `PP-20${yr}-${rand()}`;
}

async function makeUniqueTrackingId() {
  let id;
  let tries = 0;
  do {
    id = generateTrackingId();
    const existing = await Shipment.findOne({ trackingId: id }).lean();
    if (!existing) return id;
    tries++;
  } while (tries < 20);
  throw new Error('Could not generate unique tracking ID. Try again.');
}

function calcEstimatedDelivery(service, createdAt) {
  const base = createdAt ? new Date(createdAt) : new Date();
  const days = service === 'Express' ? 2 : service === 'Standard' ? 5 : 8;
  base.setDate(base.getDate() + days);
  return base;
}

function calcShippingFee(service, weight) {
  const kg = parseFloat(weight) || 1;
  const base = service === 'Express' ? 150 : service === 'Standard' ? 90 : 60;
  const perKg = service === 'Express' ? 80 : service === 'Standard' ? 50 : 30;
  return `₹${Math.round(base + perKg * kg)}`;
}

const CARRIERS = ['ParcelPilot Express', 'FastShip India', 'SwiftMove Logistics'];

function statusToEvent(status, location) {
  const map = {
    'Pending Pickup': 'Awaiting pickup by carrier',
    'Picked Up': 'Package picked up by carrier',
    'In Transit': 'In transit to next facility',
    'Out for Delivery': 'Out for delivery',
    'Delivered': 'Package delivered successfully',
    'Exception': 'Exception: Delivery issue encountered',
  };
  return {
    event: map[status] || `Status updated to ${status}`,
    location: location || 'India Hub',
    status,
    isLatest: true,
    timestamp: new Date(),
  };
}

// Sanitize a shipment for public tracking (strips private recipient data)
function sanitizeForPublic(doc) {
  const s = doc.toObject ? doc.toObject({ virtuals: true }) : { ...doc };
  if (s.recipient) {
    s.recipient = {
      name: s.recipient.name,
      // email and phone omitted from public tracking
    };
  }
  return s;
}

// ── Controllers ───────────────────────────────────────────────────────────────

// GET /api/shipments
export async function listShipments(req, res, next) {
  try {
    const { search = '', status = '', page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { 'recipient.name': { $regex: search, $options: 'i' } },
      ];
    }

    const [shipments, total] = await Promise.all([
      Shipment.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Shipment.countDocuments(query),
    ]);

    res.json({
      shipments: shipments.map(s => s.toObject({ virtuals: true })),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/shipments/:id
export async function getShipment(req, res, next) {
  try {
    const s = await Shipment.findOne({ trackingId: req.params.id.toUpperCase() });
    if (!s) return res.status(404).json({ message: `Shipment ${req.params.id} not found.` });
    res.json(s.toObject({ virtuals: true }));
  } catch (err) {
    next(err);
  }
}

// GET /api/shipments/track/:trackingId  — public, sanitized
export async function trackShipment(req, res, next) {
  try {
    const s = await Shipment.findOne({ trackingId: req.params.trackingId.toUpperCase() });
    if (!s) return res.status(404).json({ message: 'Tracking ID not found. Please check the number and try again.' });
    res.json(sanitizeForPublic(s));
  } catch (err) {
    next(err);
  }
}

// POST /api/shipments
export async function createShipment(req, res, next) {
  try {
    const {
      recipientName, recipientEmail, recipientPhone,
      origin, destination, service, weight,
    } = req.body;

    if (!recipientName || !recipientEmail || !origin || !destination || !weight) {
      return res.status(400).json({ message: 'recipientName, recipientEmail, origin, destination and weight are required.' });
    }
    if (origin === destination) {
      return res.status(400).json({ message: 'Origin and destination must be different.' });
    }

    const trackingId = await makeUniqueTrackingId();
    const svc = service || 'Standard';
    const now = new Date();
    const fee = calcShippingFee(svc, weight);
    const eta = calcEstimatedDelivery(svc, now);
    const carrier = CARRIERS[Math.floor(Math.random() * CARRIERS.length)];

    const initialEvents = [
      {
        event: 'Shipment created',
        location: `${origin} Office`,
        status: 'Pending Pickup',
        isLatest: false,
        timestamp: now,
      },
      {
        event: 'Awaiting pickup by carrier',
        location: `${origin} Pickup Point`,
        status: 'Pending Pickup',
        isLatest: true,
        timestamp: new Date(now.getTime() + 60000),
      },
    ];

    const shipment = await Shipment.create({
      trackingId,
      recipient: {
        name: recipientName.trim(),
        email: recipientEmail.trim().toLowerCase(),
        phone: recipientPhone?.trim() || 'N/A',
      },
      origin: origin.trim(),
      destination: destination.trim(),
      status: 'Pending Pickup',
      service: svc,
      weight: `${parseFloat(weight).toFixed(1)} kg`,
      shippingFee: fee,
      carrier,
      estimatedDelivery: eta,
      timeline: initialEvents,
    });

    res.status(201).json(shipment.toObject({ virtuals: true }));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/shipments/:id
export async function updateShipment(req, res, next) {
  try {
    const allowed = ['recipient', 'origin', 'destination', 'service', 'weight', 'carrier', 'estimatedDelivery'];
    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }

    const s = await Shipment.findOneAndUpdate(
      { trackingId: req.params.id.toUpperCase() },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!s) return res.status(404).json({ message: 'Shipment not found.' });
    res.json(s.toObject({ virtuals: true }));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/shipments/:id/status
export async function updateStatus(req, res, next) {
  try {
    const { status, location } = req.body;
    const validStatuses = ['Pending Pickup', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Exception'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const s = await Shipment.findOne({ trackingId: req.params.id.toUpperCase() });
    if (!s) return res.status(404).json({ message: 'Shipment not found.' });

    if (s.status === 'Delivered' && status !== 'Delivered') {
      return res.status(400).json({ message: 'Cannot change status of a delivered shipment.' });
    }

    // Mark all existing events as not latest
    s.timeline.forEach(ev => { ev.isLatest = false; });

    const newEvent = statusToEvent(status, location);
    s.timeline.push(newEvent);
    s.status = status;
    s.exceptionMessage = status === 'Exception'
      ? 'Delivery exception encountered. Package held at facility. Please contact support or provide updated address within 5 business days.'
      : null;

    await s.save();
    res.json(s.toObject({ virtuals: true }));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/shipments/:id
export async function deleteShipment(req, res, next) {
  try {
    const s = await Shipment.findOneAndUpdate(
      { trackingId: req.params.id.toUpperCase() },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!s) return res.status(404).json({ message: 'Shipment not found.' });
    res.json({ message: `Shipment ${req.params.id} deleted.` });
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/stats
export async function getDashboardStats(req, res, next) {
  try {
    const [total, delivered, exception, inProgress] = await Promise.all([
      Shipment.countDocuments(),
      Shipment.countDocuments({ status: 'Delivered' }),
      Shipment.countDocuments({ status: 'Exception' }),
      Shipment.countDocuments({ status: { $in: ['Picked Up', 'In Transit', 'Out for Delivery'] } }),
    ]);
    res.json({ total, delivered, exception, inProgress });
  } catch (err) {
    next(err);
  }
}

// GET /api/activity
export async function getActivity(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const shipments = await Shipment.find().sort({ updatedAt: -1 }).limit(20);

    // Flatten the latest event from each shipment into an activity feed
    const events = [];
    for (const s of shipments) {
      const latestEv = [...s.timeline].reverse().find(ev => ev.isLatest) || s.timeline[s.timeline.length - 1];
      if (latestEv) {
        events.push({
          id: `${s._id}-${latestEv._id}`,
          event: latestEv.event,
          trackingId: s.trackingId,
          recipient: s.recipient.name,
          location: latestEv.location,
          timestamp: latestEv.timestamp,
          status: s.status,
        });
      }
    }

    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(events.slice(0, limit));
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/shipments
export async function getReports(req, res, next) {
  try {
    const statusGroups = await Shipment.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const serviceGroups = await Shipment.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$service', count: { $sum: 1 } } },
    ]);

    const total = await Shipment.countDocuments();
    const delivered = statusGroups.find(g => g._id === 'Delivered')?.count || 0;
    const exception = statusGroups.find(g => g._id === 'Exception')?.count || 0;

    res.json({
      total,
      deliveryRate: total > 0 ? Math.round((delivered / total) * 100) : 0,
      exception,
      statusBreakdown: statusGroups.map(g => ({ status: g._id, count: g.count })),
      serviceBreakdown: serviceGroups.map(g => ({ service: g._id, count: g.count })),
    });
  } catch (err) {
    next(err);
  }
}
