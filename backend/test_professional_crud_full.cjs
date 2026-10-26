/**
 * Comprehensive Professional Worker Dashboard CRUD Verification Suite
 * Tests CREATE, READ, UPDATE, DELETE (revocation/closure) operations
 * across all active modules in the Professional Worker portal.
 */

const http = require('http');

function apiRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      'x-professional-id': 'PRO-8841',
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

async function testFullCrud() {
  console.log('===================================================================');
  console.log('  URBAN PRO: PROFESSIONAL WORKER FULL CRUD VERIFICATION SUITE       ');
  console.log('===================================================================\n');

  let passed = 0;
  let failed = 0;

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
    // -------------------------------------------------------------
    // MODULE 1: TODAY DASHBOARD & DISPATCHES (READ)
    // -------------------------------------------------------------
    console.log('[MODULE 1] Today Operations & Dispatch Feeds (READ)');
    const todayRes = await apiRequest('GET', '/today');
    assert(todayRes.statusCode === 200, 'GET /today returns HTTP 200');
    assert(todayRes.body.success === true, 'GET /today success is true');
    assert(Array.isArray(todayRes.body.todayAppointments), 'todayAppointments is an array');
    assert(todayRes.body.earningsSummary !== undefined, 'earningsSummary is present');

    // -------------------------------------------------------------
    // MODULE 2: DUTY SHIFT & AVAILABILITY (READ & UPDATE)
    // -------------------------------------------------------------
    console.log('\n[MODULE 2] Duty Availability & Shift Hours (READ & UPDATE)');
    const getAvail = await apiRequest('GET', '/availability');
    assert(getAvail.statusCode === 200, 'GET /availability returns HTTP 200');
    assert(getAvail.body.success === true, 'GET /availability success is true');

    // Update duty offline
    const putAvailOffline = await apiRequest('PUT', '/availability', {
      isOnline: false,
      workingHours: { start: '08:00', end: '20:00' },
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    });
    assert(putAvailOffline.statusCode === 200, 'PUT /availability (pause duty) returns HTTP 200');
    assert(putAvailOffline.body.availability.isOnline === false, 'Availability isOnline updated to false');

    // Update duty online
    const putAvailOnline = await apiRequest('PUT', '/availability', {
      isOnline: true
    });
    assert(putAvailOnline.statusCode === 200, 'PUT /availability (resume duty) returns HTTP 200');
    assert(putAvailOnline.body.availability.isOnline === true, 'Availability isOnline updated to true');

    // -------------------------------------------------------------
    // MODULE 3: PROFILE & CREDENTIALS (READ & UPDATE)
    // -------------------------------------------------------------
    console.log('\n[MODULE 3] Worker Profile & Contact Details (READ & UPDATE)');
    const getProf = await apiRequest('GET', '/profile');
    assert(getProf.statusCode === 200, 'GET /profile returns HTTP 200');
    assert(getProf.body.profile.id === 'PRO-8841', 'Worker ID is PRO-8841');

    const updateProf = await apiRequest('PUT', '/profile', {
      phone: '+91 98205 11982',
      emergencyContact: {
        name: 'Sunita Salvi',
        phone: '+91 98205 99881',
        relation: 'Spouse'
      },
      bio: 'Certified Master Technician with 8+ years HVAC and home electrical experience.'
    });
    assert(updateProf.statusCode === 200, 'PUT /profile returns HTTP 200');
    assert(updateProf.body.success === true, 'Profile updated successfully');

    // -------------------------------------------------------------
    // MODULE 4: JOBS LIFECYCLE & WORK NOTES (CREATE, READ, UPDATE)
    // -------------------------------------------------------------
    console.log('\n[MODULE 4] Jobs Lifecycle, Notes & Extra Work (CREATE, READ, UPDATE)');
    const jobsList = await apiRequest('GET', '/jobs');
    assert(jobsList.statusCode === 200, 'GET /jobs returns HTTP 200');
    assert(Array.isArray(jobsList.body.jobs), 'Jobs list returned as array');

    const singleJob = await apiRequest('GET', '/jobs/JOB-9410');
    assert(singleJob.statusCode === 200, 'GET /jobs/JOB-9410 returns HTTP 200');
    assert(singleJob.body.job.customer !== undefined, 'Customer details present on job');

    // CREATE: Professional Note on Job
    const createNote = await apiRequest('POST', '/jobs/JOB-9410/notes', {
      note: 'Verified outdoor compressor clearance and electrical earthing before servicing.'
    });
    assert(createNote.statusCode === 200, 'POST /jobs/JOB-9410/notes creates technician note');
    assert(createNote.body.success === true, 'Note successfully saved to job');

    // CREATE: Extra Work / Spares Proposal
    const createExtra = await apiRequest('POST', '/jobs/JOB-9410/extra-work', {
      item: 'R32 High-Pressure Flare Nut Replacement',
      amount: 320,
      reason: 'Worn brass flare nut detected during indoor unit connection inspection.'
    });
    assert(createExtra.statusCode === 200, 'POST /jobs/JOB-9410/extra-work creates extra work request');
    assert(createExtra.body.success === true, 'Extra work proposal created');

    // UPDATE: Service Checklist Item
    const updateChecklist = await apiRequest('PUT', '/jobs/JOB-9410/checklist', {
      itemId: 'chk-1',
      completed: true
    });
    assert(updateChecklist.statusCode === 200, 'PUT /jobs/JOB-9410/checklist updates checklist');
    assert(updateChecklist.body.completed === true, 'Checklist item marked as completed');

    // UPDATE: Job Status Lifecycle with OTP
    const statusEnRoute = await apiRequest('PUT', '/jobs/JOB-9410/status', { status: 'En Route' });
    assert(statusEnRoute.statusCode === 200, 'PUT /jobs/JOB-9410/status advances to En Route');

    const statusArrived = await apiRequest('PUT', '/jobs/JOB-9410/status', { status: 'Arrived' });
    assert(statusArrived.statusCode === 200, 'PUT /jobs/JOB-9410/status advances to Arrived');

    const statusProgress = await apiRequest('PUT', '/jobs/JOB-9410/status', { status: 'In Progress', otp: '4829' });
    assert(statusProgress.statusCode === 200, 'PUT /jobs/JOB-9410/status with customer OTP advances to In Progress');

    // -------------------------------------------------------------
    // MODULE 5: EARNINGS & PAYOUTS (CREATE & READ)
    // -------------------------------------------------------------
    console.log('\n[MODULE 5] Earnings, Payouts & Wallet Withdrawals (CREATE & READ)');
    const earningsRes = await apiRequest('GET', '/earnings');
    assert(earningsRes.statusCode === 200, 'GET /earnings returns HTTP 200');
    assert(earningsRes.body.earnings.breakdown !== undefined, 'Earnings breakdown returned');

    const payoutsRes = await apiRequest('GET', '/payouts');
    assert(payoutsRes.statusCode === 200, 'GET /payouts returns HTTP 200');
    assert(Array.isArray(payoutsRes.body.payoutStatements), 'payoutStatements is an array');

    // CREATE: Instant Withdrawal
    const withdrawRes = await apiRequest('POST', '/payouts/withdraw', {
      amount: 500,
      upiId: 'vikram.salvi@okhdfcbank'
    });
    assert(withdrawRes.statusCode === 200, 'POST /payouts/withdraw processes wallet withdrawal');
    assert(withdrawRes.body.utr !== undefined, 'Bank UTR reference generated for withdrawal');

    // CREATE: Bank Account Change Request
    const bankReq = await apiRequest('POST', '/payouts/bank-change-request', {
      accountHolderName: 'Vikram Salvi',
      accountNumber: '50100492817291',
      confirmAccountNumber: '50100492817291',
      ifscCode: 'HDFC0001248',
      bankName: 'HDFC Bank Ltd'
    });
    assert(bankReq.statusCode === 200 || bankReq.statusCode === 201, 'POST /payouts/bank-change-request submits bank change request (HTTP 201)');

    // CREATE: Financial Dispute
    const disputeRes = await apiRequest('POST', '/payouts/disputes', {
      category: 'incorrect_incentive',
      sourceRef: 'TXN-9401',
      disputedAmount: 75,
      reason: 'Incentive calculation audit request for peak monsoon slot'
    });
    assert(disputeRes.statusCode === 200 || disputeRes.statusCode === 201, 'POST /payouts/disputes creates dispute ticket (HTTP 201)');

    // -------------------------------------------------------------
    // MODULE 6: KYC DOCUMENTS VAULT (CREATE & READ)
    // -------------------------------------------------------------
    console.log('\n[MODULE 6] KYC & Compliance Documents (CREATE & READ)');
    const docsRes = await apiRequest('GET', '/documents');
    assert(docsRes.statusCode === 200, 'GET /documents returns compliance documents');
    assert(docsRes.body.documents !== undefined, 'Documents vault object retrieved');

    // CREATE / UPLOAD: KYC Document
    const uploadDoc = await apiRequest('POST', '/documents/upload', {
      docType: 'policeVerification',
      docNumber: 'POL-MUM-2026-94812',
      mimeType: 'application/pdf',
      fileSizeKb: 120
    });
    assert(uploadDoc.statusCode === 201, 'POST /documents/upload records KYC document upload (HTTP 201)');

    // -------------------------------------------------------------
    // MODULE 7: SUPPORT & SAFETY TICKETS (CREATE & READ)
    // -------------------------------------------------------------
    console.log('\n[MODULE 7] Support Desk & Safety Escalations (CREATE & READ)');
    const ticketsRes = await apiRequest('GET', '/support');
    assert(ticketsRes.statusCode === 200, 'GET /support returns support tickets list');

    // CREATE: Support Ticket
    const newTicket = await apiRequest('POST', '/support', {
      subject: 'Equipment calibration verification at Bandra Hub',
      category: 'technical_issue',
      description: 'Scheduled true-RMS multimeter calibration for electrical safety compliance.'
    });
    assert(newTicket.statusCode === 201, 'POST /support creates new support ticket (HTTP 201)');
    const ticketId = newTicket.body.ticket?.id;

    // CREATE: Message / Reply on Support Ticket
    const ticketMsg = await apiRequest('POST', `/support/${ticketId}/messages`, {
      message: 'Attached test certificate from Mumbai West calibration lab.'
    });
    assert(ticketMsg.statusCode === 200, 'POST /support/:id/messages adds reply to ticket');

    // -------------------------------------------------------------
    // MODULE 8: NOTIFICATIONS & BROADCASTS (READ & UPDATE)
    // -------------------------------------------------------------
    console.log('\n[MODULE 8] Dispatch Broadcasts & Alerts (READ & UPDATE)');
    const notifs = await apiRequest('GET', '/notifications');
    assert(notifs.statusCode === 200, 'GET /notifications returns broadcast feed');

    const markRead = await apiRequest('POST', '/notifications/read-all');
    assert(markRead.statusCode === 200, 'POST /notifications/read-all updates read status');

    // -------------------------------------------------------------
    // MODULE 9: APP SETTINGS (READ, UPDATE, REVOKE)
    // -------------------------------------------------------------
    console.log('\n[MODULE 9] Application Settings & Device Security (READ, UPDATE, REVOKE)');
    const settingsRes = await apiRequest('GET', '/settings');
    assert(settingsRes.statusCode === 200, 'GET /settings returns user configuration');

    const updateSettings = await apiRequest('PUT', '/settings', {
      language: 'en',
      darkTheme: false,
      notifications: { push: true, sms: true, highDemandAlerts: true }
    });
    assert(updateSettings.statusCode === 200, 'PUT /settings updates user preferences');

    // DELETE / REVOKE: Revoke Other Active Sessions
    const revokeRes = await apiRequest('POST', '/settings/sessions/revoke-others');
    assert(revokeRes.statusCode === 200, 'POST /settings/sessions/revoke-others terminates stale sessions');
    assert(revokeRes.body.success === true, 'Other sessions successfully revoked');

    // -------------------------------------------------------------
    // MODULE 10: IMMUTABLE AUDIT TRAIL PROTECTION (DELETE/MUTATION REJECTION)
    // -------------------------------------------------------------
    console.log('\n[MODULE 10] Audit Trail Immutability (DELETE & MUTATION REJECTED)');
    const auditRes = await apiRequest('GET', '/audit-history');
    assert(auditRes.statusCode === 200, 'GET /audit-history returns audit log');

    const rejectPut = await apiRequest('PUT', '/audit-history', { tamper: true });
    assert(rejectPut.statusCode === 405 || rejectPut.statusCode === 403, 'PUT /audit-history rejected (Immutable)');

    const rejectDel = await apiRequest('DELETE', '/audit-history');
    assert(rejectDel.statusCode === 405 || rejectDel.statusCode === 403, 'DELETE /audit-history rejected (Immutable)');

  } catch (err) {
    console.error('Fatal Test Exception:', err);
    failed++;
  }

  console.log('\n===================================================================');
  console.log(`  CRUD VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testFullCrud();
