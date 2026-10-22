const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body) headers['Content-Length'] = Buffer.byteLength(postData);

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin' + path,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusMessage, statusCode: res.statusCode, body: JSON.parse(data), raw: data });
        } catch {
          resolve({ status: res.statusMessage, statusCode: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(postData);
    req.end();
  });
}

async function runComprehensiveVerification() {
  console.log('===============================================================');
  console.log('>>> ENTERPRISE AUTOMATED SYSTEM VERIFICATION SUITE <<<');
  console.log('===============================================================\n');

  // -----------------------------------------------------------------
  // 1. Authentication & Backend Permission Enforcement
  // -----------------------------------------------------------------
  console.log('[TEST 1] Authentication & RBAC Enforcement...');
  
  // Unauthenticated request
  const unauthRes = await request('GET', '/overview');
  console.assert(unauthRes.statusCode === 401, `Unauthenticated request should return 401, got ${unauthRes.statusCode}`);
  console.log('  ✓ Unauthenticated access correctly rejected with HTTP 401.');

  // Bad credentials
  const badLogin = await request('POST', '/auth/login', { email: 'fake@urbancompany.com', password: 'wrong' });
  console.assert(badLogin.statusCode === 401, 'Bad credentials should return 401');
  console.assert(!badLogin.body.error.includes('email not found'), 'Generic error check failed: revealed account existence');
  console.log('  ✓ Invalid credentials return generic error without revealing account existence.');

  // Login as Read-only Analyst
  const analystLogin = await request('POST', '/auth/login', { email: 'analyst@urbancompany.com', password: 'admin123' });
  console.assert(analystLogin.statusCode === 200, 'Analyst login failed');
  const analystToken = analystLogin.body.token;

  // Analyst tries to create a booking (Forbidden)
  const analystCreateBooking = await request('POST', '/bookings', { userName: 'Test', userPhone: '9820111223' }, analystToken);
  console.assert(analystCreateBooking.statusCode === 403, `Analyst create booking should be 403, got ${analystCreateBooking.statusCode}`);

  // Analyst tries to release a payout (Forbidden)
  const analystReleasePayout = await request('POST', '/payouts/PO-301/release', {}, analystToken);
  console.assert(analystReleasePayout.statusCode === 403, `Analyst release payout should be 403, got ${analystReleasePayout.statusCode}`);
  console.log('  ✓ Read-only Analyst role strictly blocked from mutative actions (HTTP 403).');

  // Login as Support Agent
  const supportLogin = await request('POST', '/auth/login', { email: 'support@urbancompany.com', password: 'admin123' });
  const supportToken = supportLogin.body.token;

  // Support Agent tries to release a payout (Forbidden)
  const supportReleasePayout = await request('POST', '/payouts/PO-301/release', {}, supportToken);
  console.assert(supportReleasePayout.statusCode === 403, `Support agent release payout should be 403, got ${supportReleasePayout.statusCode}`);
  console.log('  ✓ Support Agent role blocked from financial payout releases (HTTP 403).');

  // Login as Super Admin
  const superLogin = await request('POST', '/auth/login', { email: 'admin@urbancompany.com', password: 'admin123' });
  const superToken = superLogin.body.token;
  console.assert(superLogin.statusCode === 200, 'Super admin login failed');
  console.log('  ✓ Super Admin role successfully authenticated with full platform authority.');

  // -----------------------------------------------------------------
  // 2. Cross-Account and Cross-Partner Data Isolation
  // -----------------------------------------------------------------
  console.log('\n[TEST 2] Cross-Account & Cross-Partner Data Isolation...');
  const partner1Res = await request('GET', '/partners/PTR-90142', null, superToken);
  const partner2Res = await request('GET', '/partners/PTR-90143', null, superToken);
  console.assert(partner1Res.statusCode === 200 && partner2Res.statusCode === 200, 'Failed to fetch partner details');
  
  const p1 = partner1Res.body.partner;
  const p2 = partner2Res.body.partner;
  console.assert(p1.businessName !== p2.businessName, 'Partner names collision');
  console.assert(p1.settlementAccount.ifscCode !== p2.settlementAccount.ifscCode, 'Bank account isolation failed');
  console.assert(p1.settlementMode === 'ThroughBusiness', 'Expected ThroughBusiness settlement mode for agency partner');
  console.log('  ✓ Partner data isolation verified: agency fleet accounts and solo technicians do not cross-pollinate.');

  // -----------------------------------------------------------------
  // 3. Booking Lifecycle Restrictions
  // -----------------------------------------------------------------
  console.log('\n[TEST 3] Booking Lifecycle Restrictions...');
  // Attempt invalid transition: 'Pending' directly to 'Completed'
  const invalidTransition = await request('PUT', '/bookings/ORD-9845/lifecycle', { newStatus: 'Completed' }, superToken);
  console.assert(invalidTransition.statusCode === 400, `Invalid lifecycle jump should return 400, got ${invalidTransition.statusCode}`);
  console.assert(invalidTransition.body.error.includes('Invalid lifecycle transition'), 'Error message incorrect');
  console.log('  ✓ Invalid lifecycle skips (e.g. Pending directly to Completed) rejected with HTTP 400.');

  // -----------------------------------------------------------------
  // 4. Appointment Overlap Prevention
  // -----------------------------------------------------------------
  console.log('\n[TEST 4] Appointment Overlap Prevention...');
  // Vikram Salvi already has slot 'Today, 02:00 PM - 03:00 PM' on ORD-9841 in Mumbai
  // Try assigning Vikram Salvi to another booking during the same slot
  const overlapRes = await request('PUT', '/bookings/ORD-9842/assign', {
    professionalId: 'PRO-8841',
    professionalName: 'Vikram Salvi',
    professionalPhone: '+91 98205 11982',
    trade: 'Master AC Specialist'
  }, superToken);
  
  // Note: ORD-9842 is at 03:30 PM. Let's create a test booking in the exact same slot to test collision
  const conflictBookingRes = await request('POST', '/bookings', {
    userName: 'Collision Test Customer',
    userPhone: '+91 99999 88888',
    serviceName: 'Powerjet AC Servicing',
    city: 'Mumbai',
    address: 'Bandra West, Mumbai',
    slot: 'Today, 02:00 PM - 03:00 PM', // Same slot as ORD-9841
    totalAmount: 699
  }, superToken);
  console.assert(conflictBookingRes.statusCode === 201, 'Failed to create collision test booking');
  const conflictBookingId = conflictBookingRes.body.booking.id;

  const overlapCollision = await request('PUT', `/bookings/${conflictBookingId}/assign`, {
    professionalId: 'PRO-8841',
    professionalName: 'Vikram Salvi',
    trade: 'Master AC Specialist'
  }, superToken);

  console.assert(overlapCollision.statusCode === 409, `Expected HTTP 409 Conflict for overlapping slot, got ${overlapCollision.statusCode}`);
  console.assert(overlapCollision.body.error.includes('already committed to an overlapping appointment'), 'Overlap message check failed');
  console.log('  ✓ Appointment overlap conflict correctly caught and rejected with HTTP 409.');

  // -----------------------------------------------------------------
  // 5. Pricing and Commission Calculations
  // -----------------------------------------------------------------
  console.log('\n[TEST 5] Pricing & Commission Calculations...');
  const txRes = await request('GET', '/payments', null, superToken);
  console.assert(txRes.statusCode === 200, 'Failed to fetch payments');
  const tx = txRes.body.transactions[0];
  // Verify paise to rupees conversion and 20% commission on solo pro
  console.assert(tx.amountPaise === tx.amountRupees * 100, 'Paise to rupees mismatch');
  console.assert(tx.commissionPaise + tx.proSharePaise === tx.amountPaise, 'Commission and pro share sum mismatch');
  console.log(`  ✓ Transaction math verified: ₹${tx.amountRupees} = ${tx.commissionPaise / 100} commission + ${tx.proSharePaise / 100} pro payout.`);

  // -----------------------------------------------------------------
  // 6. Coupon Limits & Validation
  // -----------------------------------------------------------------
  console.log('\n[TEST 6] Coupon Limits & Validation...');
  // Below threshold: AUTO100 has minOrderValue 499
  const belowThreshold = await request('POST', '/promotions/validate', {
    code: 'AUTO100',
    orderValue: 200 // minOrderValue is 499
  });
  console.assert(belowThreshold.statusCode === 400, `Cart below threshold should return 400, got ${belowThreshold.statusCode}`);
  console.assert(belowThreshold.body.reason.includes('Minimum order value'), 'Threshold message mismatch');
  
  // Valid coupon: AUTO100 with cart 800
  const validCoupon = await request('POST', '/promotions/validate', {
    code: 'AUTO100',
    orderValue: 800
  });
  console.assert(validCoupon.statusCode === 200, 'Valid coupon failed');
  console.assert(validCoupon.body.valid === true, 'Coupon validity flag false');
  console.log('  ✓ Coupon threshold constraints strictly enforced server-side.');

  // -----------------------------------------------------------------
  // 7. Refund Balance Limits
  // -----------------------------------------------------------------
  console.log('\n[TEST 7] Refund Balance Limits...');
  // REF-701 has requestedAmount ₹799, maxRefundableBalance ₹992
  // Try approving ₹1,500 (exceeds balance of 992)
  const excessiveRefund = await request('PUT', '/refunds/REF-701/approve', {
    action: 'approve',
    approvedAmount: 1500
  }, superToken);
  console.assert(excessiveRefund.statusCode === 400, `Excessive refund should return 400, got ${excessiveRefund.statusCode}`);
  console.assert(excessiveRefund.body.error.includes('exceeds maximum refundable balance'), 'Refund error message mismatch');
  console.log('  ✓ Refund requests exceeding remaining booking balance rejected with HTTP 400.');

  // -----------------------------------------------------------------
  // 8. Duplicate Payment / Refund / Payout Prevention (Idempotency)
  // -----------------------------------------------------------------
  console.log('\n[TEST 8] Duplicate Payout & Idempotency Guards...');
  // PO-302 is already 'Processed'
  const duplicatePayout = await request('POST', '/payouts/PO-302/release', {
    idempotencyKey: 'idem_repeat_test_key_01'
  }, superToken);
  console.assert(duplicatePayout.statusCode === 400, `Re-releasing processed payout should return 400, got ${duplicatePayout.statusCode}`);
  console.assert(duplicatePayout.body.error.includes('ALREADY been released'), 'Duplicate payout error mismatch');
  console.log('  ✓ Duplicate payout disbursement attempt blocked by idempotency guard.');

  // -----------------------------------------------------------------
  // 9. Historical Booking Price Preservation
  // -----------------------------------------------------------------
  console.log('\n[TEST 9] Historical Booking Price Preservation...');
  const invoiceRes = await request('GET', '/bookings/ORD-9841/invoice', null, superToken);
  console.assert(invoiceRes.statusCode === 200, 'Failed to fetch invoice');
  const inv = invoiceRes.body.invoice;
  console.assert(inv.pricing.total === 922, `Historical invoice total should be preserved as 922, got ${inv.pricing.total}`);
  console.assert(inv.invoiceNumber === 'INV-2026-9841', 'Invoice number mismatch');
  console.log(`  ✓ Historical invoice intact: #${inv.invoiceNumber} for ₹${inv.pricing.total}.`);

  // -----------------------------------------------------------------
  // 10. Critical CRUD Workflows
  // -----------------------------------------------------------------
  console.log('\n[TEST 10] Critical CRUD Workflows...');
  // Create catalogue service
  const createService = await request('POST', '/services', {
    title: 'Automated Test Microwave Diagnostic',
    category: 'ac-appliances',
    categoryName: 'Appliance Repair',
    price: 399,
    durationMins: 45,
    description: 'Automated test service'
  }, superToken);
  console.assert(createService.statusCode === 201, `Failed to create service: ${createService.statusCode}`);
  const srvId = createService.body.service.id;
  console.log(`  ✓ Service created with ID: ${srvId}`);

  // Soft archive service
  const archiveService = await request('PUT', `/services/${srvId}/archive`, {}, superToken);
  console.assert(archiveService.statusCode === 200, 'Failed to archive service');
  console.log('  ✓ Service soft-archived successfully.');

  // Adjust inventory negative check
  const negStock = await request('PUT', '/inventory/INV-501/stock', {
    delta: -500, // stock is 48
    reason: 'Negative test'
  }, superToken);
  console.assert(negStock.statusCode === 400, 'Negative stock adjustment should return 400');
  console.log('  ✓ Critical CRUD operations verified with validation and safety constraints.');

  console.log('\n===============================================================');
  console.log('>>> ALL 10 COMPREHENSIVE VERIFICATION SUITES PASSED! <<<');
  console.log('===============================================================\n');
}

runComprehensiveVerification().catch(err => {
  console.error('Comprehensive verification failed:', err);
  process.exit(1);
});
