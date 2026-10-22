import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { Service } from '../models/Service.js';
import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';
import { Address } from '../models/Address.js';
import { WorkerApplication } from '../models/WorkerApplication.js';
import { PartnerApplication } from '../models/PartnerApplication.js';
import { Coupon } from '../models/Coupon.js';
import { AdminSetting } from '../models/AdminSetting.js';

import { SERVICES, COUPONS } from '../../frontend/src/data/servicesData.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/urban_company';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully.');

    // 1. Seed Services
    console.log('Clearing existing Services...');
    await Service.deleteMany({});
    console.log(`Seeding ${SERVICES.length} services...`);
    const formattedServices = SERVICES.map(s => {
      let updated = { ...s };
      if (updated.image && updated.image.includes('1548839140')) {
        updated.image = '/images/native_purifier.jpg';
      }
      return {
        id: updated.id,
        title: updated.title,
        category: updated.category,
        subcategory: updated.subcategory || '',
        price: updated.price,
        originalPrice: updated.originalPrice,
        duration: updated.duration || '60 mins',
        rating: updated.rating || 4.8,
        reviewsCount: updated.reviewsCount || '12K',
        badge: updated.badge || '',
        image: updated.image || '',
        description: updated.description || '',
        features: updated.features || [],
        categoryTab: updated.categoryTab || 'homes',
        isPaused: false,
      };
    });
    await Service.insertMany(formattedServices);
    console.log('✅ Services seeded successfully!');

    // 2. Seed Default User
    console.log('Seeding default user...');
    await User.deleteMany({});
    const defaultUser = await User.create({
      name: 'Rahul Sharma',
      phone: '+91 98201 44521',
      email: 'rahul.sharma@example.com',
      hasUCPlus: false,
      role: 'user',
    });
    console.log('✅ Default user created:', defaultUser.name);

    // 3. Seed Addresses
    console.log('Seeding saved addresses...');
    await Address.deleteMany({});
    await Address.insertMany([
      {
        id: 'ADDR-1',
        userPhone: '+91 98201 44521',
        label: 'Home',
        flat: 'Flat 402, Sea Green Heights, Bandra West',
        locality: 'Bandra West',
        city: 'Mumbai',
        pincode: '400050',
        landmark: 'Opposite Mehboob Studio',
        isDefault: true,
        formatted: 'Flat 402, Sea Green Heights, Bandra West, Mumbai - 400050 (Opposite Mehboob Studio)',
      },
      {
        id: 'ADDR-2',
        userPhone: '+91 98201 44521',
        label: 'Work',
        flat: 'Unit 802, One BKC, G Block, BKC',
        locality: 'Bandra West',
        city: 'Mumbai',
        pincode: '400051',
        landmark: 'Near MCA Club',
        isDefault: false,
        formatted: 'Unit 802, One BKC, G Block, BKC, Mumbai - 400051',
      },
    ]);
    console.log('✅ Addresses seeded.');

    // 4. Seed Bookings
    console.log('Seeding initial bookings...');
    await Booking.deleteMany({});
    await Booking.create({
      id: 'UC-829410',
      userPhone: '+91 98201 44521',
      userName: 'Rahul Sharma',
      items: [
        {
          id: 'ac-foam-jet-service',
          title: 'Powerjet AC Servicing (Split / Window)',
          qty: 1,
          price: 499,
          image: '/images/appliance_ac.jpg',
        },
      ],
      totalAmount: 548,
      address: 'Flat 402, Sea Green Heights, Bandra West, Mumbai - 400050',
      slot: 'Today, 02:00 PM - 03:00 PM',
      status: 'Confirmed',
      paymentMethod: 'UPI',
      assignedPartner: 'Rajesh Kumar',
      createdAtFormatted: '13 Oct, 11:30 AM',
    });
    console.log('✅ Bookings seeded.');

    // 5. Seed Worker Applications
    console.log('Seeding worker applications...');
    await WorkerApplication.deleteMany({});
    await WorkerApplication.insertMany([
      {
        id: 'WRK-84210',
        applicantName: 'Ramesh Vishwakarma',
        phone: '+91 98205 11982',
        trade: 'ac-appliances',
        tradeName: 'AC & Appliance Repair',
        locality: 'Bandra West, Mumbai',
        experience: '4-6 years',
        toolsAvailable: 'Yes, Full Tool Kit & Gauges',
        hasSmartphone: 'Yes, Android 13',
        expectedIncome: '₹70,000 / month',
        aadhaarNumber: 'XXXX-XXXX-4821',
        appliedAt: '14 Oct 2026, 11:20 AM',
        status: 'Pending Review',
      },
      {
        id: 'WRK-84209',
        applicantName: 'Sunita Chauhan',
        phone: '+91 98190 22345',
        trade: 'cleaning-pest',
        tradeName: 'Deep Cleaning & Pest Control',
        locality: 'Powai, Mumbai',
        experience: '3-5 years',
        toolsAvailable: 'Yes, Deep Clean Machines',
        hasSmartphone: 'Yes, iOS 17',
        expectedIncome: '₹55,000 / month',
        aadhaarNumber: 'XXXX-XXXX-9012',
        appliedAt: '13 Oct 2026, 04:45 PM',
        status: 'Pending Review',
      },
      {
        id: 'WRK-84205',
        applicantName: 'Dilip Mistry',
        phone: '+91 98331 44567',
        trade: 'quick-repairs',
        tradeName: 'Electrician & Quick Repairs',
        locality: 'Andheri West, Mumbai',
        experience: '7+ years',
        toolsAvailable: 'Yes, Digital Multimeter & Power Tools',
        hasSmartphone: 'Yes, Android 12',
        expectedIncome: '₹65,000 / month',
        aadhaarNumber: 'XXXX-XXXX-1144',
        appliedAt: '12 Oct 2026, 02:15 PM',
        status: 'Approved',
      },
    ]);
    console.log('✅ Worker applications seeded.');

    // 6. Seed Partner Applications
    console.log('Seeding partner applications...');
    await PartnerApplication.deleteMany({});
    await PartnerApplication.insertMany([
      {
        id: 'PTR-90142',
        businessName: 'Apex Home Solutions LLP',
        ownerName: 'Sandeep Patil',
        phone: '+91 98210 33411',
        email: 'sandeep@apexhome.in',
        businessType: 'Partnership / LLP',
        category: 'ac-appliances',
        categoryName: 'AC & Appliance Repair',
        fleetSize: '12 Technicians',
        city: 'Bandra, Khar & Santacruz, Mumbai',
        gstNumber: '27AABCA1234F1Z8',
        monthlyCapacity: '250-400 jobs/month',
        appliedAt: '14 Oct 2026, 09:15 AM',
        status: 'Pending Review',
      },
      {
        id: 'PTR-90138',
        businessName: 'SwiftClean Pro Agency',
        ownerName: 'Meera Nair',
        phone: '+91 98200 77654',
        email: 'ops@swiftclean.co',
        businessType: 'Private Limited Company',
        category: 'cleaning-pest',
        categoryName: 'Deep Cleaning & Pest Control',
        fleetSize: '8 Specialist Cleaners',
        city: 'Powai, Chandivali & Vikhroli, Mumbai',
        gstNumber: '27AAECP5678M1Z2',
        monthlyCapacity: '180-260 jobs/month',
        appliedAt: '13 Oct 2026, 06:10 PM',
        status: 'Approved',
      },
    ]);
    console.log('✅ Partner applications seeded.');

    // 7. Seed Coupons
    console.log('Seeding promo coupons...');
    await Coupon.deleteMany({});
    if (COUPONS && COUPONS.length > 0) {
      const formattedCoupons = COUPONS.map(c => ({
        code: c.code,
        discount: c.discountAmount || c.discount || 100,
        discountAmount: c.discountAmount || c.discount || 100,
        type: c.type || 'flat',
        minOrder: c.minOrder || 0,
        description: c.desc || c.description || '',
        desc: c.desc || c.description || '',
        category: c.category || 'all',
        isActive: true,
      }));
      await Coupon.insertMany(formattedCoupons);
    } else {
      await Coupon.insertMany([
        { code: 'WELCOME100', discount: 100, type: 'flat', minOrder: 499, description: 'Flat ₹100 OFF on your first booking' },
        { code: 'MONSOON50', discount: 50, type: 'flat', minOrder: 299, description: 'Monsoon relief: ₹50 OFF on home cleaning & AC' },
        { code: 'UCPLUS20', discount: 20, type: 'percentage', minOrder: 399, maxDiscount: 150, description: '20% OFF for UC Plus Members' },
      ]);
    }
    console.log('✅ Coupons seeded.');

    // 8. Seed Admin Settings
    console.log('Seeding admin settings...');
    await AdminSetting.deleteMany({});
    await AdminSetting.insertMany([
      {
        key: 'monsoonSurge',
        value: false,
        description: 'Monsoon Rain Fee Surge status (+₹49)',
      },
      {
        key: 'broadcast',
        value: '⛈️ Heavy Monsoon Alert in Mumbai: Services are running with verified rain gear.',
        description: 'Top announcement bar broadcast message',
      },
      {
        key: 'auditLogs',
        value: [
          {
            id: 'LOG-1',
            action: 'System Initialized',
            details: 'MongoDB Seeder initialized Urban Company database',
            adminName: 'System Architect',
            timestamp: new Date().toLocaleTimeString('en-GB') + ', ' + new Date().toLocaleDateString('en-GB'),
          },
        ],
        description: 'Admin audit logs trail',
      },
    ]);
    console.log('✅ Admin settings seeded.');

    console.log('🎉 MongoDB Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
