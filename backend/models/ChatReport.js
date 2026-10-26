import mongoose from 'mongoose';

const chatReportSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  bookingId: {
    type: String,
    default: '',
    index: true
  },
  messageId: {
    type: String,
    default: ''
  },
  reporterId: {
    type: String,
    required: true
  },
  reporterRole: {
    type: String,
    enum: ['customer', 'professional', 'admin'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed', 'actioned'],
    default: 'pending',
    index: true
  },
  reviewedBy: {
    type: String,
    default: ''
  },
  actionTaken: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const ChatReport = mongoose.models.ChatReport || mongoose.model('ChatReport', chatReportSchema);
