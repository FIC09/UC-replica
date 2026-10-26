const http = require('http');

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const postData = options.body ? JSON.stringify(options.body) : null;
    const reqOptions = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch { json = data; }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING WORKER ONBOARDING & ADMIN APPROVAL E2E TESTS ---\n');
  let passed = 0;
  let total = 0;

  function assert(desc, condition) {
    total++;
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
    }
  }

  const testEmail = `tech.ramesh.${Date.now()}@urbanpro.com`;
  const testPassword = `TechPass_${Date.now()}`;
  const testPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);

  // 1. Submit Worker Onboarding Application with Email & Password
  console.log(`1. Submitting Onboarding Application for email: ${testEmail}`);
  const submitRes = await request('/api/worker-applications', {
    method: 'POST',
    body: {
      applicantName: 'Ramesh Patil Specialist',
      phone: testPhone,
      email: testEmail,
      password: testPassword,
      trade: 'ac-appliances',
      tradeName: 'AC & Appliance Repair',
      locality: 'Bandra West, Mumbai',
      experience: '4-5 years',
      status: 'Pending Review'
    }
  });

  assert('Submit worker application returns HTTP 201', submitRes.status === 201 || submitRes.status === 200);
  assert('Application payload contains generated ID', !!submitRes.data?.application?.id);
  assert('Application payload contains registered email', submitRes.data?.application?.email === testEmail.toLowerCase());
  assert('Application payload has Pending Review status', submitRes.data?.application?.status === 'Pending Review');

  const appId = submitRes.data?.application?.id;

  // 2. Attempt Login with Wrong Password
  console.log('\n2. Testing Login with Incorrect Password...');
  const failLoginRes = await request('/api/professional/login', {
    method: 'POST',
    body: {
      identifier: testEmail,
      password: 'wrong_password_123'
    }
  });
  assert('Login with wrong password rejected with 401', failLoginRes.status === 401);

  // 3. Attempt Login with Correct Registered Password
  console.log('\n3. Testing Login with Registered Custom Password...');
  const successLoginRes = await request('/api/professional/login', {
    method: 'POST',
    body: {
      identifier: testEmail,
      password: testPassword
    }
  });

  assert('Login with valid password succeeds with HTTP 200', successLoginRes.status === 200);
  assert('Login response returns JWT token', !!successLoginRes.data?.token);
  assert('Login response indicates isPendingApproval = true', successLoginRes.data?.isPendingApproval === true);
  assert('Worker status is Pending Review prior to admin action', successLoginRes.data?.professional?.status === 'Pending Review');

  const workerToken = successLoginRes.data?.token;

  // 4. Admin checks the worker application in the queue
  console.log('\n4. Admin checking worker applications list...');
  const listRes = await request('/api/worker-applications');
  assert('Admin fetches worker applications with HTTP 200', listRes.status === 200);
  const foundInAdmin = listRes.data?.applications?.find(a => a.id === appId || a.email === testEmail.toLowerCase());
  assert('New worker application appears in Admin applications list', !!foundInAdmin);
  assert('Admin sees applicant email', foundInAdmin?.email === testEmail.toLowerCase());

  // 5. Admin Approves the Worker Application
  console.log('\n5. Admin approving the worker application...');
  const approveRes = await request(`/api/worker-applications/${appId}`, {
    method: 'PUT',
    body: {
      status: 'Approved'
    }
  });

  assert('Admin approval update returns HTTP 200', approveRes.status === 200);
  assert('Updated application status is Approved', approveRes.data?.application?.status === 'Approved');

  // 6. Worker verifies status check & access after Approval
  console.log('\n6. Checking worker profile / re-login after Admin Approval...');
  const postApprovalLogin = await request('/api/professional/login', {
    method: 'POST',
    body: {
      identifier: testEmail,
      password: testPassword
    }
  });

  assert('Worker logs in post-approval with HTTP 200', postApprovalLogin.status === 200);
  assert('isPendingApproval is now false', postApprovalLogin.data?.isPendingApproval === false);
  assert('Worker status is now Approved', postApprovalLogin.data?.professional?.status === 'Approved');

  // 7. Test getProfile with authenticated worker token
  const profileRes = await request('/api/professional/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${postApprovalLogin.data?.token}`,
      'x-professional-id': appId
    }
  });

  assert('Worker profile fetch returns HTTP 200', profileRes.status === 200);
  assert('Worker profile reflects Approved status for full dashboard usage', 
    profileRes.data?.profile?.status === 'Approved' || profileRes.data?.professional?.status === 'Approved');

  console.log(`\n========================================`);
  console.log(`E2E TEST SUMMARY: ${passed} / ${total} PASSED`);
  console.log(`========================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
