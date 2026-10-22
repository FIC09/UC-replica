const http = require('http');

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (dataString) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/professional${path}`,
      method: method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => { responseBody += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING TODAY DASHBOARD & JOBS SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Login as Approved Pro PRO-8841
  const loginRes = await makeRequest('POST', '/login', { proId: 'PRO-8841', password: 'demo' });
  assert(loginRes.status === 200 && loginRes.data.token, 'Login as PRO-8841 successful with token');
  const token = loginRes.data.token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // 2. Test Today Dashboard
  const todayRes = await makeRequest('GET', '/today', null, authHeaders);
  assert(todayRes.status === 200, 'GET /today returned HTTP 200');
  assert(todayRes.data.availability && typeof todayRes.data.availability.isOnline === 'boolean', 'Dashboard has availability object');
  assert(todayRes.data.earningsSummary && todayRes.data.earningsSummary.walletBalance >= 0, 'Dashboard has real earnings summary');
  assert(todayRes.data.upcomingPayout && todayRes.data.upcomingPayout.scheduledDate, 'Dashboard has upcoming payout details');
  assert(Array.isArray(todayRes.data.todayAppointments), 'Dashboard has today appointments array');
  assert(todayRes.data.platformMessages && todayRes.data.platformMessages.length > 0, 'Dashboard includes important platform/business messages');

  // Verify Booking Access Policy on Assigned Job
  const assignedJob = todayRes.data.todayAppointments.find(j => j.status === 'Assigned');
  if (assignedJob) {
    assert(assignedJob.isPhoneMasked === true && assignedJob.phone.includes('•••••'), 'Assigned job phone is masked per Access Policy');
    assert(assignedJob.preciseAddressHidden === true, 'Assigned job precise address is hidden');
    assert(assignedJob.primaryNextAction && assignedJob.primaryNextAction.key === 'EN_ROUTE', 'Valid primary next action is Start Travel (En Route)');
  }

  // 3. Test Offers Endpoint
  const offersRes = await makeRequest('GET', '/offers', null, authHeaders);
  assert(offersRes.status === 200 && Array.isArray(offersRes.data.offers), 'GET /offers returned HTTP 200 with active offers list');

  if (offersRes.data.offers.length > 0) {
    const targetOffer = offersRes.data.offers[0];
    assert(typeof targetOffer.remainingSeconds === 'number', 'Offer card includes remainingSeconds countdown');

    // Accept Offer
    const acceptRes = await makeRequest('POST', `/offers/${targetOffer.id}/accept`, {}, authHeaders);
    assert(acceptRes.status === 200 && acceptRes.data.job, `POST /offers/${targetOffer.id}/accept successfully claims offer`);

    // Concurrent acceptance test (attempting to accept already accepted offer)
    const duplicateAcceptRes = await makeRequest('POST', `/offers/${targetOffer.id}/accept`, {}, authHeaders);
    assert(duplicateAcceptRes.status === 409, 'Concurrent / repeated offer acceptance rejected with HTTP 409 conflict');
  }

  // 4. Test Decline Offer
  const offersRes2 = await makeRequest('GET', '/offers', null, authHeaders);
  if (offersRes2.data.offers.length > 0) {
    const declineTarget = offersRes2.data.offers[0];
    const declineRes = await makeRequest('POST', `/offers/${declineTarget.id}/decline`, { reason: 'schedule_conflict' }, authHeaders);
    assert(declineRes.status === 200, `POST /offers/${declineTarget.id}/decline succeeded with reason`);
  }

  // 5. Test Lifecycle Sequence: Assigned → En Route → Arrived → In Progress → Completed
  // We will test on JOB-9410
  const jobDetailRes = await makeRequest('GET', '/jobs/JOB-9410', null, authHeaders);
  assert(jobDetailRes.status === 200 && jobDetailRes.data.job, 'GET /jobs/JOB-9410 returns detailed specification');
  assert(jobDetailRes.data.job.internalNotes === undefined, 'Internal admin notes strictly omitted from worker response');
  assert(jobDetailRes.data.job.businessNotes === undefined, 'Partner business notes strictly omitted from worker response');

  // Step A: Advance to En Route
  const enRouteRes = await makeRequest('PUT', '/jobs/JOB-9410/status', { status: 'En Route' }, authHeaders);
  assert(enRouteRes.status === 200, 'Lifecycle: Assigned → En Route succeeded');

  // Verify Phone Unmasked upon En Route
  const unmaskedCheck = await makeRequest('GET', '/jobs/JOB-9410', null, authHeaders);
  assert(unmaskedCheck.data.job.isPhoneMasked === false && !unmaskedCheck.data.job.phone.includes('•••••'), 'Phone unmasked once En Route per Booking Access Policy');

  // Step B: Advance to Arrived
  const arrivedRes = await makeRequest('PUT', '/jobs/JOB-9410/status', { status: 'Arrived' }, authHeaders);
  assert(arrivedRes.status === 200, 'Lifecycle: En Route → Arrived succeeded');

  // Step C: Try advancing to In Progress without OTP -> Expect 400
  const missingOtpRes = await makeRequest('PUT', '/jobs/JOB-9410/status', { status: 'In Progress' }, authHeaders);
  assert(missingOtpRes.status === 400, 'Transition to In Progress rejected without Customer Start OTP');

  // Step D: Advance to In Progress with correct OTP (4829)
  const inProgressRes = await makeRequest('PUT', '/jobs/JOB-9410/status', { status: 'In Progress', otp: '4829' }, authHeaders);
  assert(inProgressRes.status === 200, 'Lifecycle: Arrived → In Progress verified with customer OTP');

  // Step E: Idempotency Check
  const repeatRes = await makeRequest('PUT', '/jobs/JOB-9410/status', { status: 'In Progress' }, authHeaders);
  assert(repeatRes.status === 200 && repeatRes.data.message.includes('Idempotent'), 'Idempotent repeated update returns success');

  // Step F: Checklist Update
  const checklistRes = await makeRequest('PUT', '/jobs/JOB-9410/checklist', { itemId: '1', completed: true }, authHeaders);
  assert(checklistRes.status === 200, 'Checklist item toggled via PUT /jobs/:id/checklist');

  // Step G: Add Private Professional Note
  const noteRes = await makeRequest('POST', '/jobs/JOB-9410/notes', { note: 'Copper flare nut was slightly loose, retightened with torque wrench.' }, authHeaders);
  assert(noteRes.status === 200 && noteRes.data.note, 'Private technician note added via POST /jobs/:id/notes');

  // Step H: Advance to Completed
  const completeRes = await makeRequest('PUT', '/jobs/JOB-9410/status', { status: 'Completed' }, authHeaders);
  assert(completeRes.status === 200, 'Lifecycle: In Progress → Completed succeeded');

  // Terminal state protection: Cannot transition backwards from Completed
  const backwardRes = await makeRequest('PUT', '/jobs/JOB-9410/status', { status: 'Assigned' }, authHeaders);
  assert(backwardRes.status === 400, 'Terminal state protection: Transition from Completed rejected with HTTP 400');

  // 6. Test Reassignment Request on another assigned job (e.g. JOB-9411)
  const reassignRes = await makeRequest('POST', '/jobs/JOB-9411/reassign', { reason: 'Transit vehicle puncture on Western Express Highway.' }, authHeaders);
  assert(reassignRes.status === 200, 'POST /jobs/:id/reassign accepted with valid mandatory reason');

  const reassignInvalidRes = await makeRequest('POST', '/jobs/JOB-9411/reassign', { reason: 'no' }, authHeaders);
  assert(reassignInvalidRes.status === 400, 'POST /jobs/:id/reassign rejected when reason is too brief');

  console.log(`\n========================================`);
  console.log(`TOTAL PASSED: ${passed}`);
  console.log(`TOTAL FAILED: ${failed}`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
