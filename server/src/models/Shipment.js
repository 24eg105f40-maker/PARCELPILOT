// server/src/models/Shipment.js
import mongoose from 'mongoose';

const trackingEventSchema = new mongoose.Schema(
  {
    event: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    status: { type: String, required: true },
    isLatest: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const shipmentSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    recipient: {
      name: {
        type: String,
        required: [true, 'Recipient name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
      },
      email: {
        type: String,
        required: [true, 'Recipient email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
      },
      phone: { type: String, trim: true, default: 'N/A' },
    },
    origin: {
      type: String,
      required: [true, 'Origin city is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination city is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'Pending Pickup', 'Picked Up', 'In Transit',
        'Out for Delivery', 'Delivered', 'Exception',
      ],
      default: 'Pending Pickup',
    },
    service: {
      type: String,
      enum: ['Express', 'Standard', 'Economy'],
      default: 'Standard',
    },
    weight: { type: String, required: true },
    shippingFee: { type: String, default: '₹0' },
    carrier: { type: String, default: 'ParcelPilot Express' },
    estimatedDelivery: { type: Date },
    exceptionMessage: { type: String, default: null },
    timeline: { type: [trackingEventSchema], default: [] },

    // Soft delete flag — not exposed publicly
    isDeleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual "id" field matching trackingId for frontend compatibility
shipmentSchema.virtual('id').get(function () {
  return this.trackingId;
});

// Pre-find middleware: exclude deleted records by default
shipmentSchema.pre(/^find/, function (next) {
  if (this._conditions.isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

export default mongoose.model('Shipment', shipmentSchema);
