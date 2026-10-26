import mongoose from 'mongoose';

const chatMessageReceiptSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  messageId: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  conversationId: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  recipientId: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  recipientRole: {
    type: String,
    enum: ['customer', 'professional', 'admin'],
    required: true
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

chatMessageReceiptSchema.index({ messageId: 1, recipientId: 1 }, { unique: true });

export const ChatMessageReceipt = mongoose.models.ChatMessageReceipt || mongoose.model('ChatMessageReceipt', chatMessageReceiptSchema);
