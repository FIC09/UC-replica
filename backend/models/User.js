import mongoose from 'mongoose';

const savedAddressSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    default: 'Home',
  },
  flatNumber: String,
  buildingName: String,
  streetAddress: String,
  landmark: String,
  locality: String,
  city: String,
  pincode: String,
  isDefault: {
    type: Boolean,
    default: false,
  }
}, { _id: false });

const customerNoteSchema = new mongoose.Schema({
  id: String,
  note: {
    type: String,
    required: true,
  },
  author: String,
  authorRole: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { _id: false });

const suspendEventSchema = new mongoose.Schema({
  status: String,
  reason: String,
  changedBy: String,
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    default: '',
  },
  hasUCPlus: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'partner'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended', 'Anonymised', 'Deleted'],
    default: 'Active',
  },
  city: {
    type: String,
    default: 'Mumbai',
  },
  locality: {
    type: String,
    default: 'Bandra West',
  },
  suspendReason: {
    type: String,
    default: '',
  },
  suspendHistory: [suspendEventSchema],
  savedAddresses: [savedAddressSchema],
  internalNotes: [customerNoteSchema],
  anonymisedAt: {
    type: Date,
  },
  anonymisedBy: {
    type: String,
  }
}, {
  timestamps: true,
});

// Anonymisation method: masks personal data while preserving financial & referential integrity
userSchema.methods.anonymiseAccount = function (agentEmail) {
  const shortId = this._id.toString().slice(-4);
  this.name = `Anonymised Customer (CUST-${shortId})`;
  this.email = `privacy.erased.${shortId}@anonymised.local`;
  this.phone = `+91 99999 ${shortId}`;
  this.savedAddresses = [];
  this.status = 'Anonymised';
  this.hasUCPlus = false;
  this.anonymisedAt = new Date();
  this.anonymisedBy = agentEmail || 'SYSTEM';
  this.internalNotes.push({
    id: `note-${Date.now()}`,
    note: `Account data erased/anonymised per customer privacy request by ${agentEmail || 'SYSTEM'}. Financial and statutory order history preserved for tax compliance.`,
    author: agentEmail || 'SYSTEM',
    authorRole: 'Compliance Officer',
    createdAt: new Date(),
  });
};

export const User = mongoose.model('User', userSchema);
