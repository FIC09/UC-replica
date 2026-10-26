// Comprehensive E2E Verification for Partner Onboarding & Admin Approval
const http = require('http');

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Partner Onboarding & Admin Approval E2E Verification...\n');
  let passed = 0;
  let failed = 0;

  function assert(desc, condition) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  const timestamp = Date.now().toString().slice(-5);
  const testPartner = {
    id: `PTR-TEST-${timestamp}`,
    businessName: `Metro Elite Fleet Solutions ${timestamp}`,
    ownerName: `Rajesh Khurana ${timestamp}`,
    phone: `+91 98200 ${timestamp}`,
    email: `director.${timestamp}@metrofleet.in`,
    password: `PartnerSecure#${timestamp}`,
    businessType: 'Partnership / LLP',
    category: 'ac-appliances',
    categoryName: 'AC & Appliance Repair',
    fleetSize: '16-30 Technicians',
    monthlyCapacity: '500-1000 orders/mo',
    city: 'Bandra West, Mumbai',
    gstNumber: '27AABCM5678F1Z9',
    status: 'Pending Review'
  };

  // STEP 1: Registration
  console.log('🔹 1. Registering new partner application with email and password...');
  const regRes = await request('/api/partner-applications', {
    method: 'POST',
    body: testPartner
  });
  assert('Partner registration returns HTTP 201', regRes.status === 201);
  assert('Returned partner application has correct businessName', regRes.data?.application?.businessName === testPartner.businessName);
  assert('Returned partner application has registered email', regRes.data?.application?.email === testPartner.email.toLowerCase());
  assert('Returned partner application status is Pending Review', regRes.data?.application?.status === 'Pending Review');

  // STEP 2: Login with wrong password
  console.log('\n🔹 2. Verifying password security: Login with incorrect password...');
  const failLoginRes = await request('/api/partner/login', {
    method: 'POST',
    body: {
      emailOrPhone: testPartner.email,
      password: 'WrongPassword123'
    }
  });
  assert('Login with wrong password returns HTTP 401', failLoginRes.status === 401);
  assert('Returns error message about invalid credentials', failLoginRes.data?.error?.includes('Invalid credentials'));

  // STEP 3: Login with correct custom password
  console.log('\n🔹 3. Partner login with registered custom password...');
  const successLoginRes = await request('/api/partner/login', {
    method: 'POST',
    body: {
      emailOrPhone: testPartner.email,
      password: testPartner.password
    }
  });
  assert('Partner login returns HTTP 200', successLoginRes.status === 200);
  assert('Login response includes JWT token', Boolean(successLoginRes.data?.token));
  assert('Login response partner profile has Pending status', successLoginRes.data?.partner?.status === 'Pending Review');
  assert('Login response includes staff owner account', successLoginRes.data?.staff?.role === 'Business Owner');

  const partnerToken = successLoginRes.data?.token;

  // STEP 4: Fetch partner profile before approval
  console.log('\n🔹 4. Fetching /api/partner/me while pending approval...');
  const mePendingRes = await request('/api/partner/me', {
    headers: { Authorization: `Bearer ${partnerToken}` }
  });
  assert('/api/partner/me returns HTTP 200', mePendingRes.status === 200);
  assert('Partner profile status is Pending Review', mePendingRes.data?.partner?.status === 'Pending Review');

  // STEP 5: Admin retrieves partner applications list
  console.log('\n🔹 5. Admin checking partner applications list...');
  const adminListRes = await request('/api/partner-applications');
  assert('Admin GET /api/partner-applications returns HTTP 200', adminListRes.status === 200);
  const foundInList = adminListRes.data?.applications?.find(a => a.id === testPartner.id || a.email === testPartner.email.toLowerCase());
  assert('Admin can see newly submitted partner application', Boolean(foundInList));
  assert('Admin sees partner email correctly', foundInList?.email === testPartner.email.toLowerCase());
  assert('Admin sees partner password is set', Boolean(foundInList?.password));

  // STEP 6: Admin approves partner application
  console.log('\n🔹 6. Admin approving partner agency...');
  const approveRes = await request(`/api/partner-applications/${testPartner.id}`, {
    method: 'PUT',
    body: { status: 'Approved' }
  });
  assert('Admin approval PUT returns HTTP 200', approveRes.status === 200);
  assert('Application status updated to Approved', approveRes.data?.application?.status === 'Approved');

  // STEP 7: Partner checks status post-approval (/api/partner/me)
  console.log('\n🔹 7. Partner status refresh post-approval...');
  const meApprovedRes = await request('/api/partner/me', {
    headers: { Authorization: `Bearer ${partnerToken}` }
  });
  assert('/api/partner/me returns HTTP 200', meApprovedRes.status === 200);
  assert('Partner profile is now Approved', meApprovedRes.data?.partner?.status === 'Approved');

  // STEP 8: Re-login post-approval
  console.log('\n🔹 8. Partner login post-approval...');
  const postApprovalLogin = await request('/api/partner/login', {
    method: 'POST',
    body: {
      emailOrPhone: testPartner.email,
      password: testPartner.password
    }
  });
  assert('Post-approval login returns HTTP 200', postApprovalLogin.status === 200);
  assert('Post-approval partner status is Approved', postApprovalLogin.data?.partner?.status === 'Approved');

  console.log(`\n========================================`);
  console.log(`E2E Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
