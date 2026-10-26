import mongoose from 'mongoose';

const chatConversationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  bookingId: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  assignmentId: {
    type: String,
    default: '',
    trim: true
  },
  customerId: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  customerName: {
    type: String,
    default: 'Customer',
    trim: true
  },
  customerPhone: {
    type: String,
    default: ''
  },
  workerId: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  workerName: {
    type: String,
    default: 'Professional Specialist',
    trim: true
  },
  workerPhone: {
    type: String,
    default: ''
  },
  workerAvatar: {
    type: String,
    default: ''
  },
  workerTrade: {
    type: String,
    default: 'Home Services Specialist'
  },
  serviceName: {
    type: String,
    default: 'Service Booking'
  },
  serviceAddress: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'read_only', 'closed'],
    default: 'active',
    index: true
  },
  closureReason: {
    type: String,
    default: ''
  },
  unreadCountCustomer: {
    type: Number,
    default: 0
  },
  unreadCountWorker: {
    type: Number,
    default: 0
  },
  lastMessage: {
    text: { type: String, default: '' },
    senderId: { type: String, default: '' },
    senderRole: { type: String, default: '' },
    messageType: { type: String, default: 'text' },
    timestamp: { type: Date, default: Date.now }
  },
  closedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

chatConversationSchema.index({ bookingId: 1, workerId: 1 });
chatConversationSchema.index({ customerId: 1, status: 1 });
chatConversationSchema.index({ workerId: 1, status: 1 });

export const ChatConversation = mongoose.models.ChatConversation || mongoose.model('ChatConversation', chatConversationSchema);
