export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: any;
  badge?: string | null;
  badgeType?: 'sale' | 'time' | 'new';
  description?: string;
}

export interface ServiceFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ServiceReview {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  helpfulCount?: number;
}

export interface Service {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount?: string;
  duration?: string;
  image: any;
  badge?: string;
  description?: string;
  detailedDescription?: string;
  includes?: string[];
  excludes?: string[];
  benefits?: string[];
  faqs?: ServiceFAQ[];
  reviews?: ServiceReview[];
  features?: string[];
  isPopular?: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  discountBadge: string;
  code?: string;
  bgColor?: string;
  textColor?: string;
  image?: any;
  ctaText?: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountAmount?: number;
  discountPercent?: number;
  minOrderValue: number;
  expiresAt: string;
}

export interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  label: string;
  fullAddress: string;
  landmark?: string;
  city: string;
  postalCode: string;
  isDefault?: boolean;
}

export type BookingStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  bookingNumber: string;
  serviceTitle: string;
  category: string;
  date: string;
  timeSlot: string;
  status: BookingStatus;
  amount: number;
  address: Address;
  professionalName?: string;
  professionalPhone?: string;
  professionalRating?: number;
  serviceImage?: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  membershipStatus?: 'Standard' | 'Plus' | 'VIP';
  savedAddresses: Address[];
}

