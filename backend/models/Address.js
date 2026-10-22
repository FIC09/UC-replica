import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  userPhone: {
    type: String,
    default: '+91 98201 44521',
  },
  label: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    default: 'Home',
  },
  flat: {
    type: String,
    required: true,
  },
  locality: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    default: '',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  formatted: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export const Address = mongoose.model('Address', addressSchema);
