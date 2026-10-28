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

import dns from 'dns';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ATLAS_MONGO_URI = 'mongodb+srv://forgeindiaconnecttech26_db_user:lmyALE1vtNWEi6Ag@cluster0.my7b6sy.mongodb.net/urban_company?retryWrites=true&w=majority';
const MONGO_URI = process.env.MONGO_URI || ATLAS_MONGO_URI;
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

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
      pricingBreakdown: {
        subtotal: 499,
        discount: 0,
        couponCode: '',
        convenienceFee: 49,
        taxes: 0,
        surgeFee: 0,
        total: 548,
      },
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
        id: 'WRK-KRI-101',
        applicantName: 'V. Saravanan',
        phone: '+91 94432 10850',
        email: 'saravanan.ac@krishnagirihomeservices.in',
        trade: 'ac-appliances',
        tradeName: 'AC & Appliance Repair',
        categories: ['AC Service', 'Appliance Repair', 'AC Service and Repair'],
        skills: ['Powerjet AC Servicing', 'Gas Leak Repair', 'Compressor Diagnostic', 'AC Service and Repair', 'AC Repair'],
        city: 'Krishnagiri',
        locality: 'Rayakottai Road',
        serviceAreas: ['Rayakottai Road', 'Bangalore Road', 'Gandhi Nagar', 'Old Pet', 'Kattiganapalli', 'Londonpet', 'Collectorate & Master Plan'],
        experience: '7 years',
        toolsAvailable: 'Yes, Full Tool Kit & Jet Pump',
        hasSmartphone: 'Yes, Android 14',
        expectedIncome: '₹70,000 / month',
        status: 'Approved',
        dispatchState: 'Available',
        rating: 4.95,
        jobsCompleted: 412,
        onTimeArrivalRate: 99.2,
        cancellationRate: 0.4,
        partnerAgencyId: 'PTR-KRI-501',
        partnerAgencyName: 'Krishnagiri Native Home Care LLP',
      },
      {
        id: 'WRK-KRI-102',
        applicantName: 'M. Prakash',
        phone: '+91 98421 77312',
        email: 'prakash.electrician@krishnagirihomeservices.in',
        trade: 'quick-repairs',
        tradeName: 'Electrician & Quick Repairs',
        categories: ['Electrician', 'Plumbing', 'Carpenter'],
        skills: ['Switchboard Repair', 'Fan Installation', 'Pipe Leak Repair', 'Wiring', 'Electrician', 'Plumber'],
        city: 'Krishnagiri',
        locality: 'Gandhi Nagar',
        serviceAreas: ['Gandhi Nagar', 'Rayakottai Road', 'Bangalore Road', 'Old Pet', 'Kattiganapalli'],
        experience: '6 years',
        toolsAvailable: 'Yes, Digital Multimeter & Pipe Wrenches',
        hasSmartphone: 'Yes, Android 13',
        expectedIncome: '₹60,000 / month',
        status: 'Approved',
        dispatchState: 'Available',
        rating: 4.89,
        jobsCompleted: 310,
        onTimeArrivalRate: 98.4,
        cancellationRate: 0.8,
        partnerAgencyId: 'PTR-KRI-501',
        partnerAgencyName: 'Krishnagiri Native Home Care LLP',
      },
      {
        id: 'WRK-KRI-103',
        applicantName: 'K. Selvam',
        phone: '+91 97890 44211',
        email: 'selvam.cleaning@krishnagirihomeservices.in',
        trade: 'cleaning-pest',
        tradeName: 'Deep Cleaning & Pest Control',
        categories: ['Deep Cleaning', 'Bathroom Cleaning', 'Kitchen Cleaning', 'Pest Control'],
        skills: ['Intense Bathroom Clean', 'Single-use Chem Sanitization', 'Full Home Deep Clean', 'Cockroach Control'],
        city: 'Krishnagiri',
        locality: 'Old Pet',
        serviceAreas: ['Old Pet', 'Rayakottai Road', 'Bangalore Road', 'Gandhi Nagar', 'Collectorate & Master Plan'],
        experience: '5 years',
        toolsAvailable: 'Yes, Commercial Scrubbers & Jet Cleaners',
        hasSmartphone: 'Yes, Android 14',
        expectedIncome: '₹55,000 / month',
        status: 'Approved',
        dispatchState: 'Available',
        rating: 4.93,
        jobsCompleted: 275,
        onTimeArrivalRate: 99.0,
        cancellationRate: 0.5,
        partnerAgencyId: 'PTR-KRI-501',
        partnerAgencyName: 'Krishnagiri Native Home Care LLP',
      },
      {
        id: 'WRK-CHN-101',
        applicantName: 'K. Murugan',
        phone: '+91 98401 22345',
        trade: 'ac-appliances',
        tradeName: 'AC & Appliance Repair',
        categories: ['AC Service', 'Appliance Repair'],
        skills: ['Powerjet AC Servicing', 'Gas Leak Repair', 'Compressor Diagnostic'],
        city: 'Chennai',
        locality: 'T. Nagar',
        operationalHub: 'T. Nagar Central Hub',
        serviceAreas: ['T. Nagar', 'Mylapore', 'Alwarpet', 'Nungambakkam', 'Chennai Central'],
        experience: '6 years',
        toolsAvailable: 'Yes, Full Tool Kit & Jet Pump',
        hasSmartphone: 'Yes, Android 14',
        expectedIncome: '₹75,000 / month',
        status: 'Approved',
        dispatchState: 'Available',
        rating: 4.95,
        jobsCompleted: 340,
        onTimeArrivalRate: 99.2,
        cancellationRate: 0.5,
        partnerAgencyId: 'PTR-CHN-501',
        partnerAgencyName: 'Madras Home Care Pros LLP',
      },
      {
        id: 'WRK-CHN-102',
        applicantName: 'S. Karthik',
        phone: '+91 98402 33456',
        trade: 'ac-appliances',
        tradeName: 'AC & Appliance Repair',
        categories: ['AC Service', 'Appliance Repair'],
        skills: ['AC Deep Clean', 'Filter Replacement', 'PCB Diagnostic'],
        city: 'Chennai',
        locality: 'Adyar',
        operationalHub: 'Adyar Marine Hub',
        serviceAreas: ['Adyar', 'Velachery', 'Besant Nagar', 'OMR', 'Guindy'],
        experience: '4 years',
        toolsAvailable: 'Yes, Digital Gauges & Gas Kit',
        hasSmartphone: 'Yes, Android 13',
        expectedIncome: '₹65,000 / month',
        status: 'Approved',
        dispatchState: 'Available',
        rating: 4.88,
        jobsCompleted: 215,
        onTimeArrivalRate: 98.1,
        cancellationRate: 1.1,
        partnerAgencyId: 'PTR-CHN-501',
        partnerAgencyName: 'Madras Home Care Pros LLP',
      },
      {
        id: 'WRK-CHN-103',
        applicantName: 'R. Anitha',
        phone: '+91 98403 44567',
        trade: 'cleaning-pest',
        tradeName: 'Deep Cleaning & Pest Control',
        categories: ['Deep Cleaning', 'Bathroom Cleaning', 'Kitchen Cleaning'],
        skills: ['Intense Bathroom Clean', 'Single-use Chem Sanitization'],
        city: 'Chennai',
        locality: 'Anna Nagar',
        operationalHub: 'Anna Nagar West Depot',
        serviceAreas: ['Anna Nagar', 'Kilpauk', 'Shenoy Nagar'],
        experience: '5 years',
        toolsAvailable: 'Yes, Commercial Scrubbers',
        hasSmartphone: 'Yes, iOS 17',
        status: 'Approved',
        dispatchState: 'Available',
        rating: 4.96,
        jobsCompleted: 420,
        onTimeArrivalRate: 99.4,
        cancellationRate: 0.3,
      },
      {
        id: 'WRK-84210',
        applicantName: 'Ramesh Vishwakarma',
        phone: '+91 98205 11982',
        trade: 'ac-appliances',
        tradeName: 'AC & Appliance Repair',
        categories: ['AC Service', 'Appliance Repair'],
        skills: ['Powerjet AC Servicing', 'Window AC Overhaul'],
        city: 'Mumbai',
        locality: 'Bandra West',
        operationalHub: 'Bandra Logistics Hub',
        serviceAreas: ['Bandra West', 'Khar West', 'Santacruz'],
        experience: '5 years',
        status: 'Approved',
        dispatchState: 'Available',
        rating: 4.92,
        jobsCompleted: 290,
        onTimeArrivalRate: 98.6,
        cancellationRate: 0.8,
        partnerAgencyId: 'PTR-90142',
        partnerAgencyName: 'Apex Home Solutions LLP',
      },
      {
        id: 'WRK-84205',
        applicantName: 'Dilip Mistry',
        phone: '+91 98331 44567',
        trade: 'quick-repairs',
        tradeName: 'Electrician & Quick Repairs',
        city: 'Mumbai',
        locality: 'Andheri West',
        experience: '7+ years',
        status: 'Approved',
        dispatchState: 'Available',
        rating: 4.89,
        jobsCompleted: 510,
        onTimeArrivalRate: 97.9,
        cancellationRate: 1.2,
      },
    ]);
    console.log('✅ Worker applications seeded.');

    // 6. Seed Partner Applications
    console.log('Seeding partner applications...');
    await PartnerApplication.deleteMany({});
    await PartnerApplication.insertMany([
      {
        id: 'PTR-KRI-501',
        businessName: 'Krishnagiri Native Home Care LLP',
        ownerName: 'S. Venkatesh',
        phone: '+91 94430 88214',
        email: 'ops@krishnagirihomepros.in',
        businessType: 'LLP',
        category: 'ac-appliances',
        categoryName: 'AC Service & Repair',
        fleetSize: '12 Technicians',
        city: 'Krishnagiri',
        operatingLocations: ['Rayakottai Road', 'Bangalore Road', 'Gandhi Nagar', 'Old Pet', 'Kattiganapalli', 'Londonpet', 'Collectorate & Master Plan'],
        gstNumber: '33AAACK1234F1Z1',
        monthlyCapacity: '350-500 jobs/month',
        appliedAt: '15 Oct 2026, 09:30 AM',
        status: 'Approved',
      },
      {
        id: 'PTR-CHN-501',
        businessName: 'Madras Home Care Pros LLP',
        ownerName: 'V. Sundaram',
        phone: '+91 98400 11223',
        email: 'ops@madrashomepros.in',
        businessType: 'LLP',
        category: 'ac-appliances',
        categoryName: 'AC & Appliance Repair',
        fleetSize: '16 Technicians',
        city: 'Chennai',
        operatingLocations: ['T. Nagar', 'Adyar', 'Anna Nagar', 'Velachery', 'Mylapore', 'OMR'],
        gstNumber: '33AABCM1234F1Z9',
        monthlyCapacity: '400-600 jobs/month',
        appliedAt: '12 Oct 2026, 10:00 AM',
        status: 'Approved',
      },
      {
        id: 'PTR-90142',
        businessName: 'Apex Home Solutions LLP',
        ownerName: 'Sandeep Patil',
        phone: '+91 98210 33411',
        email: 'sandeep@apexhome.in',
        businessType: 'LLP',
        category: 'ac-appliances',
        categoryName: 'AC & Appliance Repair',
        fleetSize: '12 Technicians',
        city: 'Mumbai',
        operatingLocations: ['Bandra West', 'Khar', 'Santacruz'],
        gstNumber: '27AABCA1234F1Z8',
        monthlyCapacity: '250-400 jobs/month',
        appliedAt: '14 Oct 2026, 09:15 AM',
        status: 'Approved',
      },
      {
        id: 'PTR-90138',
        businessName: 'SwiftClean Pro Agency',
        ownerName: 'Meera Nair',
        phone: '+91 98200 77654',
        email: 'ops@swiftclean.co',
        businessType: 'Private Limited',
        category: 'cleaning-pest',
        categoryName: 'Deep Cleaning & Pest Control',
        fleetSize: '8 Specialist Cleaners',
        city: 'Mumbai',
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
