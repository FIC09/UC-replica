import mongoose from 'mongoose';

const CallSessionSchema = new mongoose.Schema({
  callId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  bookingId: {
    type: String,
    required: true,
    index: true
  },
  callerId: {
    type: String,
    required: true
  },
  callerRole: {
    type: String,
    enum: ['customer', 'professional', 'admin'],
    required: true
  },
  callerName: {
    type: String,
    default: 'Participant'
  },
  receiverId: {
    type: String,
    required: true
  },
  receiverRole: {
    type: String,
    enum: ['customer', 'professional', 'admin'],
    required: true
  },
  receiverName: {
    type: String,
    default: 'Participant'
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'connected', 'ended', 'rejected', 'missed', 'busy', 'failed'],
    default: 'initiated',
    index: true
  },
  callType: {
    type: String,
    default: 'webrtc_audio'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  connectedAt: {
    type: Date,
    default: null
  },
  endedAt: {
    type: Date,
    default: null
  },
  durationSeconds: {
    type: Number,
    default: 0
  },
  disconnectReason: {
    type: String,
    default: null
  },
  iceConnectionState: {
    type: String,
    default: 'new'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index for quick query of booking calls
CallSessionSchema.index({ bookingId: 1, startedAt: -1 });

export const CallSession = mongoose.model('CallSession', CallSessionSchema);
export default CallSession;
