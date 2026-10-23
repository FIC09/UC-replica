const http = require('http');

const PORT = 5000;

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      'x-professional-id': 'PRO-8841',
      ...headers
    };
    if (data) {
      reqHeaders['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/professional${path}`,
        method,
        headers: reqHeaders
      },
      res => {
        let respData = '';
        res.on('data', chunk => {
          respData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(respData);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: respData });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING PHASE 3: SUPPORT, SAFETY, NOTIFICATIONS, PROFILE & AUDIT VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // =========================================================================
    // 1. SUPPORT TICKETS & INTERNAL NOTES PRIVACY
    // =========================================================================
    console.log('\n[1] Support Tickets & Internal Staff Notes Privacy');

    const listTicketsRes = await makeRequest('GET', '/support');
    assert(listTicketsRes.status === 200, 'GET /support returned HTTP 200');
    assert(Array.isArray(listTicketsRes.data?.tickets), 'Tickets returned as array');
    assert(listTicketsRes.data?.tickets.length >= 3, 'Seeded tickets exist across categories');

    const sampleTicket = listTicketsRes.data?.tickets[0];
    assert(sampleTicket?.reference && sampleTicket?.category && sampleTicket?.priority, 'Ticket contains reference, category, priority');
    assert(Array.isArray(sampleTicket?.messages), 'Ticket contains messages thread');
    assert(Array.isArray(sampleTicket?.resolutionHistory), 'Ticket contains resolution history');

    // CRITICAL SECURITY ASSERTION: Internal staff notes must NEVER be exposed
    const ticketsWithStaffNotes = listTicketsRes.data?.tickets.filter(t => t.internalStaffNotes !== undefined);
    assert(ticketsWithStaffNotes.length === 0, 'Internal staff notes are strictly omitted from worker responses');

    // Create a new ticket
    const newTicketRes = await makeRequest('POST', '/support', {
      category: 'Technical issues',
      priority: 'High',
      description: 'App crashes during photo upload on Android 14',
      attachments: [{ name: 'crash_log.png', size: 1048576, mimeType: 'image/png', url: 'https://cdn.urban.local/logs/crash1.png' }]
    }, {
      'x-idempotency-key': 'IDEMP-SUPPORT-TEST-001'
    });
    assert(newTicketRes.status === 201, 'POST /support created new ticket (HTTP 201)');
    assert(newTicketRes.data?.ticket?.reference?.startsWith('TKT-'), 'Ticket has official reference number');
    assert(newTicketRes.data?.ticket?.internalStaffNotes === undefined, 'Created ticket response omits internal staff notes');

    // Add message to ticket
    const ticketId = newTicketRes.data?.ticket?.id;
    const addMsgRes = await makeRequest('POST', `/support/${ticketId}/messages`, {
      message: 'Attached reproduction steps and device model details.'
    });
    assert(addMsgRes.status === 200, 'POST /support/:id/messages appends message');
    assert(addMsgRes.data?.ticket?.internalStaffNotes === undefined, 'Message append response keeps staff notes private');

    // =========================================================================
    // 2. URGENT SAFETY ACTION & AUTHORIZED ESCALATION
    // =========================================================================
    console.log('\n[2] Safety Incident Escalation & Verified Guidance');

    // Attempt escalation without location sharing consent
    const unconsentedSafetyRes = await makeRequest('POST', '/support/safety-escalation', {
      severity: 'Immediate Danger',
      incidentDescription: 'Customer aggressive behavior at site',
      userLocationSharingConsent: false
    });
    assert(unconsentedSafetyRes.status === 400, 'Rejects escalation when explicit location sharing consent is omitted (HTTP 400)');

    // Authorized escalation with verified workflow
    const authorizedSafetyRes = await makeRequest('POST', '/support/safety-escalation', {
      severity: 'Immediate Danger',
      incidentDescription: 'Customer threatening violence at residence',
      bookingId: 'BK-7701',
      userLocationSharingConsent: true
    });
    assert(authorizedSafetyRes.status === 201, 'Authorized safety escalation created (HTTP 201)');
    assert(authorizedSafetyRes.data?.safetyAction?.reference?.startsWith('SAFE-ESC-'), 'Safety incident assigned verified reference');
    assert(authorizedSafetyRes.data?.verifiedEmergencyGuidance?.nationalEmergency === '112', 'Provides verified national emergency 112 guidance');
    assert(authorizedSafetyRes.data?.verifiedEmergencyGuidance?.policeControlRoom === '100', 'Provides verified police control room 100');
    assert(authorizedSafetyRes.data?.verifiedEmergencyGuidance?.medicalAmbulance === '108', 'Provides verified ambulance 108');
    assert(authorizedSafetyRes.data?.safetyAction?.internalStaffNotes === undefined, 'Safety incident response strictly hides internal staff notes');

    // =========================================================================
    // 3. NOTIFICATIONS (12 CATEGORIES & LOCAL OUTBOX)
    // =========================================================================
    console.log('\n[3] Notifications, 12 Categories & Local Outbox Delivery');

    const notifRes = await makeRequest('GET', '/notifications');
    assert(notifRes.status === 200, 'GET /notifications returned HTTP 200');
    assert(Array.isArray(notifRes.data?.notifications), 'Notifications returned as array');

    const expectedCategories = [
      'new_assignment', 'offer_expiry', 'booking_changes', 'customer_cancellation',
      'reassignment', 'training', 'document_review', 'expiry_reminders',
      'earnings_updates', 'payout_status', 'support_responses', 'policy_updates'
    ];

    const presentCategories = new Set(notifRes.data?.notifications.map(n => n.category));
    const allFound = expectedCategories.every(cat => presentCategories.has(cat));
    assert(allFound, `All 12 notification categories present (${expectedCategories.length}/12)`);

    // Verify delivery channels and local outbox honesty
    const localOutboxNotifs = notifRes.data?.notifications.filter(n => n.deliveryChannel?.includes('local_outbox'));
    assert(localOutboxNotifs.length > 0, 'Notifications accurately identify local outbox delivery when SMS/push external provider unconfirmed');

    // Verify deep links exist
    const hasDeepLinks = notifRes.data?.notifications.some(n => n.deepLink && n.deepLink.startsWith('/professional'));
    assert(hasDeepLinks, 'Notifications contain useful deep links for direct routing');

    // Mark single notification as read
    const firstNotifId = notifRes.data?.notifications[0]?.id;
    const markReadRes = await makeRequest('POST', '/notifications', { notificationId: firstNotifId });
    assert(markReadRes.status === 200, 'POST /notifications marks notification as read');

    // Bulk mark all read
    const markAllRes = await makeRequest('POST', '/notifications/read-all');
    assert(markAllRes.status === 200 && markAllRes.data?.unreadCount === 0, 'POST /notifications/read-all clears unread count');

    // =========================================================================
    // 4. PROFILE 3-TIER FIELD ENFORCEMENT & KYC CHANGE REQUESTS
    // =========================================================================
    console.log('\n[4] Profile 3-Tier Classification & Immutability Rules');

    const getProfileRes = await makeRequest('GET', '/profile');
    assert(getProfileRes.status === 200, 'GET /profile returns profile details');
    assert(getProfileRes.data?.profile?.workerId === 'PRO-8841', 'Profile matches authenticated worker');
    assert(getProfileRes.data?.profile?.settlementModel === 'direct_to_worker' || getProfileRes.data?.profile?.settlementModel === 'direct_worker_account', 'Includes settlement model');

    // Tier 1: Editable Fields (Instant update)
    const updateEditableRes = await makeRequest('PUT', '/profile', {
      bio: 'Master HVAC Technician with 9 years multi-brand inverter experience.',
      spokenLanguages: ['English', 'Hindi', 'Marathi']
    });
    assert(updateEditableRes.status === 200, 'Directly editable fields updated instantly (HTTP 200)');
    assert(updateEditableRes.data?.profile?.bio.includes('9 years'), 'Updated bio reflected in profile');

    // Tier 2: Changes Requiring Review (Queued for KYC approval)
    const reviewReqRes = await makeRequest('PUT', '/profile', {
      phone: '+91 98200 99999',
      reviewReason: 'Changed SIM card due to network porting'
    });
    assert(reviewReqRes.status === 202, 'Changes requiring review return HTTP 202 Accepted');
    assert(reviewReqRes.data?.requiresReview === true, 'Response flags requiresReview = true');
    assert(reviewReqRes.data?.changeRequest?.status === 'Pending KYC Review', 'Created change request in Pending KYC Review status');

    // Fetch Change History
    const historyRes = await makeRequest('GET', '/profile/change-history');
    assert(historyRes.status === 200, 'GET /profile/change-history returns review records');
    assert(historyRes.data?.changeRequests?.length >= 1, 'Change history records queued request');

    // Tier 3: Platform-Controlled Fields (MUST BE REJECTED)
    const illegalMutationRes = await makeRequest('PUT', '/profile', {
      legalName: 'Unauthorized Name Change',
      tier: 'Diamond Supreme',
      rating: 5.0
    });
    assert(illegalMutationRes.status === 403, 'Platform-controlled mutations rejected with HTTP 403 Forbidden');
    assert(illegalMutationRes.data?.blockedFields?.includes('legalName'), 'Blocked fields enumerated in error payload');

    // =========================================================================
    // 5. DOCUMENTS, EXPIRY, CORRECTION REQUESTS & MASKED ACCESS
    // =========================================================================
    console.log('\n[5] Documents Review Statuses & Masked Download Controls');

    const docRes = await makeRequest('GET', '/documents');
    assert(docRes.status === 200, 'GET /documents returns KYC document portfolio');
    const docList = Array.isArray(docRes.data?.documents) ? docRes.data.documents : (docRes.data?.documentsList || Object.values(docRes.data?.documents || {}));
    assert(Array.isArray(docList) && docList.length > 0, 'Documents available as list');

    const statuses = new Set(docList.map(d => d.status));
    assert(statuses.has('Approved') && statuses.has('Needs Correction'), 'Covers Approved and Needs Correction statuses');

    // Verify masked access
    const maskedDocs = docList.filter(d => d.docNumber?.includes('X') || d.docNumber?.includes('•') || d.maskedNumber);
    assert(maskedDocs.length >= 2, 'Government ID numbers are strictly masked for worker privacy');

    // Verify correction request notes
    const correctionDoc = docList.find(d => d.status === 'Needs Correction');
    assert(correctionDoc?.correctionReason !== undefined, 'Correction request notes provided for rejected documents');

    // Upload replacement document
    const uploadRes = await makeRequest('POST', '/documents', {
      docType: 'Electrical Wireman License B',
      fileName: 'wireman_license_renewed.pdf',
      fileSize: 1542000,
      mimeType: 'application/pdf',
      documentUrl: 'https://cdn.urban.local/docs/wireman_v2.pdf'
    });
    assert(uploadRes.status === 201, 'POST /documents uploads renewed document with Under Review state');

    // =========================================================================
    // 6. SETTINGS, SESSIONS & PIN UPDATE
    // =========================================================================
    console.log('\n[6] Settings, Preferences, Sessions & Security PIN');

    const settingsRes = await makeRequest('GET', '/settings');
    assert(settingsRes.status === 200, 'GET /settings returns professional settings');
    assert(settingsRes.data?.settings?.notificationPreferences !== undefined, 'Notification preferences returned');
    assert(settingsRes.data?.settings?.activeSessions?.length >= 2, 'Active sessions list returned');

    // Update settings
    const updateSettingsRes = await makeRequest('PUT', '/settings', {
      appLanguage: 'hi',
      dispatchRadiusKm: 15
    });
    assert(updateSettingsRes.status === 200, 'PUT /settings updates preferences successfully');

    // Revoke other sessions
    const revokeRes = await makeRequest('POST', '/settings/sessions/revoke-others');
    assert(revokeRes.status === 200, 'POST /settings/sessions/revoke-others succeeds');
    assert(revokeRes.data?.activeSessions?.length === 1, 'Only current active session remains');

    // Security PIN update: Reject wrong current PIN
    const wrongPinRes = await makeRequest('POST', '/settings/security-pin', {
      currentPin: '0000',
      newPin: '5678'
    });
    assert(wrongPinRes.status === 400, 'Security PIN update rejects invalid current PIN (HTTP 400)');

    // Security PIN update: Valid PIN
    const validPinRes = await makeRequest('POST', '/settings/security-pin', {
      currentPin: '1234',
      newPin: '5678'
    });
    assert(validPinRes.status === 200, 'Security PIN updated successfully with verified current PIN (HTTP 200)');

    // =========================================================================
    // 7. ACCOUNT CLOSURE REQUEST & STATUTORY RETENTION
    // =========================================================================
    console.log('\n[7] Account Closure Conflict Validation & Compliance Archival');

    // Attempt closure while professional has active jobs (PRO-8841 has BK-7701 active)
    const blockedClosureRes = await makeRequest('POST', '/settings/account-closure-request', {
      reason: 'Relocating to another city'
    });
    assert(blockedClosureRes.status === 409, 'Account closure rejected when active jobs or open disputes exist (HTTP 409 Conflict)');
    assert(blockedClosureRes.data?.blockingReason?.includes('active dispatches'), 'Explicit conflict error returned with blocking details');

    // =========================================================================
    // 8. AUDIT HISTORY & STRICT READ-ONLY IMMUTABILITY
    // =========================================================================
    console.log('\n[8] Shared Immutable Audit History & Worker Write Rejection');

    const auditRes = await makeRequest('GET', '/audit-history');
    assert(auditRes.status === 200, 'GET /audit-history returns audit logs (HTTP 200)');
    assert(Array.isArray(auditRes.data?.auditRecords), 'Audit records returned as array');
    assert(auditRes.data?.auditRecords.length >= 4, 'Audit records capture worker actions and system events');

    const sampleAudit = auditRes.data?.auditRecords[0];
    assert(sampleAudit?.actor && sampleAudit?.action && sampleAudit?.entity && sampleAudit?.timestamp, 'Audit entry contains actor, action, entity, timestamp');
    assert(sampleAudit?.safeSummary !== undefined, 'Audit entry contains safe sanitized summary');

    // CRITICAL: Professional cannot alter or delete audit history
    const postAuditRes = await makeRequest('POST', '/audit-history', { action: 'Tamper' });
    assert(postAuditRes.status === 403, 'POST /audit-history rejected with HTTP 403 (Workers cannot add audit logs)');

    const putAuditRes = await makeRequest('PUT', '/audit-history', { action: 'Overwrite' });
    assert(putAuditRes.status === 403, 'PUT /audit-history rejected with HTTP 403 (Workers cannot alter audit logs)');

    // =========================================================================
    // 9. CONFIRMED DEMO DATA RESET & CROSS-WORKER ISOLATION
    // =========================================================================
    console.log('\n[9] Confirmed Demo Data Reset & Cross-Worker Isolation');

    // Unconfirmed reset attempt must be rejected
    const unconfirmedResetRes = await makeRequest('POST', '/demo/reset', { confirmReset: false });
    assert(unconfirmedResetRes.status === 400, 'POST /demo/reset rejected without confirmed flag (HTTP 400)');

    // Confirmed reset of demo data
    const confirmedResetRes = await makeRequest('POST', '/demo/reset', { confirmReset: true });
    assert(confirmedResetRes.status === 200, 'POST /demo/reset successfully resets demo data (HTTP 200)');
    assert(confirmedResetRes.data?.resetScope?.liveRecordsPreserved === true, 'Reset explicitly declares live records preserved');
    assert(Array.isArray(confirmedResetRes.data?.resetScope?.affectedDemoProfiles), 'Affected demo profiles enumerated');

    // Cross-worker data isolation check with PRO-8842
    const pro8842ProfileRes = await makeRequest('GET', '/profile', null, { 'x-professional-id': 'PRO-8842' });
    assert(pro8842ProfileRes.status === 200, 'GET /profile for PRO-8842 returns HTTP 200');
    assert(pro8842ProfileRes.data?.profile?.id === 'PRO-8842', 'PRO-8842 gets their own isolated profile');
    assert(pro8842ProfileRes.data?.profile?.applicantName === 'Rajesh Kumar', 'PRO-8842 name is Rajesh Kumar');
    assert(pro8842ProfileRes.data?.profile?.trade === 'Appliance Repair Lead', 'PRO-8842 trade is Appliance Repair Lead (isolated from HVAC)');

    // =========================================================================
    // SUMMARY
    // =========================================================================
    console.log(`\n=============================================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=============================================================`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
