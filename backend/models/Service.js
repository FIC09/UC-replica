import mongoose from 'mongoose';

const addOnItemSchema = new mongoose.Schema({
  id: String,
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  durationMins: {
    type: Number,
    default: 15
  },
  description: String
}, { _id: false });

const faqItemSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  categoryName: {
    type: String,
    default: '',
    trim: true,
  },
  subcategory: {
    type: String,
    default: '',
    trim: true,
  },
  displayOrder: {
    type: Number,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: [1, 'Price must be greater than zero']
  },
  originalPrice: {
    type: Number,
  },
  durationMins: {
    type: Number,
    required: true,
    default: 60,
    min: [5, 'Duration must be at least 5 minutes']
  },
  duration: {
    type: String,
    default: '60 mins',
  },
  rating: {
    type: Number,
    default: 4.85,
  },
  reviewsCount: {
    type: String,
    default: '12K',
  },
  badge: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  // Itemized included & excluded work
  includedWork: [{
    type: String
  }],
  excludedWork: [{
    type: String
  }],
  // Optional add-on items / upgrades
  addOns: [addOnItemSchema],
  // FAQs & customer preparation instructions
  faqs: [faqItemSchema],
  prepInstructions: [{
    type: String
  }],
  // Applicable serviceability locations
  applicableCities: [{
    type: String,
    default: ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Krishnagiri']
  }],
  applicableZones: [{
    type: String
  }],
  // Tax and Platform Commission Configuration
  taxRate: {
    type: Number,
    default: 18 // 18% GST standard in India
  },
  commissionRate: {
    type: Number,
    default: 20 // 20% platform take rate
  },
  minPlatformTake: {
    type: Number,
    default: 100 // minimum INR platform fee
  },
  // Cancellation and Warranty Policy References
  warrantyDays: {
    type: Number,
    default: 30
  },
  cancellationPolicy: {
    type: String,
    default: 'Free cancellation up to 2 hours prior to scheduled appointment. 50% fee thereafter.'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft', 'Archived'],
    default: 'Active'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  features: [{
    type: String,
  }],
  categoryTab: {
    type: String,
  }
}, {
  timestamps: true,
});

export const Service = mongoose.model('Service', serviceSchema);
