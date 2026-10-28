import { connectDB } from '../config/db.js';
import { WorkerApplication } from '../models/WorkerApplication.js';
import mongoose from 'mongoose';

async function main() {
  await connectDB();

  const pros = [
    {
      id: 'WRK-KRI-101',
      applicantName: 'V. Saravanan',
      phone: '+91 94432 10850',
      email: 'saravanan.ac@krishnagirihomeservices.in',
      trade: 'ac-appliances',
      tradeName: 'AC & Appliance Repair',
      categories: ['AC Service', 'Appliance Repair', 'Native Water Purifier'],
      skills: ['Powerjet AC Servicing', 'Gas Leak Repair', 'Compressor Diagnostic', 'Native Water Purifier Installation', 'Water Purifier Service'],
      city: 'Krishnagiri',
      locality: 'Rayakottai Road',
      serviceAreas: ['Rayakottai Road', 'Bangalore Road', 'Gandhi Nagar', 'Old Pet', 'Kattiganapalli'],
      experience: '7 years',
      toolsAvailable: 'Yes, Full Tool Kit & Jet Pump',
      hasSmartphone: 'Yes, Android 14',
      expectedIncome: '₹70,000 / month',
      status: 'Approved',
      dispatchState: 'Available',
      rating: 4.95,
      jobsCompleted: 412,
      location: { type: 'Point', coordinates: [78.2090, 12.5200] }
    },
    {
      id: 'WRK-KRI-102',
      applicantName: 'M. Prakash',
      phone: '+91 98421 77312',
      email: 'prakash.smartlock@krishnagirihomeservices.in',
      trade: 'quick-repairs',
      tradeName: 'Smart Locks, Electrician & Carpentry',
      categories: ['Smart Locks', 'Native Smart Locks', 'Electrician', 'Carpenter', 'Lock Installation', 'Home Services'],
      skills: ['Native Lock Pro Installation', 'Smart Lock Setup', 'Switchboard Repair', 'Fan Installation', 'Carpentry', 'Digital Lock Programming'],
      city: 'Krishnagiri',
      locality: 'Rayakottai Road',
      serviceAreas: ['Rayakottai Road', 'Bangalore Road', 'Gandhi Nagar', 'Old Pet', 'Kattiganapalli'],
      experience: '6 years',
      toolsAvailable: 'Yes, Precision Drilling Kit & Digital Calipers',
      hasSmartphone: 'Yes, Android 13',
      expectedIncome: '₹65,000 / month',
      status: 'Approved',
      dispatchState: 'Available',
      rating: 4.92,
      jobsCompleted: 345,
      location: { type: 'Point', coordinates: [78.2195, 12.5230] }
    },
    {
      id: 'WRK-KRI-103',
      applicantName: 'K. Selvam',
      phone: '+91 97890 44211',
      email: 'selvam.cleaning@krishnagirihomeservices.in',
      trade: 'cleaning-pest',
      tradeName: 'Deep Cleaning & Bathroom Sanitization',
      categories: ['Cleaning', 'Bathroom Cleaning', 'Full Home Cleaning', 'Pest Control', 'Home Cleaning'],
      skills: ['Classic Bathroom Cleaning', 'Intense Bathroom Clean', 'Single-use Chem Sanitization', 'Full Home Deep Clean', 'Cockroach Control'],
      city: 'Krishnagiri',
      locality: 'Old Pet',
      serviceAreas: ['Old Pet', 'Rayakottai Road', 'Bangalore Road', 'Gandhi Nagar', 'Kattiganapalli'],
      experience: '5 years',
      toolsAvailable: 'Yes, Commercial Scrubbers & Jet Cleaners',
      hasSmartphone: 'Yes, Android 14',
      expectedIncome: '₹55,000 / month',
      status: 'Approved',
      dispatchState: 'Available',
      rating: 4.94,
      jobsCompleted: 289,
      location: { type: 'Point', coordinates: [78.2140, 12.5265] }
    }
  ];

  for (const p of pros) {
    const existing = await WorkerApplication.findOne({ id: p.id });
    if (existing) {
      Object.assign(existing, p);
      await existing.save();
      console.log('Updated worker:', p.applicantName);
    } else {
      await WorkerApplication.create(p);
      console.log('Created worker:', p.applicantName);
    }
  }

  const total = await WorkerApplication.countDocuments();
  console.log('Total worker applications in Atlas:', total);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
