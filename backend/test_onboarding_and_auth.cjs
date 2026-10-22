const http = require('http');

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/professional${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...headers
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  ✗ [FAIL] ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ [PASS] ${message}`);
  }
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('   URBAN PRO: ONBOARDING & AUTHENTICATION TEST SUITE');
  console.log('===============================================================\n');

  // 1. Phone OTP Dispatch & Sandbox Notice
  console.log('[TEST GROUP 1] Phone OTP Authentication & Environment Notice');
  const otpRes = await makeRequest('POST', '/auth/send-otp', { phone: '+91 99999 12345' });
  assert(otpRes.status === 200, 'OTP request returns HTTP 200');
  assert(otpRes.body.success === true, 'OTP response success is true');
  assert(otpRes.body.isDemoMode === true, 'Explicit sandbox demo mode flagged when SMS gateway is unconfigured');
  assert(otpRes.body.message.includes('SMS Gateway unconfigured'), 'Accurate unconfigured notice returned without claiming delivery');
  assert(otpRes.body.demoOtp === '4829', 'Demo OTP returned strictly for sandbox testing');

  // Cooldown check (immediate second call should return HTTP 429)
  const cooldownRes = await makeRequest('POST', '/auth/send-otp', { phone: '+91 99999 12345' });
  assert(cooldownRes.status === 429, 'Immediate re-request triggers rate limit cooldown (HTTP 429)');

  // 2. OTP Verification Attempt Limiter & Invalid OTP Rejection
  console.log('\n[TEST GROUP 2] OTP Attempt Limits & Strict Validation');
  const invalidOtpRes = await makeRequest('POST', '/auth/verify-otp', { phone: '+91 99999 12345', otp: '0000' });
  assert(invalidOtpRes.status === 400, 'Arbitrary code strictly rejected with HTTP 400');
  assert(invalidOtpRes.body.error.includes('Invalid verification OTP'), 'Descriptive OTP rejection error');

  // Valid OTP verification
  const validOtpRes = await makeRequest('POST', '/auth/verify-otp', { phone: '+91 99999 12345', otp: '4829' });
  assert(validOtpRes.status === 200, 'Valid sandbox OTP verified with HTTP 200');
  assert(validOtpRes.body.token, 'Session JWT token issued upon valid verification');

  // 3. Multi-Step Registration & Strict Non-Auto-Approval Gate
  console.log('\n[TEST GROUP 3] Multi-Step Application & Compliance Gate');
  const appPayload = {
    applicantName: 'Suresh Patil',
    phone: '+91 98200 44321',
    trade: 'Appliance Repair & AC',
    experience: '6 years',
    city: 'Mumbai',
    locality: 'Andheri West',
    employmentType: 'Direct Freelance',
    aadhaarNumber: '8912-3321-4412',
    panNumber: 'SRHPP4412K'
  };

  const regRes = await makeRequest('POST', '/register', appPayload);
  assert(regRes.status === 201 || regRes.status === 200, 'Application submitted with HTTP 201/200');
  assert(regRes.body.professional.id.startsWith('WRK-'), 'Worker reference ID generated');
  assert(regRes.body.professional.status === 'Under Review', 'CRITICAL: New registration is STRICTLY "Under Review" (ZERO auto-approval)');
  assert(regRes.body.professional.isOnline === false, 'CRITICAL: Live duty is locked offline for pending workers');

  const newProId = regRes.body.professional.id;

  // 4. Privileges Gated for Pending Worker
  console.log('\n[TEST GROUP 4] Privilege Gating for Unapproved Worker');
  const jobsRes = await makeRequest('GET', '/jobs', null, { 'x-professional-id': newProId });
  assert(jobsRes.status === 403, 'Pending worker blocked from viewing dispatch jobs (HTTP 403 Forbidden)');
  assert(jobsRes.body.error.includes('Pending Verification'), 'Clear verification requirement message');

  const onlineRes = await makeRequest('PUT', '/availability', { isOnline: true }, { 'x-professional-id': newProId });
  assert(onlineRes.status === 403, 'Pending worker blocked from starting duty online (HTTP 403 Forbidden)');

  const withdrawRes = await makeRequest('POST', '/payouts/withdraw', { amount: 500 }, { 'x-professional-id': newProId });
  assert(withdrawRes.status === 403, 'Pending worker blocked from withdrawing payouts (HTTP 403 Forbidden)');

  // 5. Onboarding Status Checklist & Verification Audit
  console.log('\n[TEST GROUP 5] Onboarding Audit & Progress Checklist');
  const statusRes = await makeRequest('GET', '/onboarding-status', null, { 'x-professional-id': newProId });
  assert(statusRes.status === 200, 'Onboarding status retrieved with HTTP 200');
  assert(statusRes.body.checklist && statusRes.body.checklist.length === 6, 'All 6 compliance steps included in checklist');
  assert(statusRes.body.missingRequirements.length > 0, 'Missing compliance requirements displayed');
  assert(statusRes.body.reviewComments.length > 0, 'Compliance reviewer feedback logged');
  assert(statusRes.body.trainingRequirements.length > 0, 'Mandatory SOP training requirements identified');

  // 6. Correction Resubmission
  console.log('\n[TEST GROUP 6] Document Correction Resubmission');
  const resubmitRes = await makeRequest('POST', '/onboarding/resubmit', {
    docType: 'pan',
    docNumber: 'SRHPP4412K-RESCAN',
    note: 'Uploaded non-reflective flat scan of PAN card in bright ambient daylight.'
  }, { 'x-professional-id': newProId });
  assert(resubmitRes.status === 200, 'Document correction accepted with HTTP 200');
  assert(resubmitRes.body.message.includes('resubmitted'), 'Confirmation message returned');

  // 7. Suspended Worker Strict Isolation
  console.log('\n[TEST GROUP 7] Suspended Worker Security Isolation (PRO-8847)');
  const suspendedJobRes = await makeRequest('GET', '/jobs', null, { 'x-professional-id': 'PRO-8847' });
  assert(suspendedJobRes.status === 403, 'Suspended worker blocked from dispatch queue (HTTP 403)');
  assert(suspendedJobRes.body.error.includes('Account suspended'), 'Clear suspension notice returned');

  const suspendedOnlineRes = await makeRequest('PUT', '/availability', { isOnline: true }, { 'x-professional-id': 'PRO-8847' });
  assert(suspendedOnlineRes.status === 403, 'Suspended worker blocked from starting shift (HTTP 403)');

  console.log('\n===============================================================');
  console.log('   ALL ONBOARDING & AUTHENTICATION VERIFICATION TESTS PASSED!');
  console.log('===============================================================\n');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
