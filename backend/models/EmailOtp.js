import mongoose from 'mongoose';

const emailOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  city: {
    type: String,
    default: 'Krishnagiri',
  },
  locality: {
    type: String,
    default: 'Rayakottai Road',
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  lastSentAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // MongoDB automatic TTL deletion
  }
}, {
  timestamps: true
});

export const EmailOtp = mongoose.model('EmailOtp', emailOtpSchema);
