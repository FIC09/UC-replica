import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
  },
  type: {
    type: String,
    enum: ['flat', 'percentage'],
    default: 'flat',
  },
  minOrder: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
  },
  description: {
    type: String,
    default: '',
  },
  desc: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'all',
  },
  eligibleUsers: {
    type: String,
    default: 'All Users',
  },
  eligibleCategories: {
    type: [String],
    default: ['All Services'],
  },
  eligibleCities: {
    type: [String],
    default: ['All Cities'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

couponSchema.pre('save', function (next) {
  if (this.discountAmount && !this.discount) {
    this.discount = this.discountAmount;
  }
  if (this.discount && !this.discountAmount) {
    this.discountAmount = this.discount;
  }
  if (this.desc && !this.description) {
    this.description = this.desc;
  }
  if (this.description && !this.desc) {
    this.desc = this.description;
  }
  next();
});

export const Coupon = mongoose.model('Coupon', couponSchema);
