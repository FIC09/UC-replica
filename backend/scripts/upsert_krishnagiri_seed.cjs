const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/urban_company';

async function upsertKrishnagiriData() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const krishnagiriWorkers = [
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
      }
    ];

    for (const w of krishnagiriWorkers) {
      await mongoose.connection.collection('workerapplications').updateOne(
        { id: w.id },
        { $set: w },
        { upsert: true }
      );
      console.log('✅ Upserted worker:', w.id, w.applicantName);
    }

    const krishnagiriPartner = {
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
    };

    await mongoose.connection.collection('partnerapplications').updateOne(
      { id: krishnagiriPartner.id },
      { $set: krishnagiriPartner },
      { upsert: true }
    );
    console.log('✅ Upserted partner:', krishnagiriPartner.id, krishnagiriPartner.businessName);

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Error upserting:', err);
    process.exit(1);
  }
}

upsertKrishnagiriData();
