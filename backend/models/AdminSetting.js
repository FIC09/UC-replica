import mongoose from 'mongoose';

const adminSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export const AdminSetting = mongoose.model('AdminSetting', adminSettingSchema);
