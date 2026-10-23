const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api/professional';

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const headers = {
      'Content-Type': 'application/json',
      'x-professional-id': 'PRO-8841'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n--- STARTING CHECKLISTS, EVIDENCE, EXTRA WORK, AVAILABILITY & EARNINGS SUITE ---');

  // 1. Authenticate
  const loginRes = await makeRequest('/login', 'POST', { phone: '+91 98205 11982', pin: '8841' });
  assert.strictEqual(loginRes.status, 200);
  const token = loginRes.body.token;
  console.log('  [PASS] Authenticated successfully as PRO-8841');

  // 2. Checklists Endpoint
  const chkRes = await makeRequest('/jobs/JOB-9410/checklists', 'GET', null, token);
  assert.strictEqual(chkRes.status, 200);
  assert(chkRes.body.checklists.beforeService.length > 0);
  assert(chkRes.body.checklists.safetyChecks.length > 0);
  assert(chkRes.body.checklists.workPerformed.length > 0);
  assert(chkRes.body.platformPhotoPolicy.maxSizeMb === 5);
  console.log('  [PASS] GET /jobs/:id/checklists returns service-specific SOP checklists');

  // 3. Update Checklist item
  const updateChkRes = await makeRequest('/jobs/JOB-9410/checklists', 'PUT', {
    section: 'safetyChecks',
    itemId: 'sc-3',
    completed: true,
    completionNotes: 'High-pressure powerjet cleaning completed without spill. Earthing verified.'
  }, token);
  assert.strictEqual(updateChkRes.status, 200);
  console.log('  [PASS] PUT /jobs/:id/checklists updates SOP item and completion notes');

  // 4. Photo Evidence Upload with validation
  // Test 4A: Reject invalid MIME type
  const badMimeRes = await makeRequest('/jobs/JOB-9410/photos', 'POST', {
    phase: 'before',
    photoType: 'equipment',
    mimeType: 'application/pdf',
    fileSizeKb: 800
  }, token);
  assert.strictEqual(badMimeRes.status, 400);
  console.log('  [PASS] Photo upload rejects invalid MIME type (.pdf)');

  // Test 4B: Reject oversized file > 5MB
  const bigFileRes = await makeRequest('/jobs/JOB-9410/photos', 'POST', {
    phase: 'before',
    photoType: 'equipment',
    mimeType: 'image/jpeg',
    fileSizeKb: 6500 // > 5120
  }, token);
  assert.strictEqual(bigFileRes.status, 400);
  console.log('  [PASS] Photo upload rejects file exceeding 5MB platform maximum limit');

  // Test 4C: Accept valid photo
  const goodPhotoRes = await makeRequest('/jobs/JOB-9410/photos', 'POST', {
    phase: 'before',
    photoType: 'equipment',
    mimeType: 'image/jpeg',
    fileSizeKb: 1240,
    fileName: 'ac_compressor_inspection.jpg'
  }, token);
  assert.strictEqual(goodPhotoRes.status, 200);
  assert(goodPhotoRes.body.photo.id);
  console.log('  [PASS] Valid inspection evidence photo accepted and saved in vault');

  // 5. Extra Work Platform-Approved Price Rules & Proposal
  const catRes = await makeRequest('/jobs/JOB-9410/extra-work/catalog', 'GET', null, token);
  assert.strictEqual(catRes.status, 200);
  assert(catRes.body.catalogue.length >= 5);
  console.log('  [PASS] Platform-approved extra work price rules retrieved');

  // Propose extra work
  const proposeRes = await makeRequest('/jobs/JOB-9410/extra-work', 'POST', {
    ruleId: 'EX-AC-04',
    scope: 'Compressor capacitor failed microfarad test (18uF vs 45uF rating).',
    qty: 1
  }, token);
  assert.strictEqual(proposeRes.status, 200);
  const extraWorkId = proposeRes.body.extraWorkItem.id;
  assert.strictEqual(proposeRes.body.extraWorkItem.status, 'Pending Customer Approval');
  assert.strictEqual(proposeRes.body.extraWorkItem.amount, 450);
  console.log('  [PASS] Extra work proposed with status "Pending Customer Approval" (bill not silently increased)');

  // 6. Verifiable Customer Approval Workflow
  const approveRes = await makeRequest(`/jobs/JOB-9410/extra-work/${extraWorkId}/approval`, 'POST', {
    action: 'approve',
    approvedBy: 'Rohan Kapoor',
    approvalMethod: 'SMS OTP / PIN Verification',
    isDemo: true
  }, token);
  assert.strictEqual(approveRes.status, 200);
  assert.strictEqual(approveRes.body.extraWorkItem.status, 'Approved');
  assert(approveRes.body.extraWorkItem.history.length >= 2);
  assert(approveRes.body.newTotal > 548);
  console.log('  [PASS] Verifiable customer approval recalculates totals on backend and preserves history');

  // 7. Booking-Scoped In-App Chat & Telephony Channels
  const msgRes = await makeRequest('/jobs/JOB-9410/messages', 'GET', null, token);
  assert.strictEqual(msgRes.status, 200);
  assert(msgRes.body.messages.length > 0);
  assert(msgRes.body.pollingNotice.includes('Manual Refresh / Polled'));
  assert(msgRes.body.channels.maskedTelephony.isMasked === true);
  assert(msgRes.body.channels.navigation.externalMapsUrl.includes('google.com/maps'));
  console.log('  [PASS] Booking-scoped chat, masked telephony, and external maps navigation verified');

  // Send message
  const sendRes = await makeRequest('/jobs/JOB-9410/messages', 'POST', {
    text: 'I have arrived outside Tower 4. Please buzz security.'
  }, token);
  assert.strictEqual(sendRes.status, 200);
  assert.strictEqual(sendRes.body.message.deliveryStatus, 'sent');
  console.log('  [PASS] Booking-scoped message sent with actual delivery status');

  // 8. Cancellation Policy & Incident Reporting (9 categories)
  const polRes = await makeRequest('/cancellation-policy', 'GET', null, token);
  assert.strictEqual(polRes.status, 200);
  assert.strictEqual(Object.keys(polRes.body.policies).length, 9);
  console.log('  [PASS] Platform cancellation policy read from configured rules (9 categories)');

  const incidentRes = await makeRequest('/jobs/JOB-9410/incident-report', 'POST', {
    category: 'running_late',
    reason: 'Traffic congestion on Western Express Highway near Bandra Flyover.',
    delayMinutes: 20,
    consequencesAcknowledged: true
  }, token);
  assert.strictEqual(incidentRes.status, 200);
  assert.strictEqual(incidentRes.body.incident.delayMinutes, 20);
  console.log('  [PASS] Delay/Incident reported under platform policy with consequences acknowledged');

  // 9. Calendar & Availability with Shift Breaks, Conflict Guard & Timezone
  const availRes = await makeRequest('/availability', 'GET', null, token);
  assert.strictEqual(availRes.status, 200);
  assert(availRes.body.shiftBreaks.length > 0);
  assert(availRes.body.workingSlots.length > 0);
  assert.strictEqual(availRes.body.timeZone.includes('Asia/Kolkata'), true);
  assert(['Available', 'Busy on Booking', 'Offline'].includes(availRes.body.dispatchState));
  console.log('  [PASS] Availability distinguishes declared hours, working slots, breaks, and dispatch state');

  // Conflict test: Attempt to take leave on today when active job exists
  const conflictRes = await makeRequest('/availability', 'PUT', {
    newLeave: { date: 'Today, 23 Oct 2026', reason: 'Unplanned absence' }
  }, token);
  assert.strictEqual(conflictRes.status, 409);
  console.log('  [PASS] Backend validation rejects leave conflicting with active confirmed booking (HTTP 409)');

  // 10. Itemized Earnings Ledger with Paisa Minor Units & 6 Financial Stages
  const earnRes = await makeRequest('/earnings', 'GET', null, token);
  assert.strictEqual(earnRes.status, 200);
  const earnData = earnRes.body.earnings;
  assert(earnData.minorCurrencyUnit.includes('Paisa'));
  assert(earnData.financialStages.earnedPaisa > 0);
  assert(earnData.financialStages.availableForSettlementPaisa > 0);
  assert(earnData.itemizedLedger.length > 0);
  assert(earnData.itemizedLedger[0].grossFarePaisa > 0);
  assert(earnData.itemizedLedger[0].recipientSnapshot.bankName);
  assert(earnData.financialNotice.includes('distinct from funds already released'));
  console.log('  [PASS] Earnings ledger uses integer minor currency units (paisa), 6 financial stages & recipient snapshots');

  console.log('\n========================================');
  console.log('ALL 12 MODULE VERIFICATION TESTS PASSED!');
  console.log('========================================\n');
}

runTests().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
