import { WorkerApplication } from '../models/WorkerApplication.js';
import { Booking } from '../models/Booking.js';

let mockLocations = [
  {
    id: 'LOC-1',
    city: 'Mumbai',
    state: 'Maharashtra',
    status: 'Active',
    activeSurge: false,
    surgeAmount: 0,
    coverageRadiusKm: 40,
    activePros: 0,
    monthlyGMV: 0,
    workingHours: { start: '08:00', end: '21:00', timezone: 'Asia/Kolkata (IST, UTC+05:30)' },
    slotCapacityPerHour: 35,
    holidays: ['26 Jan 2027 (Republic Day)', '15 Aug 2027 (Independence Day)', '24 Oct 2027 (Diwali)'],
    hubs: [
      { name: 'Bandra West Central Hub', locality: 'Bandra West', address: 'Plot 14, Perry Road', activePros: 140 },
      { name: 'Andheri East Technology Depot', locality: 'Andheri East', address: 'MIDC Cross Road', activePros: 210 },
      { name: 'Khar & Santacruz Operational Post', locality: 'Khar West', address: '14th Road', activePros: 95 },
      { name: 'Powai Lakes Depot', locality: 'Powai', address: 'Hiranandani Business Park', activePros: 180 },
      { name: 'Colaba South Mumbai Hub', locality: 'Colaba', address: 'Cuffe Parade', activePros: 85 }
    ],
    postalCodes: [
      { pincode: '400050', area: 'Bandra West', serviceable: true, activeCategories: ['AC Repair', 'Cleaning', 'Salon', 'Electrical'] },
      { pincode: '400051', area: 'Bandra Kurla Complex (BKC)', serviceable: true, activeCategories: ['Cleaning', 'AC Repair'] },
      { pincode: '400052', area: 'Khar West', serviceable: true, activeCategories: ['AC Repair', 'Cleaning', 'Salon', 'Electrical'] },
      { pincode: '400054', area: 'Santacruz West', serviceable: true, activeCategories: ['AC Repair', 'Cleaning', 'Salon'] },
      { pincode: '400069', area: 'Andheri East', serviceable: true, activeCategories: ['AC Repair', 'Cleaning', 'Electrical'] },
      { pincode: '400076', area: 'Powai', serviceable: true, activeCategories: ['AC Repair', 'Cleaning', 'Salon', 'Electrical'] },
      { pincode: '400005', area: 'Colaba', serviceable: true, activeCategories: ['AC Repair', 'Cleaning', 'Salon'] }
    ]
  },
  {
    id: 'LOC-2',
    city: 'Krishnagiri',
    state: 'Tamil Nadu',
    status: 'Active',
    activeSurge: false,
    surgeAmount: 0,
    coverageRadiusKm: 25,
    activePros: 48,
    monthlyGMV: 684000,
    workingHours: { start: '08:00', end: '20:00', timezone: 'Asia/Kolkata (IST, UTC+05:30)' },
    slotCapacityPerHour: 12,
    holidays: ['14 Jan 2027 (Pongal)', '15 Jan 2027 (Thiruvalluvar Day)', '15 Aug 2027 (Independence Day)'],
    hubs: [
      { name: 'Krishnagiri Central Depot', locality: 'Rayakottai Road', address: '45 Green Meadows Road', activePros: 24 },
      { name: 'SIPCOT Industrial Zone Hub', locality: 'SIPCOT', address: 'Phase 2 Complex', activePros: 14 },
      { name: 'Old Pet Dispatch Station', locality: 'Old Pet', address: 'Bazaar Street', activePros: 10 }
    ],
    postalCodes: [
      { pincode: '635001', area: 'Krishnagiri Town & Rayakottai Road', serviceable: true, activeCategories: ['Cleaning', 'AC Repair', 'Electrical', 'Plumbing'] },
      { pincode: '635002', area: 'Old Pet & Gandhi Nagar', serviceable: true, activeCategories: ['Cleaning', 'Electrical'] },
      { pincode: '635115', area: 'SIPCOT Industrial Estate', serviceable: true, activeCategories: ['Commercial Cleaning', 'AC Repair'] }
    ]
  },
  {
    id: 'LOC-3',
    city: 'Bengaluru',
    state: 'Karnataka',
    status: 'Active',
    activeSurge: false,
    surgeAmount: 0,
    coverageRadiusKm: 35,
    activePros: 450,
    monthlyGMV: 3120000,
    workingHours: { start: '08:00', end: '21:00', timezone: 'Asia/Kolkata (IST, UTC+05:30)' },
    slotCapacityPerHour: 28,
    holidays: ['01 Nov 2027 (Kannada Rajyotsava)', '26 Jan 2027 (Republic Day)'],
    hubs: [
      { name: 'Koramangala 4th Block Depot', locality: 'Koramangala', address: '80ft Road', activePros: 160 },
      { name: 'Indiranagar 100ft Road Station', locality: 'Indiranagar', address: '12th Main', activePros: 140 },
      { name: 'HSR Layout Sector 1 Hub', locality: 'HSR Layout', address: '27th Main', activePros: 150 }
    ],
    postalCodes: [
      { pincode: '560034', area: 'Koramangala', serviceable: true, activeCategories: ['AC Repair', 'Cleaning', 'Salon', 'Electrical'] },
      { pincode: '560038', area: 'Indiranagar', serviceable: true, activeCategories: ['AC Repair', 'Cleaning', 'Salon', 'Electrical'] },
      { pincode: '560102', area: 'HSR Layout', serviceable: true, activeCategories: ['AC Repair', 'Cleaning', 'Salon', 'Electrical'] }
    ]
  },
  {
    id: 'LOC-4',
    city: 'Delhi NCR',
    state: 'Delhi',
    status: 'Active',
    activeSurge: false,
    surgeAmount: 0,
    coverageRadiusKm: 45,
    activePros: 520,
    monthlyGMV: 3890000,
    workingHours: { start: '08:00', end: '21:00', timezone: 'Asia/Kolkata (IST, UTC+05:30)' },
    slotCapacityPerHour: 30,
    holidays: ['26 Jan 2027 (Republic Day)', '15 Aug 2027 (Independence Day)'],
    hubs: [
      { name: 'South Extension Part II Depot', locality: 'South Extension', address: 'Main Ring Road', activePros: 180 },
      { name: 'Gurugram Sector 29 Hub', locality: 'Gurugram Sector 29', address: 'Leisure Valley Road', activePros: 190 },
      { name: 'Noida Sector 18 Complex', locality: 'Noida Sector 18', address: 'Atta Market Road', activePros: 150 }
    ],
    postalCodes: [
      { pincode: '110049', area: 'South Extension', serviceable: true, activeCategories: ['AC Repair', 'Cleaning', 'Salon', 'Electrical'] },
      { pincode: '122002', area: 'Gurugram Sector 29 & 43', serviceable: true, activeCategories: ['AC Repair', 'Cleaning', 'Salon'] },
      { pincode: '201301', area: 'Noida Sector 18', serviceable: true, activeCategories: ['AC Repair', 'Cleaning', 'Salon'] }
    ]
  }
];

// 1. Get All Locations & Operational Zones
export async function getLocations(req, res) {
  try {
    const [workers, bookings] = await Promise.all([
      WorkerApplication.find().lean().catch(() => []),
      Booking.find().lean().catch(() => [])
    ]);

    const enrichedLocations = mockLocations.map(loc => {
      const cityWorkers = workers.filter(w => 
        (w.city || '').toLowerCase() === loc.city.toLowerCase() && 
        (w.status === 'Approved' || w.status === 'Active')
      );
      const cityBookings = bookings.filter(b => 
        (b.city || '').toLowerCase() === loc.city.toLowerCase()
      );
      const cityGmv = cityBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

      return {
        ...loc,
        activePros: cityWorkers.length,
        monthlyGMV: cityGmv
      };
    });

    return res.json({
      success: true,
      count: enrichedLocations.length,
      locations: enrichedLocations
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Toggle Weather Surge
export async function toggleSurge(req, res) {
  try {
    const { cityId, active, surgeAmount = 49 } = req.body;
    let loc = mockLocations.find(l => l.id === cityId || l.city.toLowerCase() === (cityId || '').toLowerCase());
    if (loc) {
      loc.activeSurge = active;
      loc.surgeAmount = active ? parseFloat(surgeAmount) || 49 : 0;
    }
    return res.json({
      success: true,
      message: `Weather surge ${active ? 'activated (+₹' + (surgeAmount || 49) + ')' : 'deactivated'} for ${loc ? loc.city : 'zone'}`,
      location: loc
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Add / Update Postal Code Pincode Coverage
export async function updatePincodeCoverage(req, res) {
  try {
    const { cityId, pincode, area, serviceable, activeCategories } = req.body;
    let loc = mockLocations.find(l => l.id === cityId);
    if (!loc) {
      return res.status(404).json({ success: false, error: 'City not found' });
    }

    let existingPin = loc.postalCodes.find(p => p.pincode === pincode);
    if (existingPin) {
      existingPin.serviceable = serviceable;
      if (area) existingPin.area = area;
      if (activeCategories) existingPin.activeCategories = activeCategories;
    } else {
      loc.postalCodes.push({
        pincode,
        area: area || 'New Zone',
        serviceable: serviceable !== false,
        activeCategories: activeCategories || ['AC Repair', 'Cleaning', 'Salon', 'Electrical']
      });
    }

    return res.json({ success: true, message: `Pincode ${pincode} serviceability updated`, location: loc });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 4. Update Slot Capacity & Working Hours
export async function updateWorkingHoursCapacity(req, res) {
  try {
    const { cityId, slotCapacityPerHour, workingHours } = req.body;
    let loc = mockLocations.find(l => l.id === cityId);
    if (!loc) {
      return res.status(404).json({ success: false, error: 'City not found' });
    }

    if (slotCapacityPerHour) loc.slotCapacityPerHour = parseInt(slotCapacityPerHour) || 20;
    if (workingHours) loc.workingHours = { ...loc.workingHours, ...workingHours };

    return res.json({ success: true, message: `Operating parameters updated for ${loc.city}`, location: loc });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 5. Validate Serviceability Check (Strict check: Rejects unsupported postal codes during booking)
export async function checkServiceability(req, res) {
  try {
    const { city, pincode, serviceCategory } = req.query;

    if (!pincode) {
      return res.status(400).json({ success: false, serviceable: false, error: 'Postal code required' });
    }

    let loc = mockLocations.find(l => (city ? l.city.toLowerCase() === city.toLowerCase() : true) &&
      l.postalCodes.some(p => p.pincode === pincode)
    );

    if (!loc) {
      return res.status(404).json({
        success: false,
        serviceable: false,
        message: `Sorry, postal code ${pincode} is currently outside our verified serviceability perimeter.`
      });
    }

    const pinObj = loc.postalCodes.find(p => p.pincode === pincode);
    if (!pinObj || !pinObj.serviceable) {
      return res.status(400).json({
        success: false,
        serviceable: false,
        message: `Postal code ${pincode} (${pinObj?.area || 'Area'}) is temporarily non-serviceable.`
      });
    }

    return res.json({
      success: true,
      serviceable: true,
      city: loc.city,
      area: pinObj.area,
      pincode: pinObj.pincode,
      activeSurge: loc.activeSurge,
      surgeAmount: loc.surgeAmount,
      availableCategories: pinObj.activeCategories
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
