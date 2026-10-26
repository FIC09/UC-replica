import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
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
    index: true,
    trim: true
  },
  bookingId: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  senderId: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  senderRole: {
    type: String,
    enum: ['customer', 'professional', 'admin', 'system'],
    required: true,
    index: true
  },
  senderName: {
    type: String,
    default: 'User',
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'quick_reply', 'system'],
    default: 'text'
  },
  messageText: {
    type: String,
    required: true,
    trim: true
  },
  attachmentUrl: {
    type: String,
    default: ''
  },
  attachmentMeta: {
    fileName: String,
    fileType: String,
    fileSize: Number,
    storageKey: String
  },
  clientMessageId: {
    type: String,
    default: null,
    sparse: true,
    index: true
  },
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read'],
    default: 'sent',
    index: true
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  readAt: {
    type: Date,
    default: null
  },
  editedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });
chatMessageSchema.index({ conversationId: 1, clientMessageId: 1 });

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
