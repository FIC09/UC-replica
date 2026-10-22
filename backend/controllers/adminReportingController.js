// =========================================================================
// ADMIN REPORTING & EXPORTS CONTROLLER
// Provides comprehensive business intelligence, multi-dimensional breakdowns,
// CSV exports protected against spreadsheet formula injection,
// and accurate metric calculation methodologies.
// =========================================================================

// Spreadsheet formula injection guard (DDE attack mitigation)
export function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If first character is =, +, -, @, tab, or carriage return, prefix with single quote '
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

let mockReportsData = {
  // 1. Overall Financial Overview
  financials: {
    gmvTotalRupees: 4825000,
    netPlatformRevenueRupees: 965000, // 20% average take rate
    proPartnerSettlementsRupees: 3860000,
    tdsWithheldRupees: 38600, // 1% Section 194-O TDS
    gatewayFeesRupees: 86850, // ~1.8% gateway fee
    averageOrderValueRupees: 1256,
    calculationNotes: 'GMV represents total captured customer invoice gross value. Net platform revenue represents contractual platform commission take minus gateway processor costs.'
  },

  // 2. Bookings & Cancellations
  bookings: {
    totalBookings: 3840,
    completedBookings: 3580,
    inProgressBookings: 125,
    cancelledBookings: 135,
    cancellationRate: '3.5%',
    proCancelled: 28, // 0.7% Pro cancellation rate (penalties applied)
    customerCancelled: 107,
    topCancellationReasons: [
      { reason: 'Customer changed plans / rescheduling conflict', percentage: 48 },
      { reason: 'Technician traffic transit delay > 30 mins', percentage: 24 },
      { reason: 'Emergency / family travel', percentage: 16 },
      { reason: 'Address outside immediate gated community rules', percentage: 12 }
    ]
  },

  // 3. Refunds & Disputes
  refunds: {
    totalRefundClaimsCount: 42,
    totalRefundClaimedRupees: 38400,
    totalRefundApprovedRupees: 29800,
    rejectedClaimsCount: 14,
    avgRefundTurnaroundHours: 3.2,
    maximumBalanceEnforcedCount: 42 // 100% checked against max refundable balance guard
  },

  // 4. Professional Fleet Performance
  professionalPerformance: [
    { proName: 'Vikram Salvi', trade: 'AC Repair', jobsCompleted: 142, rating: 4.92, slaCompliance: '98.5%', repeatCustomerRequests: 38, avgDurationMins: 72 },
    { proName: 'Sunil Vishwakarma', trade: 'Deep Cleaning', jobsCompleted: 118, rating: 4.88, slaCompliance: '97.2%', repeatCustomerRequests: 24, avgDurationMins: 115 },
    { proName: 'Anita Deshmukh', trade: 'Salon at Home', jobsCompleted: 164, rating: 4.96, slaCompliance: '99.1%', repeatCustomerRequests: 58, avgDurationMins: 55 },
    { proName: 'Ramesh Plumber', trade: 'Plumbing', jobsCompleted: 98, rating: 4.78, slaCompliance: '95.4%', repeatCustomerRequests: 16, avgDurationMins: 45 }
  ],

  // 5. Franchise Business Partner Performance
  partnerPerformance: [
    { partnerName: 'Apex Home Solutions LLP', activeFleet: 12, completedJobs: 840, gmvGenerated: '₹10,55,040', commissionPaid: '₹2,11,008', slaFulfillment: '97.8%', complaintsCount: 2 },
    { partnerName: 'Krishnagiri QuickFix Care', activeFleet: 8, completedJobs: 520, gmvGenerated: '₹6,53,120', commissionPaid: '₹1,30,624', slaFulfillment: '98.4%', complaintsCount: 1 },
    { partnerName: 'CleanPro Facility Management', activeFleet: 10, completedJobs: 690, gmvGenerated: '₹8,66,640', commissionPaid: '₹1,73,328', slaFulfillment: '96.9%', complaintsCount: 3 }
  ],

  // 6. Category Breakdown
  categoryPerformance: [
    { category: "Women's Salon & Spa", orders: 1380, revenueRupees: 1737000, sharePercentage: 36 },
    { category: "AC Repair & Appliance Care", orders: 940, revenueRupees: 1351000, sharePercentage: 28 },
    { category: "Deep Cleaning & Pest Control", orders: 620, revenueRupees: 868500, sharePercentage: 18 },
    { category: "Men's Grooming & Hair Care", orders: 580, revenueRupees: 530750, sharePercentage: 11 },
    { category: "Electrician, Plumber & Carpentry", orders: 320, revenueRupees: 337750, sharePercentage: 7 }
  ],

  // 7. City Performance
  cityPerformance: [
    { city: "Bengaluru", bookings: 1420, gmvRupees: 1846000, slaRate: "98.1%", avgRating: 4.88, activePros: 420 },
    { city: "Mumbai Metro", bookings: 1150, gmvRupees: 1495000, slaRate: "96.4%", avgRating: 4.82, activePros: 340 },
    { city: "Delhi NCR", bookings: 890, gmvRupees: 1112000, slaRate: "95.9%", avgRating: 4.79, activePros: 280 },
    { city: "Krishnagiri Hub", bookings: 380, gmvRupees: 372000, slaRate: "97.5%", avgRating: 4.85, activePros: 120 }
  ],

  // 8. Customer Retention & Repeat Usage
  customerMetrics: {
    totalActiveCustomers: 2680,
    repeatBookingRate: '42.8%', // 42.8% of customers booked >= 2 times in 90 days
    repeatCustomersCount: 1147,
    ucPlusSubscriberCount: 480,
    avgCustomerLifetimeValueRupees: 4280
  },

  // 9. Support Resolution SLA Times
  supportPerformance: {
    totalTickets: 128,
    firstResponseAvgMins: 14.5,
    resolutionTimeAvgHours: 2.8,
    firstContactResolutionRate: '86.4%',
    slaBreachRate: '2.8%',
    customerSatisfactionScore: '4.7 / 5.0'
  }
};

export async function getReports(req, res) {
  try {
    const { period = '30d' } = req.query;
    return res.json({
      success: true,
      period,
      reports: mockReportsData
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Export CSV Endpoint protected against spreadsheet formula injection
export async function exportReportCsv(req, res) {
  try {
    const { reportType = 'financials' } = req.query;

    let headers = [];
    let rows = [];
    let filename = `urban_report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === 'pro-performance') {
      headers = ['Professional Name', 'Trade Skill', 'Jobs Completed', 'Customer Rating', 'SLA Compliance', 'Repeat Requests', 'Avg Duration (Mins)'];
      rows = mockReportsData.professionalPerformance.map(p => [
        sanitizeCsvCell(p.proName),
        sanitizeCsvCell(p.trade),
        sanitizeCsvCell(p.jobsCompleted),
        sanitizeCsvCell(p.rating),
        sanitizeCsvCell(p.slaCompliance),
        sanitizeCsvCell(p.repeatCustomerRequests),
        sanitizeCsvCell(p.avgDurationMins)
      ]);
    } else if (reportType === 'partner-performance') {
      headers = ['Partner Agency', 'Active Fleet Size', 'Completed Jobs', 'GMV Generated', 'Commission Paid', 'SLA Fulfillment', 'Complaints Count'];
      rows = mockReportsData.partnerPerformance.map(p => [
        sanitizeCsvCell(p.partnerName),
        sanitizeCsvCell(p.activeFleet),
        sanitizeCsvCell(p.completedJobs),
        sanitizeCsvCell(p.gmvGenerated),
        sanitizeCsvCell(p.commissionPaid),
        sanitizeCsvCell(p.slaFulfillment),
        sanitizeCsvCell(p.complaintsCount)
      ]);
    } else if (reportType === 'category-city') {
      headers = ['Segment Type', 'Dimension', 'Orders Count', 'GMV / Revenue (INR)', 'Performance Metric'];
      mockReportsData.categoryPerformance.forEach(c => {
        rows.push(['Category', sanitizeCsvCell(c.category), sanitizeCsvCell(c.orders), sanitizeCsvCell(c.revenueRupees), sanitizeCsvCell(`${c.sharePercentage}% share`)]);
      });
      mockReportsData.cityPerformance.forEach(c => {
        rows.push(['City Zone', sanitizeCsvCell(c.city), sanitizeCsvCell(c.bookings), sanitizeCsvCell(c.gmvRupees), sanitizeCsvCell(`SLA ${c.slaRate}, Rating ${c.avgRating}`)]);
      });
    } else {
      // General financial summary
      headers = ['Financial & Operational Metric', 'Value', 'Calculation Basis / Accounting Standard'];
      rows = [
        ['Gross Merchandise Value (GMV)', sanitizeCsvCell(`₹${mockReportsData.financials.gmvTotalRupees}`), 'Total customer captured invoice payments'],
        ['Net Platform Revenue', sanitizeCsvCell(`₹${mockReportsData.financials.netPlatformRevenueRupees}`), 'Contractual platform take rate (avg 20%)'],
        ['Pro & Partner Payout Disbursements', sanitizeCsvCell(`₹${mockReportsData.financials.proPartnerSettlementsRupees}`), 'Technician & partner agency net earnings'],
        ['Section 194-O TDS Withheld', sanitizeCsvCell(`₹${mockReportsData.financials.tdsWithheldRupees}`), '1% statutory TDS deducted on gross collections'],
        ['Total Completed Bookings', sanitizeCsvCell(mockReportsData.bookings.completedBookings), 'Successful jobs verified via customer OTP'],
        ['Customer Repeat Booking Rate', sanitizeCsvCell(mockReportsData.customerMetrics.repeatBookingRate), 'Customers with >= 2 completed orders in 90 days'],
        ['Support SLA Breach Rate', sanitizeCsvCell(mockReportsData.supportPerformance.slaBreachRate), 'Tickets exceeding 2-hour first response window']
      ];
    }

    // Build CSV string with injection protection
    const csvLines = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvLines.join('\n'));
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
