import mongoose from 'mongoose';

const chatAttachmentSchema = new mongoose.Schema({
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
  messageId: {
    type: String,
    default: '',
    index: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  storageKey: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  uploadedRole: {
    type: String,
    enum: ['customer', 'professional', 'admin'],
    default: 'customer'
  }
}, {
  timestamps: true
});

export const ChatAttachment = mongoose.models.ChatAttachment || mongoose.model('ChatAttachment', chatAttachmentSchema);
