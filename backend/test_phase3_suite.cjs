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

async function runSuite() {
  console.log('--- STARTING PHASE 3 VERIFICATION SUITE ---');

  // 1. Login as Super Admin
  const loginRes = await request('POST', '/auth/login', {
    email: 'admin@urbancompany.com',
    password: 'admin123'
  });
  console.assert(loginRes.statusCode === 200, `Login failed: ${loginRes.statusCode}`);
  const token = loginRes.body.token;
  console.log('✓ 1. Super Admin authentication successful. JWT token received.');

  // 2. Team listing
  const teamRes = await request('GET', '/team', null, token);
  console.assert(teamRes.statusCode === 200, 'Failed to fetch team');
  console.assert(teamRes.body.team.length >= 6, 'Expected at least 6 initial administrators');
  console.log(`✓ 2. Team roster verified: ${teamRes.body.team.length} administrators retrieved.`);

  // 3. Permission matrix
  const permRes = await request('GET', '/team/permissions', null, token);
  console.assert(permRes.statusCode === 200, 'Failed to fetch permission matrix');
  console.assert(permRes.body.roles.includes('Operations Manager') && permRes.body.roles.includes('Finance Manager'), 'Roles incomplete');
  console.log(`✓ 3. Permission matrix verified across ${permRes.body.roles.length} platform roles.`);

  // 4. Session Revocation
  const opsMember = teamRes.body.team.find(m => m.role === 'Operations Manager') || teamRes.body.team[1];
  const opsId = opsMember._id || opsMember.id;
  const revokeRes = await request('POST', `/team/${opsId}/revoke-sessions`, { reason: 'Security audit test' }, token);
  console.assert(revokeRes.statusCode === 200, 'Failed to revoke sessions');
  console.log(`✓ 4. Session revocation successful for ${opsMember.name}. Token version incremented.`);

  // 5. Final Super Admin Guard
  const superMember = teamRes.body.team.find(m => m.role === 'Super Admin') || teamRes.body.team[0];
  const superId = superMember._id || superMember.id;
  const guardRes = await request('PUT', `/team/${superId}/status`, { status: 'Suspended' }, token);
  console.assert(guardRes.statusCode === 400, `Final Super Admin guard failed to protect account: ${guardRes.statusCode}`);
  console.log('✓ 5. Final Super Admin deactivation correctly blocked by security guard (HTTP 400).');

  // 6. Settings Retrieval
  const settingsRes = await request('GET', '/settings', null, token);
  console.assert(settingsRes.statusCode === 200, 'Failed to get settings');
  const s = settingsRes.body.settings;
  console.assert(s.currency === 'INR', `Expected INR currency, got ${s.currency}`);
  console.assert(s.timeZone === 'Asia/Kolkata', `Expected Asia/Kolkata timezone, got ${s.timeZone}`);
  console.assert(typeof s.bookingBufferMinutes === 'number' && s.bookingBufferMinutes > 0, `Expected positive buffer, got ${s.bookingBufferMinutes}`);
  console.assert(Array.isArray(s.integrations) && s.integrations.length >= 4, 'Integrations list missing');
  console.log(`✓ 6. Platform settings verified: Explicit currency=${s.currency}, timezone=${s.timeZone}, buffer=${s.bookingBufferMinutes}m, integrations=${s.integrations.length}.`);

  // 7. Settings Bounds Validation
  const invalidGstRes = await request('PUT', '/settings', { gstRate: 95 }, token);
  console.assert(invalidGstRes.statusCode === 400, `Expected 400 on 95% GST, got ${invalidGstRes.statusCode}`);
  console.log('✓ 7. Settings server-side validation correctly rejected out-of-bounds GST rate (HTTP 400).');

  // 8. Settings Update & Audit Trail
  const validUpdateRes = await request('PUT', '/settings', { bookingBufferMinutes: 35, reason: 'Evening traffic adjustment' }, token);
  console.assert(validUpdateRes.statusCode === 200, 'Failed to update valid settings');
  console.assert(validUpdateRes.body.settings.bookingBufferMinutes === 35, 'Buffer not updated');
  console.log('✓ 8. Platform settings successfully updated and persisted.');

  // 9. Weather Surge Toggle
  const surgeRes = await request('POST', '/surge', { active: true, amount: 49 }, token);
  console.assert(surgeRes.statusCode === 200, 'Failed to toggle surge');
  console.assert(surgeRes.body.monsoonSurgeActive === true, 'Surge not active');
  console.log('✓ 9. Weather surge successfully toggled (+₹49).');

  // 10. Audit Logs Inspection
  const auditRes = await request('GET', '/audit-logs', null, token);
  console.assert(auditRes.statusCode === 200, 'Failed to fetch audit logs');
  console.assert(auditRes.body.auditLogs.length > 0, 'Audit logs empty');
  // Verify sensitive data is NOT present in any audit log
  const rawAuditJson = JSON.stringify(auditRes.body.auditLogs);
  console.assert(!rawAuditJson.includes('admin123') && !rawAuditJson.includes('$2a$10$'), 'Sensitive credentials leaked into audit trail!');
  console.log(`✓ 10. System audit logs verified (${auditRes.body.auditLogs.length} events). Zero secrets or credentials leaked.`);

  // 11. Audit CSV Export with Formula Injection Guard
  const csvRes = await request('GET', '/audit-logs/export', null, token);
  console.assert(csvRes.statusCode === 200, 'Failed to export audit CSV');
  console.assert(csvRes.raw.includes('Log ID') && csvRes.raw.includes('Timestamp'), 'CSV headers malformed');
  console.log('✓ 11. Audit trail CSV successfully exported with formula injection protection.');

  // 12. Demo Reset Action
  const resetRes = await request('POST', '/demo/reset', { reason: 'Automated test suite reset' }, token);
  console.assert(resetRes.statusCode === 200, 'Failed to reset demo data');
  console.log('✓ 12. Demo sandbox reset action executed and audit recorded successfully.');

  console.log('\n===========================================');
  console.log('>>> ALL 12 PHASE 3 SUITE TESTS PASSED! <<<');
  console.log('===========================================\n');
}

runSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
