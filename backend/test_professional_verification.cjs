/**
 * Professional / Worker Dashboard Backend Verification Suite
 * Tests authentication, permissions, cross-worker data isolation, OTP verification,
 * lifecycle state machines, earnings calculation, and withdrawal validations.
 */

const http = require('http');

function apiRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/professional' + path,
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data), raw: data });
        } catch {
          resolve({ statusCode: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(postData);
    req.end();
  });
}

async function runProfessionalTests() {
  console.log('===============================================================');
  console.log('  URBAN PRO: PROFESSIONAL DASHBOARD VERIFICATION TEST SUITE    ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  // Clean demo state before running tests
  await apiRequest('POST', '/demo/reset', { confirmReset: true });

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. AUTHENTICATION & LOGIN
    console.log('[TEST GROUP 1] Professional Authentication & Profile Resolution');
    const loginRes = await apiRequest('POST', '/login', {
      email: 'vikram.salvi@urbanpro.com',
      password: 'demo'
    });
    assert(loginRes.statusCode === 200, 'Login endpoint returns HTTP 200');
    assert(loginRes.body.success === true, 'Login response success is true');
    assert(loginRes.body.token !== undefined, 'JWT bearer token generated');
    assert(loginRes.body.professional.id === 'PRO-8841', 'Resolved to Vikram Salvi (PRO-8841)');
    const token = loginRes.body.token;

    // 2. PROFILE RETRIEVAL WITH AUTH
    const profileRes = await apiRequest('GET', '/profile', null, {
      Authorization: `Bearer ${token}`
    });
    assert(profileRes.statusCode === 200, 'Authenticated profile retrieval returns HTTP 200');
    assert(profileRes.body.profile.applicantName === 'Vikram Salvi', 'Profile name matches Vikram Salvi');
    assert(profileRes.body.profile.tier.includes('Diamond Pro'), 'Tier level is Diamond Pro Partner');

    // 3. CROSS-ACCOUNT / CROSS-WORKER DATA ISOLATION
    console.log('\n[TEST GROUP 2] Strict Cross-Worker Authorization & Privacy Enforcement');
    // Worker A (PRO-8841) reads assigned job JOB-9410
    const jobA = await apiRequest('GET', '/jobs/JOB-9410', null, {
      'x-professional-id': 'PRO-8841'
    });
    assert(jobA.statusCode === 200, 'Authorized worker PRO-8841 successfully reads their own assigned job');
    assert(jobA.body.job.id === 'JOB-9410', 'Job ID matches JOB-9410');

    // Worker B (PRO-8842 Rajesh Kumar) attempts to read JOB-9410 (Assigned to Vikram Salvi)
    const jobB = await apiRequest('GET', '/jobs/JOB-9410', null, {
      'x-professional-id': 'PRO-8842'
    });
    assert(jobB.statusCode === 403, 'Cross-worker read attempt strictly blocked with HTTP 403 Forbidden');
    assert(jobB.body.error.includes('Access Forbidden'), 'Returns descriptive error message: Access Forbidden');

    // Worker B attempts to transition status of Worker A\'s job
    const mutateB = await apiRequest('PUT', '/jobs/JOB-9410/status', { status: 'En Route' }, {
      'x-professional-id': 'PRO-8842'
    });
    assert(mutateB.statusCode === 403, 'Cross-worker status tampering strictly blocked with HTTP 403 Forbidden');

    // 4. AGENCY EMPLOYEE vs FREELANCE PARTNER ROLES
    console.log('\n[TEST GROUP 3] Agency Employed Professional Identity');
    const agencyPro = await apiRequest('GET', '/profile', null, {
      'x-professional-id': 'PRO-8843'
    });
    assert(agencyPro.statusCode === 200, 'Agency-employed worker PRO-8843 profile retrieved');
    assert(agencyPro.body.profile.employmentType === 'Agency Employed', 'Employment type identified as Agency Employed');
    assert(agencyPro.body.profile.partnerAgencyId === 'PTR-90142', 'Linked to Business Partner PTR-90142');

    // 5. JOB START OTP VERIFICATION
    console.log('\n[TEST GROUP 4] Customer Start OTP & Lifecycle Gatekeeper');
    // Invalid OTP
    const invalidOtpRes = await apiRequest('POST', '/jobs/JOB-9411/verify-otp', { otp: '0000' }, {
      'x-professional-id': 'PRO-8841'
    });
    assert(invalidOtpRes.statusCode === 400, 'Invalid OTP (0000) rejected with HTTP 400');

    // Valid OTP
    const validOtpRes = await apiRequest('POST', '/jobs/JOB-9411/verify-otp', { otp: '4829' }, {
      'x-professional-id': 'PRO-8841'
    });
    assert(validOtpRes.statusCode === 200, 'Valid customer OTP (4829) verified successfully with HTTP 200');

    // Follow valid lifecycle sequence: Assigned -> En Route -> Arrived
    await apiRequest('PUT', '/jobs/JOB-9411/status', { status: 'En Route' }, { 'x-professional-id': 'PRO-8841' });
    await apiRequest('PUT', '/jobs/JOB-9411/status', { status: 'Arrived' }, { 'x-professional-id': 'PRO-8841' });

    // Moving to In Progress without OTP is rejected
    const noOtpProgress = await apiRequest('PUT', '/jobs/JOB-9411/status', { status: 'In Progress' }, {
      'x-professional-id': 'PRO-8841'
    });
    assert(noOtpProgress.statusCode === 400, 'Transition to "In Progress" requires customer OTP');

    // Moving to In Progress with correct OTP succeeds
    const otpProgress = await apiRequest('PUT', '/jobs/JOB-9411/status', { status: 'In Progress', otp: '4829' }, {
      'x-professional-id': 'PRO-8841'
    });
    assert(otpProgress.statusCode === 200, 'Transition to "In Progress" with OTP succeeds');

    // 6. AVAILABILITY & SHIFT CONTROLS
    console.log('\n[TEST GROUP 5] Duty Shift & Availability Scheduling');
    const availUpdate = await apiRequest('PUT', '/availability', {
      isOnline: false,
      workingHours: { start: '09:00', end: '19:00' },
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    }, {
      'x-professional-id': 'PRO-8841'
    });
    assert(availUpdate.statusCode === 200, 'Availability updated successfully');
    assert(availUpdate.body.availability.isOnline === false, 'Shift state paused (isOnline = false)');

    // Resume Online
    await apiRequest('PUT', '/availability', { isOnline: true }, {
      'x-professional-id': 'PRO-8841'
    });

    // 7. EARNINGS & TAKE-RATE CALCULATIONS
    console.log('\n[TEST GROUP 6] Earnings & Financial Calculations');
    const earningsRes = await apiRequest('GET', '/earnings', null, {
      'x-professional-id': 'PRO-8841'
    });
    assert(earningsRes.statusCode === 200, 'Earnings retrieved with HTTP 200');
    assert(earningsRes.body.earnings.lifetime > 0, 'Lifetime earnings calculated');
    assert(earningsRes.body.earnings.breakdown.platformCommission === Math.round(earningsRes.body.earnings.breakdown.grossFare * 0.2), 'Platform take-rate is exactly 20%');

    // 8. PAYOUTS & WITHDRAWAL LIMITS
    console.log('\n[TEST GROUP 7] Payouts & Wallet Withdrawal Limits');
    // Below minimum limit (e.g. ₹200 < ₹500)
    const lowWithdraw = await apiRequest('POST', '/payouts/withdraw', { amount: 200 }, {
      'x-professional-id': 'PRO-8841'
    });
    assert(lowWithdraw.statusCode === 400, 'Withdrawal below ₹500 minimum rejected with HTTP 400');

    // Exceeding balance
    const highWithdraw = await apiRequest('POST', '/payouts/withdraw', { amount: 9999999 }, {
      'x-professional-id': 'PRO-8841'
    });
    assert(highWithdraw.statusCode === 400, 'Withdrawal exceeding wallet balance rejected with HTTP 400');

    // Valid withdrawal
    const validWithdraw = await apiRequest('POST', '/payouts/withdraw', { amount: 1000, upiId: 'vikramsalvi@okaxis' }, {
      'x-professional-id': 'PRO-8841'
    });
    assert(validWithdraw.statusCode === 200, 'Valid withdrawal of ₹1,000 processed with HTTP 200');
    assert(validWithdraw.body.utr !== undefined, 'UTR banking reference generated');

    // 9. TRAINING & ACADEMY
    console.log('\n[TEST GROUP 8] Academy & Skill Certifications');
    const trainRes = await apiRequest('POST', '/trainings/TRN-103/assessment', {
      answers: { q1: 1, q2: 1, q3: 1, q4: 3 }
    }, {
      'x-professional-id': 'PRO-8841'
    });
    assert(trainRes.statusCode === 200, 'Training module completion recorded');

    // 10. INVENTORY RESTOCK
    console.log('\n[TEST GROUP 9] Technician Toolkit & Consumables');
    const restockRes = await apiRequest('POST', '/inventory/restock', {
      itemId: 'R32 Refrigerant Gas Cylinder (7kg)',
      quantity: 1,
      hub: 'Bandra West Central Hub'
    }, {
      'x-professional-id': 'PRO-8841'
    });
    assert(restockRes.statusCode === 200, 'Restock request submitted to operational hub');

    // 11. SUPPORT & NOTIFICATIONS
    console.log('\n[TEST GROUP 10] Support Helpdesk & Notifications');
    const ticketRes = await apiRequest('POST', '/support', {
      subject: 'Verification Test Ticket',
      category: 'earnings_payout',
      description: 'Automated test suite check'
    }, {
      'x-professional-id': 'PRO-8841'
    });
    assert(ticketRes.statusCode === 201, 'Support ticket created with HTTP 201');

    const markReadRes = await apiRequest('POST', '/notifications/read-all', null, {
      'x-professional-id': 'PRO-8841'
    });
    assert(markReadRes.statusCode === 200, 'Notifications marked as read');

    // 12. COMPLIANCE & DOCUMENTS
    console.log('\n[TEST GROUP 11] Documents & ID Verification Vault');
    const docRes = await apiRequest('GET', '/documents', null, {
      'x-professional-id': 'PRO-8841'
    });
    assert(docRes.statusCode === 200, 'Compliance documents retrieved');
    assert(docRes.body.documents.aadhaar !== undefined, 'Aadhaar verification record present');

  } catch (err) {
    console.error('Fatal Test Exception:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runProfessionalTests();
