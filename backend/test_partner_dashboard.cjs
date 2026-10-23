/**
 * Enterprise Verification Suite for Business Partner Dashboard Backend
 * Verifies all 20+ partner endpoints, RBAC permission matrix (5 roles), multi-tenant isolation,
 * rate limiting, and data integrity.
 */

const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runPartnerTests() {
  console.log('==================================================================');
  console.log('>>> COMPLETE BUSINESS PARTNER DASHBOARD BACKEND VERIFICATION <<<');
  console.log('==================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  ✓ ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // SUITE 1: Server Health & Unauthenticated Security
    // -------------------------------------------------------------
    console.log('[SUITE 1] Server Health & Unauthenticated Security...');
    const health = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    assert(health.status === 200 && health.data.status === 'ok', 'Server health check passed with HTTP 200');

    const unauthSummary = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/partner/dashboard-summary', method: 'GET' });
    assert(unauthSummary.status === 401, 'Unauthenticated access to dashboard rejected (HTTP 401)');

    const unauthBookings = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/partner/bookings', method: 'GET' });
    assert(unauthBookings.status === 401, 'Unauthenticated access to bookings rejected (HTTP 401)');

    const unauthFinances = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/partner/earnings', method: 'GET' });
    assert(unauthFinances.status === 401, 'Unauthenticated access to earnings rejected (HTTP 401)');

    // -------------------------------------------------------------
    // SUITE 2: Authentication, Bad Credentials & Generic Errors
    // -------------------------------------------------------------
    console.log('\n[SUITE 2] Authentication, Bad Credentials & Generic Errors...');
    const badLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      emailOrPhone: 'contact@apexhome.in',
      password: 'IncorrectPassword!#$'
    });
    assert(badLogin.status === 401 && badLogin.data.error.includes('Invalid credentials'), 'Bad password returns generic error');

    const nonExistentUser = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      emailOrPhone: 'nobody@nowhere.com',
      password: 'Partner@2026'
    });
    assert(nonExistentUser.status === 401 && nonExistentUser.data.error.includes('Invalid credentials'), 'Non-existent user returns generic error');

    const pwdReset = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/password-reset',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'contact@apexhome.in' });
    assert(pwdReset.data.deliveryStatus === 'unconfigured', 'Password reset accurately reports unconfigured email delivery');

    // -------------------------------------------------------------
    // SUITE 3: Business Owner Login & Profile Identity
    // -------------------------------------------------------------
    console.log('\n[SUITE 3] Business Owner Login & Profile Identity...');
    const ownerLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      emailOrPhone: 'contact@apexhome.in',
      password: 'Partner@2026'
    });
    assert(ownerLogin.status === 200 && ownerLogin.data.success === true, 'Business Owner authenticated successfully');
    const ownerToken = ownerLogin.data.token;
    assert(ownerLogin.data.partner.id === 'PTR-90142', 'Partner ID matches PTR-90142 (Apex Home Solutions LLP)');
    assert(ownerLogin.data.staff.role === 'Business Owner', 'Staff role is Business Owner');
    assert(ownerLogin.data.staff.permissions.requesting_bank_changes === true, 'Owner has requesting_bank_changes permission');
    assert(ownerLogin.data.staff.permissions.managing_staff === true, 'Owner has managing_staff permission');

    // -------------------------------------------------------------
    // SUITE 4: Strict Multi-Tenant Isolation
    // -------------------------------------------------------------
    console.log('\n[SUITE 4] Multi-Tenant Isolation Between Partners...');
    // Partner A (Apex Home Solutions) attempts to query Partner B (Krishnagiri QuickFix Care)
    const crossTenantQuery = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/bookings?targetPartnerId=PTR-90143',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(crossTenantQuery.status === 403, 'Cross-tenant query blocked with HTTP 403 Forbidden');
    assert(crossTenantQuery.data.error.includes('Cross-tenant access prohibited'), 'Helpful tenant security violation message');

    // Partner B Login (Krishnagiri QuickFix Care)
    const partnerBLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      emailOrPhone: 'selvam@quickfixcare.com',
      password: 'Partner@2026'
    });
    assert(partnerBLogin.status === 200 && partnerBLogin.data.partner.id === 'PTR-90143', 'Partner B (PTR-90143) logged in');
    const partnerBToken = partnerBLogin.data.token;

    // Partner B gets their own bookings -> should see ORD-9870 in Krishnagiri, NOT Mumbai bookings!
    const partnerBBookings = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/bookings',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${partnerBToken}` }
    });
    assert(partnerBBookings.status === 200, 'Partner B accessed own bookings');
    const bBookingIds = partnerBBookings.data.bookings.map(b => b.id);
    assert(bBookingIds.includes('ORD-9870'), 'Partner B sees their assigned booking ORD-9870');
    assert(!bBookingIds.includes('ORD-9841'), 'Partner B cannot see Partner A booking ORD-9841');

    // -------------------------------------------------------------
    // SUITE 5: Role-Based Access Control (RBAC) Matrix Tests
    // -------------------------------------------------------------
    console.log('\n[SUITE 5] Role-Based Access Control (5 Roles)...');

    // Dispatcher
    const dispatcherLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { emailOrPhone: 'dispatcher@apexhome.in', password: 'Partner@2026' });
    const dispatcherToken = dispatcherLogin.data.token;
    assert(dispatcherLogin.data.staff.role === 'Dispatcher', 'Dispatcher authenticated');

    // Dispatcher assigns booking -> Allowed
    const assignJobRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/bookings/ORD-9845/assign',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${dispatcherToken}`, 'Content-Type': 'application/json' }
    }, { professionalId: 'PRO-8841' });
    assert(assignJobRes.status === 200 && assignJobRes.data.success === true, 'Dispatcher has permission to assign jobs');

    // Dispatcher tries to view finances -> Blocked HTTP 403
    const dispatcherEarnings = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/earnings',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${dispatcherToken}` }
    });
    assert(dispatcherEarnings.status === 403, 'Dispatcher blocked from viewing earnings (HTTP 403)');

    // Dispatcher tries to change bank account -> Blocked HTTP 403
    const dispatcherBankChange = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/settlements/bank-change-request',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${dispatcherToken}`, 'Content-Type': 'application/json' }
    }, { bankName: 'Axis Bank', accountNumber: '12345', ifscCode: 'UTIB0000001' });
    assert(dispatcherBankChange.status === 403, 'Dispatcher blocked from requesting bank change (HTTP 403)');

    // Finance Staff
    const financeLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { emailOrPhone: 'finance@apexhome.in', password: 'Partner@2026' });
    const financeToken = financeLogin.data.token;
    assert(financeLogin.data.staff.role === 'Finance Staff', 'Finance Staff authenticated');

    // Finance views earnings -> Allowed
    const financeEarnings = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/earnings',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${financeToken}` }
    });
    assert(financeEarnings.status === 200 && financeEarnings.data.settlementModel === 'settle_to_business', 'Finance Staff accessed earnings');

    // Finance tries to assign jobs -> Blocked HTTP 403
    const financeAssign = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/bookings/ORD-9845/assign',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${financeToken}`, 'Content-Type': 'application/json' }
    }, { professionalId: 'PRO-8842' });
    assert(financeAssign.status === 403, 'Finance Staff blocked from assigning jobs (HTTP 403)');

    // Read-only Staff
    const analystLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { emailOrPhone: 'analyst@apexhome.in', password: 'Partner@2026' });
    const analystToken = analystLogin.data.token;
    assert(analystLogin.data.staff.role === 'Read-only Staff', 'Read-only Staff authenticated');

    // Read-only views bookings -> Allowed
    const analystBookings = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/bookings',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${analystToken}` }
    });
    assert(analystBookings.status === 200, 'Read-only Staff can view bookings');

    // Read-only modifies settings -> Blocked HTTP 403
    const analystSettings = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/settings',
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${analystToken}`, 'Content-Type': 'application/json' }
    }, { autoDispatch: false });
    assert(analystSettings.status === 403, 'Read-only Staff blocked from modifying settings (HTTP 403)');

    // -------------------------------------------------------------
    // SUITE 6: Staff Protection & Final Owner Deletion Guard
    // -------------------------------------------------------------
    console.log('\n[SUITE 6] Staff Management & Final Owner Protection...');
    const staffListRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/staff',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(staffListRes.status === 200 && staffListRes.data.staff.length >= 4, 'Staff list retrieved');

    const ownerRecord = staffListRes.data.staff.find(s => s.role === 'Business Owner');
    const deleteFinalOwner = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/partner/staff/${ownerRecord.id}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(deleteFinalOwner.status === 400 && deleteFinalOwner.data.error.includes('Cannot remove the final active Business Owner'), 'Prevented deletion of final active Business Owner (HTTP 400)');

    // Non-owner cannot create an Owner
    const managerLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { emailOrPhone: 'pooja@apexhome.in', password: 'Partner@2026' });
    const managerToken = managerLogin.data.token;

    const escalateAttempt = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/partner/staff',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${managerToken}`, 'Content-Type': 'application/json' }
    }, {
      name: 'Rogue Owner',
      email: 'rogue@apexhome.in',
      role: 'Business Owner'
    });
    assert(escalateAttempt.status === 403, 'Non-owner blocked from elevating a user to Business Owner (HTTP 403)');

    // -------------------------------------------------------------
    // SUITE 7: Endpoints Verification (All Remaining Operations)
    // -------------------------------------------------------------
    console.log('\n[SUITE 7] Services, Coverage, Invoices, Training, Inventory, Support...');
    // Services
    const servicesRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/services', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(servicesRes.status === 200 && servicesRes.data.services.length >= 5, 'Authorised service catalogue retrieved');

    // Coverage
    const coverageRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/coverage', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(coverageRes.status === 200 && coverageRes.data.coverageZones.length >= 3, 'Coverage zones & hubs retrieved');

    // Invoices & Download
    const invoicesRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/invoices', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(invoicesRes.status === 200 && invoicesRes.data.invoices.length >= 1, 'B2B tax invoices list retrieved');

    const downloadInvRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/partner/invoices/${invoicesRes.data.invoices[0].id}/download`, method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(downloadInvRes.status === 200 && downloadInvRes.data.invoice.invoiceNumber, 'B2B tax invoice data downloadable');

    // Reviews & Reply
    const reviewsRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/reviews', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(reviewsRes.status === 200 && reviewsRes.data.reviews.length >= 1, 'Customer reviews retrieved');

    const replyRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/partner/reviews/${reviewsRes.data.reviews[0].id}/reply`, method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { reply: 'Thank you for choosing Apex Home Solutions! We appreciate your trust.' });
    assert(replyRes.status === 200 && replyRes.data.review.partnerReply, 'Partner reply to customer review posted');

    // Training & Inventory
    const trainingRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/training', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(trainingRes.status === 200 && trainingRes.data.training.length >= 3, 'Mandatory training courses verified');

    const inventoryRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/inventory', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(inventoryRes.status === 200 && inventoryRes.data.inventory.length >= 4, 'Inventory catalog verified');

    // Support Tickets
    const supportRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/support', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(supportRes.status === 200 && supportRes.data.tickets.length >= 1, 'Support tickets thread retrieved');

    const createTicketRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/support/tickets', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      category: 'Dispatch & Slot Allocation',
      subject: 'Surge dispatch support request',
      message: 'Standby technicians ready for evening peak.',
      priority: 'High'
    });
    assert(createTicketRes.status === 201 && createTicketRes.data.ticket.id, 'New support ticket logged');

    // Activity Logs
    const activityRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/activity', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(activityRes.status === 200 && activityRes.data.logs.length >= 5, 'Activity audit trail recorded events');

    // Settings
    const settingsRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/settings', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(settingsRes.status === 200 && settingsRes.data.settings.businessName, 'Business settings retrieved');

    // -------------------------------------------------------------
    // SUITE 8: Multi-Step Onboarding Flow & Draft Progress
    // -------------------------------------------------------------
    console.log('\n[SUITE 8] Multi-Step Onboarding Flow & Draft Progress...');
    // Login as Draft Partner (PTR-90148)
    const draftLogin = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { emailOrPhone: 'karthik@southernhome.in', password: 'Partner@2026' });
    assert(draftLogin.status === 200 && draftLogin.data.partner.status === 'Draft', 'Draft partner authenticated');
    const draftToken = draftLogin.data.token;

    // Check onboarding status
    const draftStatus = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/onboarding/status', method: 'GET',
      headers: { 'Authorization': `Bearer ${draftToken}` }
    });
    assert(draftStatus.status === 200 && draftStatus.data.onboarding.state === 'Draft', 'Onboarding status retrieved for draft partner');
    assert(draftStatus.data.onboarding.missingInfo.length > 0, 'Missing information identified for draft');

    // Save draft progress
    const saveDraftRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/onboarding/draft', method: 'POST',
      headers: { 'Authorization': `Bearer ${draftToken}`, 'Content-Type': 'application/json' }
    }, {
      panNumber: 'AABCS9912K',
      gstNumber: '29AABCS9912K1Z5',
      coverageZones: ['Koramangala', 'HSR Layout', 'Indiranagar'],
      teamSize: '6-15 professionals',
      settlementAccount: {
        bankName: 'HDFC Bank Ltd',
        accountNumber: '5020008492019',
        ifscCode: 'HDFC0000001'
      }
    });
    assert(saveDraftRes.status === 200 && saveDraftRes.data.success === true, 'Saved onboarding draft progress with updated fields');
    assert(saveDraftRes.data.onboarding.progress >= 50, 'Draft progress recalculated dynamically');

    // Submit complete onboarding packet -> changes state to Under Review
    const submitOnboardingRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/onboarding/submit', method: 'POST',
      headers: { 'Authorization': `Bearer ${draftToken}`, 'Content-Type': 'application/json' }
    }, {
      businessName: 'Southern Home Care LLP',
      businessType: 'LLP',
      ownerName: 'Karthik Rao',
      email: 'karthik@southernhome.in',
      phone: '+91 98450 11223',
      registeredAddress: '12, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038',
      serviceCategories: ['AC Repair & Servicing', 'Washing Machine Repair'],
      coverageZones: ['Koramangala', 'HSR Layout', 'Indiranagar'],
      panNumber: 'AABCS9912K',
      gstNumber: '29AABCS9912K1Z5',
      settlementAccount: {
        bankName: 'HDFC Bank Ltd',
        accountNumber: '5020008492019',
        ifscCode: 'HDFC0000001'
      }
    });
    assert(submitOnboardingRes.status === 200 && submitOnboardingRes.data.status === 'Under Review', 'Onboarding packet submitted; status transitioned to Under Review');

    // Login as Changes Requested Partner (PTR-90146)
    const changesReqLogin = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { emailOrPhone: 'ananya@metropro.in', password: 'Partner@2026' });
    assert(changesReqLogin.status === 200 && changesReqLogin.data.partner.status === 'Changes Requested', 'Changes Requested partner authenticated');
    const changesToken = changesReqLogin.data.token;

    // View required corrections
    const changesStatus = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/onboarding/status', method: 'GET',
      headers: { 'Authorization': `Bearer ${changesToken}` }
    });
    assert(changesStatus.data.onboarding.requiredCorrections.length > 0, 'Required corrections listed for Changes Requested partner');

    // Submit corrections
    const correctionsRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/onboarding/corrections', method: 'POST',
      headers: { 'Authorization': `Bearer ${changesToken}`, 'Content-Type': 'application/json' }
    }, {
      correctedFields: { gstNumber: '27AABCM8821B1Z2' },
      correctionNotes: 'Re-uploaded 300dpi certified GSTIN certificate'
    });
    assert(correctionsRes.status === 200 && correctionsRes.data.status === 'Under Review', 'Corrections submitted; partner moved back to Under Review');

    // -------------------------------------------------------------
    // SUITE 9: Suspended Partner & Operational Privilege Protection
    // -------------------------------------------------------------
    console.log('\n[SUITE 9] Suspended Partner & Operational Privilege Protection...');
    // Login as Suspended Partner (PTR-90147)
    const suspendedLogin = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { emailOrPhone: 'ramesh@safeshield.in', password: 'Partner@2026' });
    assert(suspendedLogin.status === 200 && suspendedLogin.data.partner.status === 'Suspended', 'Suspended partner receives authenticated session with clear state');
    assert(suspendedLogin.data.partner.permittedSupportAccess === true, 'Suspended partner flagged for permitted support access');
    assert(suspendedLogin.data.partner.suspensionReason.length > 0, 'Suspension reason clearly explained');
    const suspendedToken = suspendedLogin.data.token;

    // Suspended partner accesses Support Desk -> Allowed (HTTP 200)
    const suspendedSupport = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/support', method: 'GET',
      headers: { 'Authorization': `Bearer ${suspendedToken}` }
    });
    assert(suspendedSupport.status === 200, 'Suspended partner permitted access to Support Desk');

    // Suspended partner attempts operational assignment -> Blocked (HTTP 403)
    const suspendedAssign = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings/ORD-9845/assign', method: 'POST',
      headers: { 'Authorization': `Bearer ${suspendedToken}`, 'Content-Type': 'application/json' }
    }, { professionalId: 'PRO-8841' });
    assert(suspendedAssign.status === 403, 'Suspended partner blocked from operational booking dispatch (HTTP 403)');
    assert(suspendedAssign.data.error.includes('revoked'), 'Clear operational revocation error message');

    // Suspended partner attempts to add team members -> Blocked (HTTP 403)
    const suspendedAddTeam = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/team', method: 'POST',
      headers: { 'Authorization': `Bearer ${suspendedToken}`, 'Content-Type': 'application/json' }
    }, { name: 'New Tech', phone: '+91 99999 11111' });
    assert(suspendedAddTeam.status === 403, 'Suspended partner blocked from team management (HTTP 403)');

    // -------------------------------------------------------------
    // SUITE 10: Dynamic 15 Performance Metrics & Filtering
    // -------------------------------------------------------------
    console.log('\n[SUITE 10] Dynamic 15 Performance Metrics & Filtering...');
    const summaryRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/dashboard-summary', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    if (summaryRes.status !== 200) {
      console.log('SUMMARY RES ERROR:', summaryRes.status, summaryRes.data);
    }
    assert(summaryRes.status === 200, 'Dashboard summary endpoint returned HTTP 200');
    const m = summaryRes.data?.metrics;
    assert(typeof m.todayBookings === 'number', 'Metric 1: todayBookings calculated');
    assert(typeof m.upcomingBookings === 'number', 'Metric 2: upcomingBookings calculated');
    assert(typeof m.ongoingBookings === 'number', 'Metric 3: ongoingBookings calculated');
    assert(typeof m.unassignedBookings === 'number', 'Metric 4: unassignedBookings calculated');
    assert(typeof m.completedBookings === 'number', 'Metric 5: completedBookings calculated');
    assert(typeof m.cancelledBookings === 'number', 'Metric 6: cancelledBookings calculated');
    assert(typeof m.activeProfessionals === 'number', 'Metric 7: activeProfessionals calculated');
    assert(typeof m.professionalsAvailableToday === 'number', 'Metric 8: professionalsAvailableToday calculated');
    assert(typeof m.grossBookingValue === 'number', 'Metric 9: grossBookingValue calculated');
    assert(typeof m.platformDeductions === 'number', 'Metric 10: platformDeductions calculated');
    assert(typeof m.netBusinessEarnings === 'number', 'Metric 11: netBusinessEarnings calculated');
    assert(typeof m.pendingSettlementAmount === 'number', 'Metric 12: pendingSettlementAmount calculated');
    assert(typeof m.settledAmount === 'number', 'Metric 13: settledAmount calculated');
    assert(typeof m.openDisputes === 'number', 'Metric 14: openDisputes calculated');
    assert(typeof m.averageRating !== 'undefined', 'Metric 15: averageRating calculated');
    assert(m.netBusinessEarnings === m.grossBookingValue - m.platformDeductions, 'Net business earnings accurately separates take-home from gross booking value');

    // Zero-denominator safe growth
    assert(m.growth && typeof m.growth.grossBookingValueGrowth === 'string', 'Zero denominator growth comparison safe');

    // Queues linked to listings
    const queues = summaryRes.data.queues;
    assert(Array.isArray(queues.assignmentQueue), 'Assignment queue returned');
    assert(Array.isArray(queues.expiringDocuments), 'Expiring documents alert queue returned');
    assert(Array.isArray(queues.trainingAlerts), 'Training alerts queue returned');
    assert(Array.isArray(queues.lowStockAlerts), 'Low stock alerts queue returned');

    // Filtered query
    const filteredSummary = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/dashboard-summary?city=Mumbai&dateRange=all', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(filteredSummary.status === 200 && filteredSummary.data.metrics.grossBookingValue >= 0, 'City-filtered metrics returned successfully');

    // -------------------------------------------------------------
    // SUITE 11: Booking Management & Exception Requests
    // -------------------------------------------------------------
    console.log('\n[SUITE 11] Booking Management & Exception Requests...');
    // Address masking for Read-only Staff
    const readOnlyDetail = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings/ORD-9841', method: 'GET',
      headers: { 'Authorization': `Bearer ${analystToken}` }
    });
    assert(readOnlyDetail.status === 200, 'Read-only staff can view booking detail');
    assert(readOnlyDetail.data.booking.isAddressRestricted === true, 'Service address masked for read-only staff');

    // Full address for Business Owner
    const ownerDetail = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings/ORD-9841', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(ownerDetail.data.booking.isAddressRestricted === false, 'Full service address accessible to operational owner');

    // Request Rescheduling
    const reschRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings/ORD-9841/reschedule-request', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      proposedSlot: 'Tomorrow, 11:00 AM - 01:00 PM',
      reason: 'Customer requested evening slot shift due to building water outage'
    });
    assert(reschRes.status === 200 && reschRes.data.rescheduleRequest.status === 'Pending Admin Approval', 'Rescheduling request submitted under platform admin policy');

    // Request Cancellation with Policy Fee
    const cancelReqRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings/ORD-9841/cancel-request', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      reason: 'Customer vehicle breakdown and unavailable at premises',
      cancellationType: 'Customer Unreachable'
    });
    assert(cancelReqRes.status === 200 && cancelReqRes.data.cancellationRequest.policyFee === 150, 'Cancellation request logged with platform policy fee');
    assert(cancelReqRes.data.cancellationRequest.status === 'Pending Admin Approval', 'Cancellation request routed to platform admin approval');

    // -------------------------------------------------------------
    // SUITE 12: Audited Manual Completion Override
    // -------------------------------------------------------------
    console.log('\n[SUITE 12] Audited Manual Completion Override...');
    // Dispatcher attempts completion override -> Blocked HTTP 403
    const dispatcherOverride = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings/ORD-9841/completion-override', method: 'POST',
      headers: { 'Authorization': `Bearer ${dispatcherToken}`, 'Content-Type': 'application/json' }
    }, { justification: 'Technician phone battery died while completing the service.' });
    assert(dispatcherOverride.status === 403, 'Dispatcher blocked from completion override (HTTP 403)');

    // Short justification (< 15 chars) -> Blocked HTTP 400
    const shortJustification = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings/ORD-9841/completion-override', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { justification: 'Done work' });
    assert(shortJustification.status === 400 && shortJustification.data.error.includes('minimum 15 characters'), 'Short override justification rejected (HTTP 400)');

    // Valid override by Owner
    const validOverride = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings/ORD-9841/completion-override', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { justification: 'Customer confirmed job completion on phone; technician app network disconnected.' });
    assert(validOverride.status === 200 && validOverride.data.booking.status === 'Completed', 'Owner performed audited manual completion override');
    assert(validOverride.data.booking.completionAudit.auditId.startsWith('AUD-OVR-'), 'Audit ID generated and logged in completion record');

    // -------------------------------------------------------------
    // SUITE 13: Assignment Engine & 30-min Travel Buffer Overlap Conflict
    // -------------------------------------------------------------
    console.log('\n[SUITE 13] Assignment Engine & 30-min Travel Buffer Overlap Conflict...');
    // Booking ORD-9845 (17:30 - 19:00) was previously assigned to PRO-8841 in Suite 5.
    // Attempt to assign ORD-9842 (15:30 - 17:00, overlapping within 30-min buffer) to PRO-8841 -> 409 Conflict with alternative pros
    const overlapAssign = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings/ORD-9842/assign', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { professionalId: 'PRO-8841' });
    assert(overlapAssign.status === 409 && overlapAssign.data?.conflict === true, 'Overlapping appointment blocked with HTTP 409 Conflict');
    assert(overlapAssign.data.conflictDetails.bufferMinutes === 30, '30-minute buffer travel window verified in conflict analysis');
    assert(Array.isArray(overlapAssign.data.alternativeEligibleProfessionals) && overlapAssign.data.alternativeEligibleProfessionals.length > 0, 'Server suggested alternative eligible professionals without conflict');

    // Assign ORD-9842 to eligible alternative pro
    const altProId = overlapAssign.data.alternativeEligibleProfessionals[0].id;
    const assignAlt = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings/ORD-9842/assign', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { professionalId: altProId });
    assert(assignAlt.status === 200, `Successfully assigned ORD-9842 to alternative eligible technician ${altProId}`);

    // Reassignment with reason creates audit history and notification
    const reassignRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings/ORD-9842/assign', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { professionalId: 'PRO-8850', reason: 'Technician rebalance for evening route optimization' });
    assert(reassignRes.status === 200, 'Booking ORD-9842 reassigned to PRO-8850');
    assert(reassignRes.data.booking.reassignmentHistory.length > 0, 'Reassignment audit history preserved on booking');
    assert(reassignRes.data.booking.reassignmentHistory[0].reason.includes('route optimization'), 'Reassignment reason recorded');

    // -------------------------------------------------------------
    // SUITE 14: Team Management & Protection
    // -------------------------------------------------------------
    console.log('\n[SUITE 14] Team Management & Controlled Association...');
    // Propose candidate
    const proposeRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/team/propose', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      name: 'Ganesh Shinde',
      phone: '+91 98200 44556',
      trade: 'Refrigerator Specialist',
      skills: ['Double Door Inverter Fridge', 'Compressor Replacement']
    });
    assert(proposeRes.status === 201 && proposeRes.data.professional.status === 'Pending Platform Verification', 'Technician candidate proposed for platform background verification');

    // Controlled linking consent (prevents phone number claiming)
    const linkRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/team/link-existing', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { phone: '+91 98111 22334' });
    assert(linkRes.status === 200 && linkRes.data.consentRequest.invitationToken.startsWith('LNK-'), 'Controlled linking generates consent token without automatic claim');
    assert(linkRes.data.consentRequest.status === 'Pending Professional Consent', 'Linking state set to Pending Professional Consent');

    // Request skill enhancement
    const skillReqRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/team/PRO-8841/request-skill-change', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      requestedSkills: ['Variable Refrigerant Flow (VRF) Systems'],
      justification: 'Completed 60-hour advanced VRF manufacturer training certification.'
    });
    assert(skillReqRes.status === 200 && skillReqRes.data.skillRequest.status === 'Pending Platform Review', 'Skill enhancement request submitted to platform certification desk');

    // Update availability
    const availRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/team/PRO-8841/availability', method: 'PUT',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      operatingHours: '08:30 - 19:30',
      attendanceToday: 'Present (Available)',
      leaveDates: ['2026-11-01', '2026-11-02']
    });
    assert(availRes.status === 200 && availRes.data.professional.operatingHours === '08:30 - 19:30', 'Technician operational availability schedule updated');

    // Attempt to remove association for technician with active assignments -> Blocked HTTP 400
    const blockedRemoval = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/team/PRO-8841/remove-association', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { reason: 'Technician resigned from agency' });
    assert(blockedRemoval.status === 400 && blockedRemoval.data.hasActiveAssignments === true, 'Removal blocked when technician has active job assignments (HTTP 400)');
    assert(blockedRemoval.data.activeAssignments.length > 0, 'Active assignment IDs returned for required rebalancing');

    // Remove association for technician with NO active assignments (e.g. PRO-8843)
    const safeRemoval = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/team/PRO-8843/remove-association', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { reason: 'Contract period completed by mutual consent' });
    assert(safeRemoval.status === 200 && safeRemoval.data.success === true, 'Successfully ended association for technician with zero active assignments');
    assert(safeRemoval.data.message.includes('platform account was preserved'), 'Platform account and historical ownership preserved on association end');

    // -------------------------------------------------------------
    // SUITE 15: Services, Packages, Pricing & Server-Side Coverage
    // -------------------------------------------------------------
    console.log('\n[SUITE 15] Services, Packages, Pricing & Server-Side Coverage...');
    // 1. Fetch approved services catalogue
    const s15ServicesRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/services', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s15ServicesRes.status === 200 && Array.isArray(s15ServicesRes.data.services), 'Partner retrieved platform-approved service catalogue');
    assert(s15ServicesRes.data.services.length >= 3, 'Multiple approved services returned');
    const sampleService = s15ServicesRes.data.services[0];
    assert(sampleService.pricingPaise > 0 && sampleService.price === sampleService.pricingPaise / 100, 'Service pricing verified in both integer paise and standard INR');
    assert(sampleService.durationMinutes > 0, 'Service duration verified in minutes');
    assert(sampleService.commissionRate === '18%', 'Platform commission rate verified at 18%');
    assert(sampleService.businessParticipationStatus === 'Approved & Active', 'Initial business participation status is Approved & Active');

    // 2. Request additional category
    const catReqRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/services/request-category', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      requestedCategory: 'Commercial Ventilation & Industrial Chillers',
      rationale: 'Fleet onboarded 2 certified VRF/industrial chiller engineers.'
    });
    assert(catReqRes.status === 201 && catReqRes.data.categoryRequest.status === 'Pending Platform Review', 'Category expansion request submitted with Pending Platform Review status');
    assert(catReqRes.data.categoryRequest.partnerId === 'PTR-90142', 'Category request tied to partner entity');

    // 3. Pause participation
    const pauseRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/services/SRV-AC-001/toggle-participation', method: 'PUT',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { isParticipating: false, reason: 'Technicians currently undergoing advanced R32 safety recertification.' });
    assert(pauseRes.status === 200 && pauseRes.data.service.businessParticipationStatus === 'Paused by Partner', 'Participation paused by partner with explicit reason');

    // 4. Resume participation
    const resumeRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/services/SRV-AC-001/toggle-participation', method: 'PUT',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { isParticipating: true });
    assert(resumeRes.status === 200 && resumeRes.data.service.businessParticipationStatus === 'Approved & Active', 'Participation resumed back to Approved & Active');

    // 5. Security Guard: Prevent editing global service catalogue price (HTTP 403)
    const editGlobalRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/services/SRV-AC-001/global-price', method: 'PUT',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { price: 1599 });
    assert(editGlobalRes.status === 403, 'Direct global catalogue price modification blocked with HTTP 403 Forbidden');
    assert(editGlobalRes.data.error.includes('Forbidden'), 'Clear forbidden error message returned for global price edits');

    // 6. Coverage, working hours & holidays
    const s15CoverageRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/coverage', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s15CoverageRes.status === 200 && s15CoverageRes.data.city === 'Mumbai', 'Coverage data retrieved for operating city');
    assert(s15CoverageRes.data.coverageZones.includes('Bandra West'), 'Active coverage zones verified');
    assert(s15CoverageRes.data.pincodes.includes('400050'), 'Active postal codes verified');
    assert(s15CoverageRes.data.workingHours === '08:00 - 20:00', 'Business working hours verified');
    assert(Array.isArray(s15CoverageRes.data.holidays) && s15CoverageRes.data.holidays.length > 0, 'Business declared holidays verified');
    assert(s15CoverageRes.data.capacityConfig.maxConcurrentJobs === 12, 'Initial concurrent capacity limit verified');

    // 7. Request coverage expansion
    const covExpRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/coverage/request-expansion', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      requestedCity: 'Mumbai',
      requestedZone: 'Juhu Scheme & Vile Parle West',
      requestedPincodes: ['400049', '400056'],
      vehicleCapacity: 4
    });
    assert(covExpRes.status === 201 && covExpRes.data.coverageRequest.status === 'Pending Platform Review', 'Coverage expansion request recorded with Pending Platform Review status');

    // 8. Configure authorised capacity
    const capRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/coverage/capacity', method: 'PUT',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { maxConcurrentJobs: 16, dailyJobCap: 45 });
    assert(capRes.status === 200 && capRes.data.capacityConfig.maxConcurrentJobs === 16, 'Authorised concurrent job capacity updated to 16');

    // 9. Server-side serviceability validation (Serviceable check)
    const validPincodeRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/coverage/validate-serviceability', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { pincode: '400050', serviceCategory: 'ac-appliances', bookingTime: '10:30' });
    assert(validPincodeRes.status === 200 && validPincodeRes.data.serviceable === true, 'Server-side serviceability confirmed for serviceable postal code 400050');
    assert(validPincodeRes.data.matchedZone === 'Bandra West', 'Matched zone correctly identified');

    // 10. Server-side serviceability validation (Unserviceable check)
    const invalidPincodeRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/coverage/validate-serviceability', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { pincode: '560001', serviceCategory: 'ac-appliances', bookingTime: '10:30' });
    assert(invalidPincodeRes.status === 200 && invalidPincodeRes.data.serviceable === false, 'Server-side serviceability rejected for out-of-zone postal code 560001');
    assert(invalidPincodeRes.data.reason.includes('outside active coverage'), 'Reason specified for non-serviceability');

    // -------------------------------------------------------------
    // SUITE 16: Earnings, Settlements & Dual Financial Models
    // -------------------------------------------------------------
    console.log('\n[SUITE 16] Earnings, Settlements & Dual Financial Models...');
    // 1. Mode A Partner (PTR-90142 - ThroughBusiness)
    const earningsRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/earnings', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(earningsRes.status === 200, 'Earnings summary retrieved');
    assert(earningsRes.data.settlementMode === 'ThroughBusiness', 'Partner A operates in Mode A: ThroughBusiness');
    assert(earningsRes.data.currency === 'INR' && earningsRes.data.minorUnit === 'paise', 'Currency is INR with integer minor paise units');
    assert(earningsRes.data.summary.antiDoubleCountingRule.includes('Exclusive Allocation'), 'Anti-double-counting policy verified');
    assert(earningsRes.data.summary.grossTurnoverPaise > 0, 'Gross turnover in paise is greater than 0');
    assert(earningsRes.data.summary.grossTurnoverInr === earningsRes.data.summary.grossTurnoverPaise / 100, 'Gross turnover matches integer paise / 100');
    assert(earningsRes.data.summary.netBusinessEntitlementInr > 0, 'Net business entitlement calculated');

    // 2. Itemized earnings ledger
    const ledgerRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/earnings/ledger', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(ledgerRes.status === 200 && Array.isArray(ledgerRes.data.ledger), 'Itemized financial ledger retrieved');
    assert(ledgerRes.data.ledger.length >= 3, 'Multiple ledger line items returned');
    const firstEntry = ledgerRes.data.ledger[0];
    assert(firstEntry.bookingValuePaise > 0, 'Booking value recorded in integer paise');
    assert(firstEntry.taxes.cgstRate === '9%' && firstEntry.taxes.sgstRate === '9%', '18% GST (9% CGST + 9% SGST) verified on ledger items');
    assert(firstEntry.discountFundingSource === 'Platform' || firstEntry.discountFundingSource === 'None', 'Discount funding source attributed');
    assert(firstEntry.platformCommissionPaise > 0, 'Platform commission tracked');
    assert(firstEntry.netEntitlementInr > 0, 'Net entitlement calculated without double counting');

    // 3. Settlement lifecycle & bank records
    const settlRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/settlements', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(settlRes.status === 200 && Array.isArray(settlRes.data.settlements), 'Settlements list retrieved');
    const statuses = settlRes.data.settlements.map(s => s.status);
    assert(statuses.includes('Settled'), 'Lifecycle state Settled verified');
    assert(statuses.includes('Processing'), 'Lifecycle state Processing verified');
    assert(statuses.includes('Pending'), 'Lifecycle state Pending verified');
    assert(statuses.includes('Failed'), 'Lifecycle state Failed verified');

    const settledItem = settlRes.data.settlements.find(s => s.status === 'Settled');
    assert(settledItem.bankUtr && settledItem.bankUtr.startsWith('UTR-'), 'Settled payout includes verified bank UTR number');

    const failedItem = settlRes.data.settlements.find(s => s.status === 'Failed');
    assert(failedItem.failureReason && failedItem.failureReason.length > 0, 'Failed settlement includes failure diagnosis reason');

    // 4. Downloadable settlement statement
    const stmtRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/settlements/SETTL-2026-W42/statement', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(stmtRes.status === 200 && stmtRes.data.statement.settlementId === 'SETTL-2026-W42', 'Verified settlement statement downloaded');
    assert(stmtRes.data.statement.settlementModeSnapshot === 'ThroughBusiness', 'Settlement mode snapshot preserved');

    // 5. Request settlement correction
    const corrRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/settlements/SETTL-2026-W42/request-correction', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { queryReason: 'Discrepancy in commercial TDS withholding on booking ORD-9811', disputedAmount: 450 });
    assert(corrRes.status === 201 && corrRes.data.correctionRequest.status === 'Pending Finance Audit', 'Settlement correction dispute filed with Pending Finance Audit status');

    // 6. Security Guard: Prevent partner from directly marking platform payout as paid (HTTP 403)
    const markPaidRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/settlements/SETTL-2026-W42/mark-paid', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {});
    assert(markPaidRes.status === 403, 'Directly marking platform payout as paid blocked with HTTP 403 Forbidden');
    assert(markPaidRes.data.error.includes('Forbidden'), 'Clear forbidden guard message returned');

    // 7. Mode B Partner (PTR-90143 - DirectToProfessional)
    const modeBEarnings = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/earnings', method: 'GET',
      headers: { 'Authorization': `Bearer ${partnerBToken}` }
    });
    assert(modeBEarnings.status === 200 && modeBEarnings.data.settlementMode === 'DirectToProfessional', 'Partner B confirmed in Mode B: DirectToProfessional');
    assert(modeBEarnings.data.partnerShareRate === '15%', 'Mode B business override share configured at 15%');
    assert(modeBEarnings.data.summary.antiDoubleCountingRule.includes('Exclusive Allocation'), 'Mode B anti-double counting guarantee verified');

    // -------------------------------------------------------------
    // SUITE 17: Bank Details, Privacy & Security Controls
    // -------------------------------------------------------------
    console.log('\n[SUITE 17] Bank Details, Privacy & Security Controls...');
    // 1. Masked bank account verification (no plaintext bank account or secrets leaked)
    const meRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/me', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(meRes.status === 200, 'Partner profile retrieved');
    assert(meRes.data.partner.settlementAccount.accountNumber.includes('••••••••'), 'Bank account number is securely masked in profile');

    // 2. Security Guard: Analyst cannot request bank changes (RBAC HTTP 403)
    const analystBankReq = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/settlements/bank-change-request', method: 'POST',
      headers: { 'Authorization': `Bearer ${analystToken}`, 'Content-Type': 'application/json' }
    }, {
      newBankName: 'State Bank of India',
      newAccountNumber: '11223344556677',
      newIfscCode: 'SBIN0001234'
    });
    assert(analystBankReq.status === 403, 'Unauthorized staff blocked from requesting bank details changes (HTTP 403)');
    assert(analystBankReq.data.error.includes('requesting_bank_changes'), 'RBAC error references requesting_bank_changes permission');

    // 3. Authorized Business Owner requests bank change
    const ownerBankReq = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/settlements/bank-change-request', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      newBankName: 'HDFC Bank Ltd',
      newAccountHolderName: 'Apex Home Solutions LLP',
      newAccountNumber: '50200012345678',
      newIfscCode: 'HDFC0000060',
      newAccountType: 'Current Corporate Account'
    });
    assert(ownerBankReq.status === 200 && ownerBankReq.data.changeRequest.status === 'Under Verification', 'Bank change request created in Under Verification status');
    assert(ownerBankReq.data.changeRequest.newAccountNumberMasked === '••••••••5678', 'New account number stored and returned masked');
    assert(ownerBankReq.data.notice.includes('Pending payouts will continue'), 'Pending payouts guarantee: not immediately redirected to newly submitted bank details');

    // 4. Activity log tracks bank change audit
    const s17ActivityRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/activity', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s17ActivityRes.status === 200 && Array.isArray(s17ActivityRes.data.logs), 'Activity logs retrieved');
    const bankLog = s17ActivityRes.data.logs.find(l => l.action === 'BANK_CHANGE_REQUESTED');
    assert(bankLog && !bankLog.details.includes('50200012345678'), 'Audit log records bank change request without leaking full unmasked account number');

    // -------------------------------------------------------------
    // SUITE 18: Refunds, Traceable Disputes & Arbitration Thread
    // -------------------------------------------------------------
    console.log('\n[SUITE 18] Refunds, Traceable Disputes & Arbitration Thread...');
    // 1. Get existing disputes
    const disputesRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/refunds-disputes', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(disputesRes.status === 200 && Array.isArray(disputesRes.data.disputes), 'Disputes list retrieved');
    assert(disputesRes.data.disputes.length >= 2, 'Existing customer disputes found');
    const existingDispute = disputesRes.data.disputes.find(d => d.financialAdjustment) || disputesRes.data.disputes[0];
    assert(existingDispute.issueType && existingDispute.owner, 'Dispute includes issue type and assigned platform desk owner');

    // 2. Get dispute detail with chronological timeline and traceable adjustment
    const disputeDetailRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/partner/refunds-disputes/${existingDispute.id}`, method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(disputeDetailRes.status === 200 && disputeDetailRes.data.dispute.timeline.length >= 2, 'Dispute detail includes chronological timeline');
    assert(disputeDetailRes.data.dispute.financialAdjustment !== null, 'Dispute includes traceable financial adjustment');
    assert(disputeDetailRes.data.dispute.financialAdjustment.settledIn.startsWith('SETTL-'), 'Adjustment references settlement cycle rather than rewriting history');

    // 3. Submit new dispute
    const newDisputeRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/refunds-disputes', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      bookingId: 'ORD-9842',
      issueType: 'Damage Claim',
      claimAmount: 650,
      reason: 'Customer alleging scratching of refrigerator door which was documented as pre-existing before job start.',
      evidence: ['pre_service_inspection_photo.jpg', 'signed_customer_checklist.pdf']
    });
    assert(newDisputeRes.status === 201 && newDisputeRes.data.dispute.id.startsWith('DSP-'), 'New dispute submitted with generated DSP reference');
    assert(newDisputeRes.data.dispute.issueType === 'Damage Claim', 'Issue type correctly classified');
    assert(newDisputeRes.data.dispute.evidence.length === 2, 'Supporting evidence attachments recorded');

    // 4. Respond to platform questions in interactive dispute thread
    const threadReplyRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/partner/refunds-disputes/${existingDispute.id}/messages`, method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      message: 'Technician on-site inspection completed. High-definition images uploaded.',
      evidence: 're_inspection_timestamped_hd.jpg'
    });
    assert(threadReplyRes.status === 200, 'Response recorded in dispute arbitration thread');
    const updatedMessages = threadReplyRes.data.dispute.messages;
    assert(updatedMessages[updatedMessages.length - 1].message.includes('Technician on-site inspection completed'), 'Partner message appended to thread');

    // 5. Policy Guard: Partners cannot unilaterally approve customer refunds (HTTP 403)
    const approveRefundRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/refunds/ORD-9821/approve', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {});
    assert(approveRefundRes.status === 403, 'Partner unilaterally approving customer refund blocked with HTTP 403 Forbidden');
    assert(approveRefundRes.data.error.includes('Forbidden'), 'Refund guard policy message returned');

    // -------------------------------------------------------------
    // SUITE 19: Performance Analytics, Reviews & Platform Policy Guards
    // -------------------------------------------------------------
    console.log('\n[SUITE 19] Performance Analytics, Reviews & Platform Policy Guards...');
    // 1. Performance metrics & Zero Fabrication guarantee
    const perfRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/reports/performance', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(perfRes.status === 200 && perfRes.data.performanceSummary.completionRate === '98.6%', 'Completion rate verified at 98.6%');
    assert(perfRes.data.performanceSummary.cancellationRate === '1.4%', 'Cancellation rate verified at 1.4%');
    assert(perfRes.data.performanceSummary.onTimeRate === '99.1%', 'On-time arrival punctuality verified');
    assert(perfRes.data.performanceSummary.revisitRate === '42.8%', '90-day customer revisit rate verified at 42.8%');
    assert(perfRes.data.performanceSummary.professionalUtilisation === '86.4%', 'Professional fleet utilisation verified at 86.4%');
    assert(perfRes.data.zeroFabricationNotice.includes('Authenticity Guarantee'), 'Authenticity guarantee confirmed: zero algorithmic fabrication');

    // 2. Methodology definitions & minimum sample sizes
    assert(perfRes.data.methodologyNotes.completionRate.includes('Minimum sample size: 20 jobs'), 'Completion rate sample size defined (20 jobs)');
    assert(perfRes.data.methodologyNotes.onTimePerformance.includes('Zero fabrication policy applies'), 'On-time performance telemetry note confirmed');

    // 3. Professional comparisons table with sample size rules
    assert(Array.isArray(perfRes.data.professionalComparisons), 'Professional comparisons table returned');
    const certifiedPro = perfRes.data.professionalComparisons.find(p => p.id === 'PRO-101');
    assert(certifiedPro && certifiedPro.sampleSizeMet === true && certifiedPro.jobsCompleted >= 10, 'Technician with ≥ 10 jobs certified for benchmarking');

    const probationaryPro = perfRes.data.professionalComparisons.find(p => p.id === 'PRO-105');
    assert(probationaryPro && probationaryPro.sampleSizeMet === false && probationaryPro.jobsCompleted < 10, 'Technician with < 10 jobs flagged with sampleSizeMet: false');

    // 4. Service and geographic breakdowns
    assert(Array.isArray(perfRes.data.serviceBreakdown) && perfRes.data.serviceBreakdown.length >= 3, 'Service category breakdown returned');
    assert(Array.isArray(perfRes.data.cityZoneBreakdown) && perfRes.data.cityZoneBreakdown.length >= 3, 'City & zone geographic breakdown returned');

    // 5. Read reviews
    const s19ReviewsRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/reviews', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s19ReviewsRes.status === 200 && Array.isArray(s19ReviewsRes.data.reviews), 'Partner retrieved customer reviews');
    assert(s19ReviewsRes.data.reviews.length >= 3, 'At least 3 customer reviews returned');

    // 6. Post approved business reply to review
    const s19ReplyRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/reviews/REV-902/reply', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { reply: 'Thank you Aditya ji! We are delighted Sunil delivered thorough tile cleaning service.' });
    assert(s19ReplyRes.status === 200 && s19ReplyRes.data.review.partnerReply.includes('delighted Sunil delivered'), 'Official partner management response posted to customer review');

    // 7. Flag abusive or inaccurate review for Trust & Safety moderation
    const flagRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/reviews/REV-903/flag', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      flagCategory: 'Wrong Business',
      reason: 'Review refers to plumbing service which does not belong to our HVAC & appliance agency.',
      evidenceNote: 'Job sheet ORD-9799 confirms AC servicing invoice only'
    });
    assert(flagRes.status === 200 && flagRes.data.review.flaggedForModeration === true, 'Review flagged for Trust & Safety moderation');
    assert(flagRes.data.review.flagDetails.status === 'Pending Platform Trust & Safety Review', 'Flag status set to Pending Platform Trust & Safety Review');

    // 8. Security Guard: Prevent deleting customer reviews (HTTP 403)
    const delReviewRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/reviews/REV-901', method: 'DELETE',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(delReviewRes.status === 403, 'Deleting customer reviews blocked with HTTP 403 Forbidden');
    assert(delReviewRes.data.error.includes('Forbidden: Partners are strictly prohibited from deleting customer reviews'), 'Review deletion prohibited guard message returned');

    // 9. Security Guard: Prevent editing customer star ratings (HTTP 403)
    const editRatingRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/reviews/REV-901/rating', method: 'PUT',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { rating: 5 });
    assert(editRatingRes.status === 403, 'Editing customer review ratings blocked with HTTP 403 Forbidden');
    assert(editRatingRes.data.error.includes('Forbidden: Partners cannot modify customer star ratings'), 'Rating modification prohibited guard message returned');

    // -------------------------------------------------------------
    // SUITE 20: Training & Compliance Workflow & Security Guards
    // -------------------------------------------------------------
    console.log('\n[SUITE 20] Training & Compliance Workflow & Security Guards...');
    const s20TrainingRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/training', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s20TrainingRes.status === 200, 'Training and compliance data retrieved');
    assert(Array.isArray(s20TrainingRes.data.requiredCourses) && s20TrainingRes.data.requiredCourses.length >= 3, 'Required courses listed');
    assert(Array.isArray(s20TrainingRes.data.assignedProfessionals) && s20TrainingRes.data.assignedProfessionals.length >= 2, 'Assigned professionals with certification status returned');
    assert(Array.isArray(s20TrainingRes.data.trainingSessions) && s20TrainingRes.data.trainingSessions.length >= 2, 'Scheduled academy training sessions returned');
    assert(Array.isArray(s20TrainingRes.data.businessDocumentExpiry) && s20TrainingRes.data.businessDocumentExpiry.length >= 2, 'Business document expiry records returned');
    assert(Array.isArray(s20TrainingRes.data.professionalDocumentExpiry) && s20TrainingRes.data.professionalDocumentExpiry.length >= 2, 'Professional document expiry records returned');
    assert(Array.isArray(s20TrainingRes.data.pendingComplianceActions) && s20TrainingRes.data.pendingComplianceActions.length >= 1, 'Pending compliance actions returned');
    assert(Array.isArray(s20TrainingRes.data.operationalRestrictions) && s20TrainingRes.data.operationalRestrictions.length >= 1, 'Operational restrictions (dispatch locks) returned');
    assert(s20TrainingRes.data.selfCertificationNotice.includes('Platform Academy Evaluators'), 'Self-certification restriction policy notice displayed');

    // Partner requests training session
    const s20ReqSessionRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/training/request-session', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      courseId: 'TRN-CRS-01',
      preferredDate: '2026-11-05',
      preferredSlot: 'Morning (09:00 - 13:00)',
      participantCount: 4,
      notes: 'Refresher for newly onboarded technicians'
    });
    assert(s20ReqSessionRes.status === 201 && s20ReqSessionRes.data.sessionRequest.id, 'Partner requested training session');
    assert(s20ReqSessionRes.data.sessionRequest.status === 'Requested', 'Training session request status is Requested');

    // Security Guard: Partners cannot self-certify technicians (HTTP 403)
    const s20CertifyRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/training/courses/TRN-CRS-01/certify', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { professionalId: 'PRO-8841', status: 'Certified' });
    assert(s20CertifyRes.status === 403, 'Partner self-certification blocked with HTTP 403 Forbidden');
    assert(s20CertifyRes.data.error.includes('Forbidden: Business partners cannot grant course completion'), 'Authorised academy workflow guard message returned');

    // -------------------------------------------------------------
    // SUITE 21: Inventory & Supply Orders Management
    // -------------------------------------------------------------
    console.log('\n[SUITE 21] Inventory & Supply Orders Management...');
    const s21InvRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/inventory', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s21InvRes.status === 200 && Array.isArray(s21InvRes.data.items), 'Inventory catalog retrieved');
    assert(s21InvRes.data.items.some(i => i.sku && i.inStock !== undefined), 'Inventory items have SKU and inStock attributes');
    assert(s21InvRes.data.sandboxDisclaimer.includes('Sandbox Simulation Mode'), 'Supply orders labeled as demo sandbox');

    const testItemId = s21InvRes.data.items[0].id;

    // Supply orders list
    const s21OrdersRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/inventory/orders', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s21OrdersRes.status === 200 && Array.isArray(s21OrdersRes.data.orders), 'Supply orders list retrieved');

    // Place new supply order
    const s21NewOrderRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/inventory/orders', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      items: [{ itemId: testItemId, quantity: 5 }],
      deliveryAddress: 'Bandra Central Depot, Plot 18, Hill Road, Mumbai',
      notes: 'Replenishment for weekend maintenance rush'
    });
    assert(s21NewOrderRes.status === 201 && s21NewOrderRes.data.order.orderNumber, 'Supply order placed in sandbox');
    assert(s21NewOrderRes.data.sandboxNotice.includes('Sandbox Simulation Mode'), 'Order response explicitly disclaims real vendor orders');

    // Confirm Goods Received
    const orderToReceive = s21NewOrderRes.data.order.id;
    const s21ReceiveGoodsRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/partner/inventory/orders/${orderToReceive}/goods-received`, method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s21ReceiveGoodsRes.status === 200 && s21ReceiveGoodsRes.data.order.status === 'Goods Received', 'Goods receipt confirmed and order status updated');

    // Duplicate goods receipt blocked
    const s21DupReceiveRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/partner/inventory/orders/${orderToReceive}/goods-received`, method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s21DupReceiveRes.status === 400 && s21DupReceiveRes.data.error.includes('Duplicate receipt rejected'), 'Duplicate goods receipt blocked (HTTP 400)');

    // Allocate stock to professional
    const s21AllocateRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/inventory/allocate', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      itemId: testItemId,
      professionalId: 'PRO-8841',
      quantity: 1,
      purpose: 'Field AC cleaning kit assignment'
    });
    assert(s21AllocateRes.status === 200 && s21AllocateRes.data.success === true, 'Allocated inventory stock to technician');

    // Allocation beyond available quantity blocked
    const s21OverAllocateRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/inventory/allocate', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      itemId: testItemId,
      professionalId: 'PRO-8841',
      quantity: 9999,
      purpose: 'Exorbitant allocation'
    });
    assert(s21OverAllocateRes.status === 400 && s21OverAllocateRes.data.error.includes('Allocation exceeds available quantity'), 'Allocation beyond available quantity blocked (HTTP 400)');

    // Cross-business inventory access prevented
    const s21CrossBusinessRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/inventory/allocate', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      itemId: 'INV-901-01', // belongs to PTR-90143
      professionalId: 'PRO-8841',
      quantity: 1,
      purpose: 'Attempted cross-tenant access'
    });
    assert(s21CrossBusinessRes.status === 404, 'Cross-business inventory access prevented (HTTP 404)');

    // Manual adjustment requires reason (min 5 chars)
    const s21AdjustNoReason = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/inventory/adjust', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { itemId: testItemId, adjustmentQty: 1, reason: '' });
    assert(s21AdjustNoReason.status === 400 && s21AdjustNoReason.data.error.includes('Reason is mandatory'), 'Stock adjustment without reason rejected (HTTP 400)');

    // Prevent negative stock
    const s21NegativeStockRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/inventory/adjust', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { itemId: testItemId, adjustmentQty: -9999, reason: 'Massive deduction test' });
    assert(s21NegativeStockRes.status === 400 && s21NegativeStockRes.data.error.includes('cannot be negative'), 'Negative stock deduction blocked (HTTP 400)');

    // Valid adjustment
    const s21ValidAdjRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/inventory/adjust', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { itemId: testItemId, adjustmentQty: 2, reason: 'Physical recount found 2 extra sealed containers' });
    assert(s21ValidAdjRes.status === 200, 'Valid inventory adjustment recorded');

    // Return inventory from professional
    const s21ReturnRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/inventory/returns', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      itemId: testItemId,
      professionalId: 'PRO-8841',
      quantity: 1,
      condition: 'Good',
      reason: 'Returned surplus container after job completion'
    });
    assert(s21ReturnRes.status === 200, 'Recorded inventory return from professional');

    // Movement history
    const s21MovementsRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/inventory/movements', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s21MovementsRes.status === 200 && Array.isArray(s21MovementsRes.data.movements), 'Inventory movement ledger retrieved');
    assert(s21MovementsRes.data.movements.length >= 3, 'Multiple chronological movement records verified');

    // -------------------------------------------------------------
    // SUITE 22: Support Tickets & Evidence Linking
    // -------------------------------------------------------------
    console.log('\n[SUITE 22] Support Tickets & Evidence Linking...');
    // Create ticket with linked entity and evidence
    const s22CreateTicketRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/support/tickets', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      category: 'Customer Dispute Arbitration',
      priority: 'High',
      subject: 'Doorstep access dispute reconciliation',
      message: 'Customer refused service delivery due to family emergency. Please verify cancellation fee waive-off.',
      linkedEntity: { type: 'Booking', id: 'ORD-9841' },
      evidence: ['Customer_Chat_Log.pdf', 'Security_Gate_Signoff.png']
    });
    assert(s22CreateTicketRes.status === 201 && s22CreateTicketRes.data.ticket.id, 'Support ticket created with linked entity');
    const createdTicketId = s22CreateTicketRes.data.ticket.id;

    // View ticket detail
    const s22TicketDetailRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/partner/support/tickets/${createdTicketId}`, method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s22TicketDetailRes.status === 200 && s22TicketDetailRes.data.ticket.linkedEntity.id === 'ORD-9841', 'Ticket detail contains linked booking reference');
    assert(s22TicketDetailRes.data.ticket.internalStaffNotes === undefined, 'Internal staff notes strictly stripped from ticket response');

    // Add reply to ticket
    const s22ReplyRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/partner/support/tickets/${createdTicketId}/messages`, method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { message: 'We have also contacted building security to confirm gate registry.' });
    assert(s22ReplyRes.status === 200 && s22ReplyRes.data.ticket.messages.length >= 2, 'Message appended to support ticket thread');

    // -------------------------------------------------------------
    // SUITE 23: Notifications Across 8 Mandatory Categories & Outbox
    // -------------------------------------------------------------
    console.log('\n[SUITE 23] Notifications Across 8 Mandatory Categories & Outbox...');
    const s23NotifsRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/notifications', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s23NotifsRes.status === 200 && Array.isArray(s23NotifsRes.data.notifications), 'Notifications list retrieved');
    assert(s23NotifsRes.data.outboxNotice.includes('Local Outbox Delivery'), 'Outbox delivery disclaimer displayed');

    const notifCategories = s23NotifsRes.data.notifications.map(n => n.category);
    assert(notifCategories.includes('New Booking'), 'New Booking notification category verified');
    assert(notifCategories.includes('Reassignment'), 'Reassignment notification category verified');
    assert(notifCategories.includes('Cancellation'), 'Cancellation notification category verified');
    assert(notifCategories.includes('Training Requirement'), 'Training Requirement notification category verified');
    assert(notifCategories.includes('Document Review'), 'Document Review notification category verified');
    assert(notifCategories.includes('Expiry Reminders'), 'Expiry Reminders notification category verified');
    assert(notifCategories.includes('Settlement Updates'), 'Settlement Updates notification category verified');
    assert(notifCategories.includes('Support Replies'), 'Support Replies notification category verified');

    // Mark single notification as read
    const notifToRead = s23NotifsRes.data.notifications[0].id;
    const s23MarkReadRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/partner/notifications/${notifToRead}/read`, method: 'PUT',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s23MarkReadRes.status === 200, 'Mark single notification read succeeded');

    // Mark all notifications as read
    const s23MarkAllRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/notifications/mark-all-read', method: 'PUT',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s23MarkAllRes.status === 200, 'Mark all notifications read succeeded');

    // -------------------------------------------------------------
    // SUITE 24: Documents Vault, File Validation & Safe Filenames
    // -------------------------------------------------------------
    console.log('\n[SUITE 24] Documents Vault, File Validation & Safe Filenames...');
    const s24DocsRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/documents', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s24DocsRes.status === 200 && Array.isArray(s24DocsRes.data.documents), 'Documents vault retrieved');
    assert(s24DocsRes.data.verificationDisclaimer.includes('Uploading does NOT grant immediate approval'), 'Document upload does not imply automatic verification');

    // File validation: Reject disallowed file extension (e.g. .exe)
    const s24BadExtRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/documents/upload', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      docType: 'Maharashtra Municipal Trade License',
      fileName: 'malicious_script.exe',
      fileSize: 1024
    });
    assert(s24BadExtRes.status === 400 && s24BadExtRes.data.error.includes('Only PDF, PNG, and JPEG'), 'Disallowed file extension rejected (HTTP 400)');

    // File validation: Reject oversized file (> 5MB)
    const s24OversizedRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/documents/upload', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      docType: 'Maharashtra Municipal Trade License',
      fileName: 'oversized_document.pdf',
      fileSize: 6 * 1024 * 1024
    });
    assert(s24OversizedRes.status === 400 && s24OversizedRes.data.error.includes('exceeds maximum permitted limit'), 'Oversized document (>5MB) rejected (HTTP 400)');

    // Valid upload: sets status to Under Review
    const s24ValidUploadRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/documents/upload', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      docType: 'Maharashtra Municipal Trade License',
      title: 'Municipal Trade License 2026-2027 Renewal',
      fileName: 'Trade_License_Renewal_2026.pdf',
      fileType: 'application/pdf',
      fileSize: 1845200
    });
    assert(s24ValidUploadRes.status === 201 && s24ValidUploadRes.data.document.status === 'Under Review', 'Uploaded document queued with Under Review status');
    assert(s24ValidUploadRes.data.document.fileName.startsWith('doc_'), 'Safe sanitized filename generated');

    // -------------------------------------------------------------
    // SUITE 25: Reports, CSV Formula Injection & Audit Immutability
    // -------------------------------------------------------------
    console.log('\n[SUITE 25] Reports, CSV Formula Injection & Audit Immutability...');
    // 10-domain reports
    const s25ReportsRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/reports?city=Mumbai&dateRange=mtd', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s25ReportsRes.status === 200 && s25ReportsRes.data.report.bookings, 'Reports domain 1 (Bookings) verified');
    assert(s25ReportsRes.data.report.serviceDemand, 'Reports domain 2 (Service Demand) verified');
    assert(s25ReportsRes.data.report.teamPerformance, 'Reports domain 3 (Team Performance) verified');
    assert(s25ReportsRes.data.report.earnings, 'Reports domain 4 (Earnings) verified');
    assert(s25ReportsRes.data.report.settlements, 'Reports domain 5 (Settlements) verified');
    assert(s25ReportsRes.data.report.deductionsAndDisputes, 'Reports domain 6 (Deductions & Disputes) verified');
    assert(s25ReportsRes.data.report.cancellations, 'Reports domain 7 (Cancellations) verified');
    assert(s25ReportsRes.data.report.ratings, 'Reports domain 8 (Ratings) verified');
    assert(s25ReportsRes.data.report.trainingCompletion, 'Reports domain 9 (Training Completion) verified');
    assert(s25ReportsRes.data.report.inventoryMovements, 'Reports domain 10 (Inventory Movements) verified');

    // CSV export with formula injection protection & masked PII
    const s25CsvRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/reports/export-csv', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s25CsvRes.status === 200, 'CSV export endpoint returned HTTP 200');
    assert(s25CsvRes.raw.includes('Customer Contact (PII Masked)') || s25CsvRes.raw.includes('•••••'), 'Customer PII masked in CSV export');
    assert(s25CsvRes.raw.includes('Timezone: Asia/Kolkata'), 'Timezone Asia/Kolkata explicitly labeled in CSV header');
    assert(s25CsvRes.raw.includes('Currency: INR'), 'Currency INR explicitly labeled in CSV header');

    // Settings: immediate edits vs platform-approval-required fields
    const s25SettingsUpdateImmediate = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/settings', method: 'PUT',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      emergencyPhone: '+91 98210 33499',
      operatingHours: { start: '08:00', end: '20:30' }
    });
    assert(s25SettingsUpdateImmediate.status === 200 && s25SettingsUpdateImmediate.data.success === true, 'Immediate operational settings updated');

    // Attempting to modify locked fields requires compliance approval
    const s25LockedUpdate = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/settings', method: 'PUT',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      gstNumber: '27AABCA9999F1Z0'
    });
    assert(s25LockedUpdate.status === 400 && s25LockedUpdate.data.error.includes('Platform Compliance Approval'), 'Altering statutory GSTIN/legal name blocked without platform approval');

    // Staff status update
    const s25StaffStatusRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/staff/STF-APX-02/status', method: 'PUT',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { status: 'Inactive' });
    assert(s25StaffStatusRes.status === 200 && s25StaffStatusRes.data.staff.status === 'Inactive', 'Staff status toggled to Inactive');

    // Activity log immutable protection guard (HTTP 403)
    const s25ActivityPostGuard = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/activity', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { action: 'MUTATION_TEST' });
    assert(s25ActivityPostGuard.status === 403, 'Direct audit log creation blocked with HTTP 403 Forbidden');

    const s25ActivityDeleteGuard = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/activity', method: 'DELETE',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s25ActivityDeleteGuard.status === 403, 'Deleting audit history blocked with HTTP 403 Forbidden');
    assert(s25ActivityDeleteGuard.data.error.includes('Immutable audit log policy'), 'Audit immutability policy message returned');

    // -------------------------------------------------------------
    console.log('\n[SUITE 26] Staff Access Revocation, Business Suspension & Confirmed Demo Reset...');
    // 1. Staff access revocation test
    const s26InviteRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/staff', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      name: 'Revoke Test Staff',
      email: 'revoke.test@apexhome.in',
      role: 'Business Manager'
    });
    assert(s26InviteRes.status === 201 && s26InviteRes.data.staff, 'Created staff account for access revocation test');
    const revokeStaffId = s26InviteRes.data.staff.id;

    // Simulate login for this staff member
    const s26StaffLogin = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      emailOrPhone: 'revoke.test@apexhome.in',
      password: 'Partner@2026'
    });
    assert(s26StaffLogin.status === 200 && s26StaffLogin.data.token, 'Staff member authenticated successfully');
    const staffTestToken = s26StaffLogin.data.token;

    // Verify staff token can access view
    const s26StaffAccessBefore = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings', method: 'GET',
      headers: { 'Authorization': `Bearer ${staffTestToken}` }
    });
    assert(s26StaffAccessBefore.status === 200, 'Staff token initially authorized for operational view');

    // Remove the staff member
    const s26StaffDeleteRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: `/api/partner/staff/${revokeStaffId}`, method: 'DELETE',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s26StaffDeleteRes.status === 200, 'Staff member removed by business owner');

    // Token must immediately be revoked!
    const s26StaffAccessAfter = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings', method: 'GET',
      headers: { 'Authorization': `Bearer ${staffTestToken}` }
    });
    assert(s26StaffAccessAfter.status === 403, 'Removed staff access immediately revoked (HTTP 403)');
    assert(s26StaffAccessAfter.data.error.includes('Staff access revoked'), 'Staff revocation error message returned');

    // 2. Business Suspension Guard
    const s26SuspendedLogin = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      emailOrPhone: 'ramesh@safeshield.in',
      password: 'Partner@2026'
    });
    assert(s26SuspendedLogin.status === 200 && s26SuspendedLogin.data.partner.status === 'Suspended', 'Suspended business account authenticated');
    const s26SuspendedToken = s26SuspendedLogin.data.token;

    // Prohibited operational action: dispatch / assignment attempt
    const s26SuspendedDispatch = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings/ORD-9841/assign', method: 'POST',
      headers: { 'Authorization': `Bearer ${s26SuspendedToken}`, 'Content-Type': 'application/json' }
    }, { professionalId: 'PRO-8841', reason: 'Attempt from suspended partner' });
    assert(s26SuspendedDispatch.status === 403, 'Prohibited operational action by suspended business blocked (HTTP 403)');
    assert(s26SuspendedDispatch.data.error.includes('suspended by platform compliance'), 'Suspension enforcement guard message returned');

    // Prohibited setting update
    const s26SuspendedSetting = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/settings', method: 'PUT',
      headers: { 'Authorization': `Bearer ${s26SuspendedToken}`, 'Content-Type': 'application/json' }
    }, { emergencyPhone: '+91 99999 88888' });
    assert(s26SuspendedSetting.status === 403, 'Modifications by suspended business blocked (HTTP 403)');

    // Support permitted for suspended business to communicate with compliance
    const s26SuspendedSupport = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/support', method: 'GET',
      headers: { 'Authorization': `Bearer ${s26SuspendedToken}` }
    });
    assert(s26SuspendedSupport.status === 200, 'Support ticket desk remains accessible for suspended business');

    // 3. Historical Business Ownership Preservation
    const s26BookingsRes = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/bookings', method: 'GET',
      headers: { 'Authorization': `Bearer ${ownerToken}` }
    });
    assert(s26BookingsRes.status === 200 && Array.isArray(s26BookingsRes.data.bookings), 'Bookings retrieved');
    const pastCompletedBooking = s26BookingsRes.data.bookings.find(b => b.status === 'Completed');
    assert(pastCompletedBooking && pastCompletedBooking.partnerId === 'PTR-90142', 'Past completed booking preserves original business association');

    // 4. Non-Authoritative Client Pricing
    const s26OrderWithForgedPrice = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/inventory/orders', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, {
      items: [{ itemId: 'INV-ITEM-01', quantity: 2, unitPrice: 1 }], // Attacker tries to pay ₹1
      notes: 'Tamper test'
    });
    assert(s26OrderWithForgedPrice.status === 201, 'Supply order placed');
    assert(s26OrderWithForgedPrice.data.order.totalAmount === 7700, 'Server recalculated total price using catalog unit cost (2 * 3850 = 7700), ignoring client-supplied price');

    // 5. Confirmed Demo Reset Action
    const s26UnconfirmedReset = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/demo/reset', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { confirmReset: false });
    assert(s26UnconfirmedReset.status === 400, 'Unconfirmed demo reset rejected with HTTP 400');
    assert(s26UnconfirmedReset.data.error.includes('Explicit confirmation required'), 'Confirmation required error message returned');

    const s26ConfirmedReset = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/partner/demo/reset', method: 'POST',
      headers: { 'Authorization': `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }
    }, { confirmReset: true });
    assert(s26ConfirmedReset.status === 200, 'Confirmed demo reset executed with HTTP 200');
    assert(s26ConfirmedReset.data.resetScope.affectedDemoBusinesses.includes('PTR-90142'), 'Demo reset affects strictly simulated demo businesses');
    assert(s26ConfirmedReset.data.resetScope.liveRecordsPreserved === true, 'Live production records preservation confirmed');

  } catch (err) {
    console.error('Fatal test runner error:', err);
    failed++;
  }

  console.log('\n==================================================================');
  console.log(`TOTAL TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPartnerTests();

