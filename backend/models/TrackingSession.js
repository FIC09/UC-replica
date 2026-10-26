import mongoose from 'mongoose';

const locationEventSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  accuracy: { type: Number, default: 5 }, // in meters
  speed: { type: Number, default: 0 }, // in km/h
  heading: { type: Number, default: 0 }, // in degrees
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const trackingSessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  bookingId: { type: String, required: true, unique: true, index: true },
  bookingReference: { type: String, index: true },
  workerId: { type: String, required: true, index: true },
  workerName: { type: String, required: true },
  workerPhone: { type: String, default: '' },
  workerAvatar: { type: String, default: '' },
  workerTrade: { type: String, default: '' },
  workerRating: { type: Number, default: 4.9 },
  partnerId: { type: String, default: '', index: true },
  partnerName: { type: String, default: '' },

  // Destination Customer
  customerName: { type: String, default: 'Customer' },
  customerPhone: { type: String, default: '' },
  customerAddress: { type: String, required: true },
  customerCoords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },

  // Current live worker position
  currentCoords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  heading: { type: Number, default: 0 },
  speed: { type: Number, default: 22 }, // km/h
  accuracy: { type: Number, default: 4.5 },

  // Trip status: assigned -> en_route -> arrived -> in_progress -> completed
  status: {
    type: String,
    enum: ['unassigned', 'assigned', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled'],
    default: 'assigned',
    index: true
  },

  // Route polyline & Waypoints for realistic road travel
  routePolyline: [{
    lat: Number,
    lng: Number
  }],
  currentWaypointIndex: { type: Number, default: 0 },

  // Calculated ETA and Remaining Distance
  remainingDistanceKm: { type: Number, default: 3.2 },
  remainingEtaMinutes: { type: Number, default: 12 },

  // Verification Safety PIN / OTP
  safetyPin: { type: String, default: '4829' },
  pinVerified: { type: Boolean, default: false },
  pinVerifiedAt: { type: Date },

  // Service Execution Metrics
  serviceStartedAt: { type: Date },
  serviceCompletedAt: { type: Date },
  serviceDurationMinutes: { type: Number, default: 0 },

  // Location History
  locationEvents: [locationEventSchema],

  lastPingAt: { type: Date, default: Date.now },
  staleStatus: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const TrackingSession = mongoose.model('TrackingSession', trackingSessionSchema);
