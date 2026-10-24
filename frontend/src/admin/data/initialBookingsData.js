// Pre-seeded, realistic 143 bookings dataset for Forge India Connect / Urban Company Admin Dispatch
// Matching the 143 count shown in dashboard overview metrics & sidebar dispatch control badge

const CUSTOMERS = [
  { name: 'Aarav Mehta', phone: '+91 98201 11223', email: 'aarav.mehta@example.com' },
  { name: 'Sneha Roy', phone: '+91 98112 44556', email: 'sneha.roy@example.com' },
  { name: 'Vikram Merchant', phone: '+91 98330 99887', email: 'vikram.m@example.com' },
  { name: 'Pooja Iyer', phone: '+91 98450 67123', email: 'pooja.iyer@example.com' },
  { name: 'Rohan Mehra', phone: '+91 98765 43210', email: 'rohan.mehra@example.com' },
  { name: 'Priya Sundaram', phone: '+91 98204 88712', email: 'priya.sundaram@example.com' },
  { name: 'Ananya Deshmukh', phone: '+91 98332 55412', email: 'ananya.d@example.com' },
  { name: 'Karthik Swaminathan', phone: '+91 98401 22987', email: 'karthik.s@example.com' },
  { name: 'Meera Nair', phone: '+91 98470 33412', email: 'meera.nair@example.com' },
  { name: 'Deepak Verma', phone: '+91 98103 44901', email: 'deepak.verma@example.com' },
  { name: 'Rajesh Patel', phone: '+91 98250 88231', email: 'rajesh.patel@example.com' },
  { name: 'Divya Ramesh', phone: '+91 98451 90876', email: 'divya.ramesh@example.com' },
  { name: 'Suresh G.', phone: '+91 98422 11098', email: 'suresh.g@example.com' },
  { name: 'Kavita Shah', phone: '+91 98209 77654', email: 'kavita.shah@example.com' },
  { name: 'Amitabh Sengupta', phone: '+91 98300 44219', email: 'amitabh.s@example.com' },
  { name: 'Bhavna Kulkarni', phone: '+91 98220 66543', email: 'bhavna.k@example.com' },
  { name: 'Naveen Reddy', phone: '+91 98490 88123', email: 'naveen.reddy@example.com' },
  { name: 'Tanvi Kapoor', phone: '+91 98118 77234', email: 'tanvi.kapoor@example.com' },
  { name: 'Gautam Singhania', phone: '+91 98205 33219', email: 'gautam.s@example.com' },
  { name: 'Lakshmi Narayanan', phone: '+91 98402 77651', email: 'lakshmi.n@example.com' }
];

const LOCATIONS = [
  // Mumbai Hub
  { city: 'Mumbai', zone: 'Bandra West', flat: 'Flat 402, Sea Green Apartments, Perry Cross Rd', landmark: 'Near Carter Road Promenade', pincode: '400050' },
  { city: 'Mumbai', zone: 'Pali Hill', flat: 'B-12, Pali Hill View, Nargis Dutt Road', landmark: 'Near Zig Zag Road', pincode: '400050' },
  { city: 'Mumbai', zone: 'Khar West', flat: '14, 14th Road, Khar West', landmark: 'Behind Khar Gymkhana', pincode: '400052' },
  { city: 'Mumbai', zone: 'Juhu', flat: 'Villa 7, Gulmohar Cross Rd 9, JVPD Scheme', landmark: 'Opposite Juhu Club Millennium', pincode: '400049' },
  { city: 'Mumbai', zone: 'Andheri West', flat: 'Tower 4, Flat 1102, Oberoi Springs, Off Link Rd', landmark: 'Next to Star Bazaar', pincode: '400053' },
  { city: 'Mumbai', zone: 'Powai', flat: 'Lake Castle 901, Hiranandani Gardens', landmark: 'Near Galleria Mall', pincode: '400076' },
  // Krishnagiri Hub
  { city: 'Krishnagiri', zone: 'Rayakottai Road', flat: 'Plot 45, Green Meadows, Rayakottai Road', landmark: 'Near Collectorate Office', pincode: '635001' },
  { city: 'Krishnagiri', zone: 'Bangalore Road', flat: 'No 12/B, Old Bangalore Road, Gandhi Nagar', landmark: 'Near Government Arts College', pincode: '635002' },
  { city: 'Krishnagiri', zone: 'Kattiganapalli', flat: 'Shree Krishna Nilayam, Kattiganapalli Ext', landmark: 'Behind Polytechnic College', pincode: '635003' },
  // Bengaluru Hub
  { city: 'Bengaluru', zone: 'Koramangala 4th Block', flat: 'Flat 301, Pine Valley Apartments, 80 Feet Rd', landmark: 'Near Maharaja Signal', pincode: '560034' },
  { city: 'Bengaluru', zone: 'Indiranagar', flat: '1084, 12th Main Rd, HAL 2nd Stage', landmark: 'Behind Toit Pub', pincode: '560038' },
  { city: 'Bengaluru', zone: 'HSR Layout Sector 1', flat: 'Villa 22, 19th Main, Sector 1', landmark: 'Opposite Agara Lake Park', pincode: '560102' },
  // Delhi NCR Hub
  { city: 'Delhi NCR', zone: 'Gurugram Sector 43', flat: 'Tower C, Apartment 904, Sector 43', landmark: 'Near Golf Course Road', pincode: '122002' },
  { city: 'Delhi NCR', zone: 'South Extension II', flat: 'D-42, 2nd Floor, South Extension Part II', landmark: 'Near AIIMS Ring Road', pincode: '110049' }
];

const SERVICES_LIST = [
  { id: 'srv-ac-1', title: 'Powerjet AC Servicing (Split)', category: 'ac-appliances', price: 699, durationMins: 60 },
  { id: 'srv-ac-2', title: 'Anti-Rust AC Deep Foam Cleansing', category: 'ac-appliances', price: 899, durationMins: 75 },
  { id: 'srv-ac-3', title: 'AC Gas Leak Investigation & Refill', category: 'ac-appliances', price: 1499, durationMins: 90 },
  { id: 'srv-clean-1', title: 'Classic Bathroom Deep Cleaning', category: 'cleaning-pest', price: 499, durationMins: 90 },
  { id: 'srv-clean-2', title: 'Intense Kitchen & Chimney Degreasing', category: 'cleaning-pest', price: 1299, durationMins: 120 },
  { id: 'srv-clean-3', title: 'Sofa & Fabric Upholstery Shampooing', category: 'cleaning-pest', price: 799, durationMins: 90 },
  { id: 'srv-clean-full', title: 'Full Home Deep Cleaning (2 BHK)', category: 'cleaning-home', price: 2499, durationMins: 240 },
  { id: 'srv-clean-full3', title: 'Full Home Deep Cleaning (3 BHK)', category: 'cleaning-home', price: 3499, durationMins: 300 },
  { id: 'srv-pest-1', title: 'Bed Bug & Cockroach Control Shield', category: 'cleaning-pest', price: 899, durationMins: 60 },
  { id: 'srv-elec-1', title: 'Switch & Socket Installation (Modular)', category: 'quick-repairs', price: 299, durationMins: 45 },
  { id: 'srv-elec-2', title: 'Ceiling Fan Installation & Wiring Check', category: 'quick-repairs', price: 249, durationMins: 45 },
  { id: 'srv-plumb-1', title: 'Basin & Kitchen Sink Tap Repair / Fitting', category: 'quick-repairs', price: 349, durationMins: 45 },
  { id: 'srv-salon-w1', title: 'Salon Royale Mani-Pedi & Glow Facial', category: 'salon-women', price: 1499, durationMins: 105 },
  { id: 'srv-salon-w2', title: 'Chocolate Waxing & Threading Combo', category: 'salon-women', price: 899, durationMins: 60 },
  { id: 'srv-salon-m1', title: 'Men\'s Prime Haircut & Beard Grooming', category: 'salon-men', price: 499, durationMins: 50 },
  { id: 'srv-app-1', title: 'Microwave Diagnostic & Magnetron Service', category: 'ac-appliances', price: 799, durationMins: 60 },
  { id: 'srv-app-2', title: 'Fully Automatic Washing Machine Check', category: 'ac-appliances', price: 599, durationMins: 60 }
];

const PROFESSIONALS = [
  { id: 'PRO-8841', name: 'Vikram Salvi', phone: '+91 98205 11982', trade: 'Master AC Specialist & Electrician' },
  { id: 'PRO-8842', name: 'Rajesh Kumar', phone: '+91 98201 44521', trade: 'Appliance Repair & Electrical Lead' },
  { id: 'PRO-8843', name: 'Sunil Vishwakarma', phone: '+91 98332 10984', trade: 'Deep Cleaning Specialist' },
  { id: 'PRO-8844', name: 'Ramesh Vishwakarma', phone: '+91 98205 11982', trade: 'AC & Appliance Technician' },
  { id: 'PRO-8845', name: 'Sunita Chauhan', phone: '+91 98190 22345', trade: 'Salon & Spa Expert' },
  { id: 'PRO-8846', name: 'Selvam Fleet Pro', phone: '+91 98422 55431', trade: 'Home Services Specialist (Krishnagiri)' },
  { id: 'PRO-8847', name: 'Dilip Mistry', phone: '+91 98331 44567', trade: 'Master Plumber & Handyman' },
  { id: 'PRO-8848', name: 'Pooja Bhatt', phone: '+91 98207 66554', trade: 'Salon Aesthetician' },
  { id: 'PRO-8849', name: 'Anil Jadhav', phone: '+91 98198 33211', trade: 'Pest Control Technician' }
];

const PARTNER_AGENCIES = [
  'Apex Home Solutions LLP',
  'SwiftClean Pro Agency',
  'UrbanPro Fleet Mumbai',
  'Krishnagiri QuickCare Partners',
  ''
];

const SLOTS = [
  'Today, 09:30 AM - 10:30 AM',
  'Today, 11:00 AM - 12:00 PM',
  'Today, 01:30 PM - 02:30 PM',
  'Today, 02:00 PM - 03:00 PM',
  'Today, 03:30 PM - 04:30 PM',
  'Today, 05:00 PM - 06:00 PM',
  'Today, 06:30 PM - 07:30 PM',
  'Tomorrow, 10:00 AM - 11:30 AM',
  'Tomorrow, 02:00 PM - 03:30 PM',
  'Tomorrow, 04:30 PM - 06:00 PM',
  'Yesterday, 11:00 AM - 12:00 PM',
  'Yesterday, 03:00 PM - 04:30 PM'
];

const PAYMENT_METHODS = [
  'Google Pay (UPI)',
  'PhonePe (UPI)',
  'Credit Card (HDFC Visa)',
  'Debit Card (ICICI)',
  'Paytm UPI',
  'NetBanking',
  'Cash on Delivery'
];

export function generate143Bookings() {
  const list = [];
  const now = Date.now();

  // Status mapping for exact 143 items:
  // 8 Pending (Unassigned), 36 Confirmed, 28 Assigned, 14 En Route, 16 In Progress, 34 Completed, 7 Cancelled
  // Total = 8 + 36 + 28 + 14 + 16 + 34 + 7 = 143
  const statusPlan = [
    ...Array(8).fill('Pending'),
    ...Array(36).fill('Confirmed'),
    ...Array(28).fill('Assigned'),
    ...Array(14).fill('En Route'),
    ...Array(16).fill('In Progress'),
    ...Array(34).fill('Completed'),
    ...Array(7).fill('Cancelled')
  ];

  for (let i = 0; i < 143; i++) {
    const bookingNum = 9801 + i;
    const bookingId = `ORD-${bookingNum}`;
    const status = statusPlan[i] || 'Confirmed';
    const isUnassigned = status === 'Pending';
    const isCancelled = status === 'Cancelled';
    const isCompleted = status === 'Completed';

    const customer = CUSTOMERS[i % CUSTOMERS.length];
    const loc = LOCATIONS[i % LOCATIONS.length];
    const srv = SERVICES_LIST[i % SERVICES_LIST.length];
    const pro = PROFESSIONALS[i % PROFESSIONALS.length];
    const partnerAgency = PARTNER_AGENCIES[i % PARTNER_AGENCIES.length];
    const slot = SLOTS[i % SLOTS.length];
    const payMethod = PAYMENT_METHODS[i % PAYMENT_METHODS.length];

    const hasDiscount = (i % 4 === 0);
    const hasSurge = (i % 6 === 0);
    const discount = hasDiscount ? 100 : 0;
    const convenienceFee = 49;
    const surgeFee = hasSurge ? 49 : 0;
    const taxes = Math.round(srv.price * 0.18);
    const totalAmount = srv.price - discount + convenienceFee + taxes + surgeFee;

    const paymentStatus = isCancelled ? 'Refunded' : (isUnassigned && i % 2 === 0 ? 'Pending' : 'Paid');

    // Stagger timestamps across the last 3 days
    const createdOffsetMs = (i * 18 * 60 * 1000) + ((i % 10) * 120000);
    const createdAt = new Date(now - createdOffsetMs);

    const timeline = [
      {
        id: `tl-${i}-1`,
        status: 'Pending',
        title: 'Order Placed',
        description: `Customer confirmed cart with ${srv.title}.`,
        actor: customer.name,
        actorRole: 'Customer',
        timestamp: createdAt
      }
    ];

    if (status !== 'Pending') {
      timeline.push({
        id: `tl-${i}-2`,
        status: 'Confirmed',
        title: 'Payment & Slot Confirmed',
        description: `${payMethod} verification settled successfully.`,
        actor: 'Payment Gateway',
        actorRole: 'System',
        timestamp: new Date(createdAt.getTime() + 120000)
      });
    }

    if (!isUnassigned) {
      timeline.push({
        id: `tl-${i}-3`,
        status: 'Assigned',
        title: 'Technician Assigned',
        description: `Assigned to ${pro.name} (${pro.trade}).`,
        actor: 'Auto Dispatch Engine',
        actorRole: 'System',
        timestamp: new Date(createdAt.getTime() + 480000)
      });
    }

    if (status === 'En Route' || status === 'In Progress' || isCompleted) {
      timeline.push({
        id: `tl-${i}-4`,
        status: 'En Route',
        title: 'Technician En Route',
        description: `${pro.name} departed towards ${loc.zone}.`,
        actor: pro.name,
        actorRole: 'Professional',
        timestamp: new Date(createdAt.getTime() + 1200000)
      });
    }

    if (status === 'In Progress' || isCompleted) {
      timeline.push({
        id: `tl-${i}-5`,
        status: 'In Progress',
        title: 'Service Commenced',
        description: 'Customer 4-digit start OTP successfully verified.',
        actor: pro.name,
        actorRole: 'Professional',
        timestamp: new Date(createdAt.getTime() + 2400000)
      });
    }

    if (isCompleted) {
      timeline.push({
        id: `tl-${i}-6`,
        status: 'Completed',
        title: 'Service Completed',
        description: 'Customer inspected deliverables and signed off digitally.',
        actor: pro.name,
        actorRole: 'Professional',
        timestamp: new Date(createdAt.getTime() + 5400000)
      });
    }

    if (isCancelled) {
      timeline.push({
        id: `tl-${i}-cancel`,
        status: 'Cancelled',
        title: 'Booking Cancelled',
        description: 'Customer rescheduled appointment due to personal conflict.',
        actor: customer.name,
        actorRole: 'Customer',
        timestamp: new Date(createdAt.getTime() + 600000)
      });
    }

    const itemRecord = {
      id: srv.id,
      title: srv.title,
      qty: 1,
      price: srv.price,
      durationMins: srv.durationMins
    };

    list.push({
      id: bookingId,
      bookingReference: bookingId,
      customerId: `CUST-${1000 + (i % 20)}`,
      userName: customer.name,
      customerName: customer.name,
      userPhone: customer.phone,
      userEmail: customer.email,
      serviceName: srv.title,
      serviceCategory: srv.category,
      category: srv.category,
      items: [itemRecord],
      pricingBreakdown: {
        subtotal: srv.price,
        discount: discount,
        couponCode: hasDiscount ? 'SAVEDISPATCH' : '',
        convenienceFee: convenienceFee,
        taxes: taxes,
        surgeFee: surgeFee,
        total: totalAmount
      },
      totalAmount: totalAmount,
      city: loc.city,
      serviceZone: loc.zone,
      locality: loc.zone,
      address: `${loc.flat}, ${loc.zone}, ${loc.city} - ${loc.pincode}`,
      addressDetails: {
        fullAddress: loc.flat,
        locality: loc.zone,
        city: loc.city,
        landmark: loc.landmark,
        pincode: loc.pincode,
        contactPhone: customer.phone
      },
      slot: slot,
      scheduledDate: new Date(createdAt.getTime() + 86400000).toISOString(),
      scheduledStartTime: '11:00',
      scheduledEndTime: '12:30',
      status: status,
      paymentStatus: paymentStatus,
      paymentMethod: payMethod,
      paymentDetails: {
        gatewayRef: `gw_txn_${bookingNum}_ref`,
        transactionId: `TXN-902${bookingNum}`,
        paidAt: createdAt
      },
      assignedPartner: isUnassigned ? '' : pro.name,
      assignedProfessional: isUnassigned ? null : {
        id: pro.id,
        name: pro.name,
        phone: pro.phone,
        trade: pro.trade,
        assignedAt: new Date(createdAt.getTime() + 480000)
      },
      partnerAgency: partnerAgency,
      assignedBusinessPartner: partnerAgency ? {
        id: `PTR-${90100 + (i % 4)}`,
        name: partnerAgency
      } : null,
      customerInstructions: (i % 3 === 0) ? 'Please ring bell twice and call upon arrival.' : 'Technician should wear clean boot covers.',
      internalNotes: (i % 5 === 0) ? [
        {
          id: `note-${i}-1`,
          note: 'Customer confirmed gate entry code is #402. High priority VIP dispatch.',
          author: 'Priya Sundaram',
          authorRole: 'Operations Lead',
          createdAt: createdAt
        }
      ] : [],
      timeline: timeline,
      cancelReason: isCancelled ? 'Customer rescheduled appointment due to personal conflict.' : '',
      invoiceNumber: `INV-2026-${bookingNum}`,
      createdAt: createdAt.toISOString()
    });
  }

  return list;
}

// Cached singleton of 143 bookings
let _seeded143 = null;

export function getSeeded143Bookings() {
  if (!_seeded143) {
    try {
      const stored = localStorage.getItem('uc_admin_143_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 100) {
          _seeded143 = parsed;
          return _seeded143;
        }
      }
    } catch {}

    _seeded143 = generate143Bookings();
    try {
      localStorage.setItem('uc_admin_143_bookings', JSON.stringify(_seeded143));
    } catch {}
  }
  return _seeded143;
}

export function saveSeeded143Bookings(updatedList) {
  _seeded143 = updatedList;
  try {
    localStorage.setItem('uc_admin_143_bookings', JSON.stringify(updatedList));
  } catch {}
}
