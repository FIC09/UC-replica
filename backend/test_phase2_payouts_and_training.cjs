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
  console.log('--- STARTING PHASE 2 ENTERPRISE PROFESSIONAL VERIFICATION ---');
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
    // 1. Independent Professional Payouts (Direct to Worker)
    console.log('\n[1] Independent Worker Payouts & Settlement Model (PRO-8841)');
    const indepRes = await makeRequest('GET', '/payouts', null, { 'x-professional-id': 'PRO-8841' });
    assert(indepRes.status === 200, 'GET /payouts returns 200 OK');
    assert(indepRes.data.settlementModel === 'direct_to_worker', 'Settlement model is direct_to_worker');
    assert(indepRes.data.actualRecipient?.type === 'professional_personal', 'Actual recipient is professional personal account');
    assert(indepRes.data.actualRecipient?.label.includes('Vikram Salvi'), 'Recipient label shows Vikram Salvi [Personal Account]');
    assert(indepRes.data.bankDetails?.accountNumber.includes('••••'), 'Bank account number is masked');
    assert(indepRes.data.disallowWorkerManualPaidMarking === true, 'Workers cannot mark platform transfers as paid');
    assert(indepRes.data.payoutStatements?.length >= 3, 'Payout statements returned with complete history');
    assert(indepRes.data.sandboxMode === true, 'Sandbox demonstration mode clearly flagged');

    // 2. Business-Associated Worker Payouts (Settle to Business PTR-90142)
    console.log('\n[2] Business-Associated Worker Payouts (PRO-8843 / PTR-90142)');
    const busRes = await makeRequest('GET', '/payouts', null, { 'x-professional-id': 'PRO-8843' });
    assert(busRes.status === 200, 'GET /payouts for business-associated worker returns 200 OK');
    assert(busRes.data.settlementModel === 'settle_to_business', 'Settlement model is settle_to_business');
    assert(busRes.data.isBusinessAssociated === true, 'isBusinessAssociated is true');
    assert(busRes.data.actualRecipient?.type === 'partner_business', 'Actual recipient is partner_business');
    assert(busRes.data.actualRecipient?.label.includes('Apex Home Solutions LLP'), 'Recipient clearly shows Partner Agency Apex Home Solutions LLP');
    assert(busRes.data.actualRecipient?.entityId === 'PTR-90142', 'Partner Agency ID PTR-90142 displayed');
    assert(busRes.data.settlementNotice.toLowerCase().includes('not represent') && busRes.data.settlementNotice.toLowerCase().includes('salary'), 'Notice clarifies platform-to-business transfer is NOT worker salary');
    assert(busRes.data.preventDoubleCountingNotice !== undefined, 'Dashboard contains anti-double counting declaration');

    // 3. Bank Details Change Request Workflow
    console.log('\n[3] Bank Details Change Request Workflow & Verification Guard');
    const invalidBankRes = await makeRequest('POST', '/payouts/bank-change-request', {
      accountHolderName: 'Vikram Salvi',
      accountNumber: '123456789012',
      confirmAccountNumber: '999999999999', // Mismatch
      ifscCode: 'INVALID_IFSC',
      bankName: 'HDFC Bank'
    });
    assert(invalidBankRes.status === 400, 'Mismatched account or invalid IFSC returns HTTP 400');

    const validBankRes = await makeRequest('POST', '/payouts/bank-change-request', {
      accountHolderName: 'Vikram Salvi',
      accountNumber: '987654321098',
      confirmAccountNumber: '987654321098',
      ifscCode: 'HDFC0001248',
      bankName: 'HDFC Bank (Pali Hill Branch)',
      upiId: 'vikramsalvi@oksbi',
      reason: 'Switched to new premium savings account',
      documentRef: 'DOC-CHQ-NEW-2026.png'
    });
    assert(validBankRes.status === 201, 'Valid bank change request returns HTTP 201 Created');
    assert(validBankRes.data.changeRequest?.status === 'Pending Review', 'Status is Pending Review');
    assert(validBankRes.data.changeRequest?.effectiveApplied === false, 'Change is NOT immediately applied to pending transfers');
    assert(validBankRes.data.changeRequest?.newDetailsMasked.accountNumber === '••••••••1098', 'Stored account number is securely masked');
    assert(validBankRes.data.changeRequest?.policyNotice.includes('Unverified bank changes are never applied immediately'), 'Policy notice guarantees unverified changes do not alter pending payouts');

    const historyRes = await makeRequest('GET', '/payouts/bank-change-history');
    assert(historyRes.status === 200 && historyRes.data.history?.length >= 2, 'GET /payouts/bank-change-history returns change log');

    // 4. Financial Disputes Workflow
    console.log('\n[4] Financial Disputes Workflow & Source Linking');
    const invalidDisputeRes = await makeRequest('POST', '/payouts/disputes', {
      category: 'invalid_category',
      sourceRef: 'UC-829410',
      disputedAmount: 200
    });
    assert(invalidDisputeRes.status === 400, 'Invalid dispute category returns HTTP 400');

    const validDisputeRes = await makeRequest('POST', '/payouts/disputes', {
      category: 'missing_earnings',
      sourceType: 'booking',
      sourceRef: 'UC-829410',
      disputedAmount: 180,
      reason: 'Additional copper pipe material incentive not reflected in ledger',
      description: 'Customer approved 2 meters copper piping on job #UC-829410. ₹180 commission-free payout missing.'
    });
    assert(validDisputeRes.status === 201, 'Valid dispute returns HTTP 201 Created');
    assert(validDisputeRes.data.dispute?.status === 'Open', 'Dispute ticket is Open');
    assert(validDisputeRes.data.dispute?.sourceRef === 'UC-829410', 'Dispute linked to source record UC-829410');
    assert(validDisputeRes.data.dispute?.immutabilityNotice.includes('cannot directly rewrite ledger'), 'Immutability rule enforced');

    const disputesListRes = await makeRequest('GET', '/payouts/disputes');
    assert(disputesListRes.data.disputes?.some(d => d.sourceRef === 'UC-829410'), 'New dispute visible in dispute register');

    // 5. Reviews Access, Immutability & Abusive Review Flagging
    console.log('\n[5] Customer Reviews & Flagging Workflow');
    const reviewsRes = await makeRequest('GET', '/reviews');
    assert(reviewsRes.status === 200, 'GET /reviews returns 200 OK');
    assert(reviewsRes.data.reviews?.length >= 4, 'Customer reviews list returned');
    assert(reviewsRes.data.policyNotice.includes('cannot be edited or deleted by professionals'), 'Immutability notice for ratings verified');

    const flagRes = await makeRequest('POST', `/reviews/${reviewsRes.data.reviews[0].id}/flag`, {
      reason: 'customer_scope_dispute',
      explanation: 'Customer requested complimentary outdoor unit bracket change not covered under servicing.'
    });
    assert(flagRes.status === 200, 'POST /reviews/:id/flag returns 200 OK');
    assert(flagRes.data.review?.flagged === true, 'Review marked flagged: true');
    assert(flagRes.data.review?.flagStatus === 'Pending Moderation Review', 'Review flag status is Pending Moderation');

    // 6. Performance Scorecard & Metric Definitions
    console.log('\n[6] Performance Scorecard, Rolling Review Window & Insufficient Data Handling');
    const perfRes = await makeRequest('GET', '/performance', null, { 'x-professional-id': 'PRO-8841' });
    assert(perfRes.status === 200, 'GET /performance returns 200 OK');
    assert(perfRes.data.reviewPeriod.includes('Rolling 30-Day'), 'Rolling 30-day review window declared');
    assert(perfRes.data.scorecard?.averageRating?.definition !== undefined, 'Average rating has explicit definition');
    assert(perfRes.data.scorecard?.completionRate?.definition !== undefined, 'Completion rate has explicit definition');
    assert(perfRes.data.scorecard?.cancellationRate?.definition !== undefined, 'Cancellation rate has explicit definition');
    assert(perfRes.data.scorecard?.onTimeArrivalRate?.definition !== undefined, 'On-time arrival rate has explicit definition');
    assert(perfRes.data.scorecard?.revisitRate?.definition !== undefined, 'Revisit rate has explicit definition');
    assert(perfRes.data.insufficientData === false, 'PRO-8841 has sufficient data (>10 completed jobs)');

    // Test Insufficient Data Profile (<10 jobs, e.g. PRO-8845)
    const lowJobsRes = await makeRequest('GET', '/performance', null, { 'x-professional-id': 'PRO-8845' });
    assert(lowJobsRes.status === 200, 'GET /performance for PRO-8845 returns 200 OK');
    assert(lowJobsRes.data.insufficientData === true, 'insufficientData flag is true for PRO-8845 (0 jobs)');
    assert(lowJobsRes.data.insufficientDataNotice.includes('minimum of 10 completed dispatches'), 'Clear insufficient data notice returned');

    // Performance Appeal
    const appealRes = await makeRequest('POST', '/performance/appeal', {
      metric: 'cancellation_rate',
      incidentBookingRef: 'UC-829100',
      explanation: 'Waterlogged road prevented arrival. Traffic police advisory submitted.',
      evidenceRef: 'BMC-TRAFFIC-ADV-902'
    });
    assert(appealRes.status === 201, 'POST /performance/appeal returns 201 Created');
    assert(appealRes.data.appeal?.status === 'Pending Audit', 'Appeal status is Pending Audit');

    // 7. Training & Verified Assessment Workflow
    console.log('\n[7] Training Academy & Backend Verified Assessment Certification');
    const trainRes = await makeRequest('GET', '/trainings');
    assert(trainRes.status === 200, 'GET /trainings returns 200 OK');
    assert(trainRes.data.categories?.required?.length >= 2, 'Required courses returned');
    assert(trainRes.data.categories?.assigned?.length >= 1, 'Assigned courses returned');
    assert(trainRes.data.categories?.available?.length >= 1, 'Available courses returned');
    assert(trainRes.data.externalVideoNotice.includes('streaming video integration is unconfigured in this sandbox'), 'External video player limitation disclosed');

    // Direct completion attempt without assessment MUST BE REJECTED
    const directCompleteRes = await makeRequest('POST', '/trainings/TRN-103/complete');
    assert(directCompleteRes.status === 400, 'Direct completion without assessment is REJECTED (HTTP 400)');

    // Fetch quiz questions
    const quizRes = await makeRequest('GET', '/trainings/TRN-103/assessment');
    assert(quizRes.status === 200, 'GET assessment questions returns 200 OK');
    assert(quizRes.data.questions?.length === 4, '4 quiz questions returned');
    assert(quizRes.data.passingScore === 80, 'Passing score threshold is 80%');

    // Submit Failing Answers (e.g. 1 out of 4 correct = 25%)
    const failQuizRes = await makeRequest('POST', '/trainings/TRN-103/assessment', {
      answers: { q1: 0, q2: 0, q3: 0, q4: 0 }
    });
    assert(failQuizRes.status === 422, 'Submitting failing score (<80%) returns HTTP 422');
    assert(failQuizRes.data.passed === false, 'Passed flag is false');
    assert(failQuizRes.data.certificate === null, 'Certificate withheld when score < 80%');

    // Submit Passing Answers (4 out of 4 correct = 100%)
    const passQuizRes = await makeRequest('POST', '/trainings/TRN-103/assessment', {
      answers: { q1: 1, q2: 1, q3: 1, q4: 3 }
    });
    assert(passQuizRes.status === 200, 'Submitting passing score (>=80%) returns HTTP 200 OK');
    assert(passQuizRes.data.passed === true, 'Passed flag is true');
    assert(passQuizRes.data.score === '100%', 'Score calculated accurately as 100%');
    assert(passQuizRes.data.certificate?.certificateId !== undefined, 'Certificate issued with unique ID');
    assert(passQuizRes.data.certificate?.expiryDate !== undefined, 'Certificate has valid expiry date (1 year)');

    // Session booking
    const bookSessRes = await makeRequest('POST', '/trainings/book-session', {
      sessionId: 'SESS-HUB-101'
    });
    assert(bookSessRes.status === 200, 'Booking in-person workshop session returns 200 OK');
    assert(bookSessRes.data.session?.bookingStatus === 'Confirmed', 'Session booking status is Confirmed');

    // 8. Inventory & Ownership Segregation
    console.log('\n[8] Inventory: Ownership Segregation, Low Stock & Damaged Items');
    const invRes = await makeRequest('GET', '/inventory');
    assert(invRes.status === 200, 'GET /inventory returns 200 OK');
    assert(invRes.data.grouped?.personalStock?.length >= 2, 'Personal stock distinguished');
    assert(invRes.data.grouped?.businessOwnedStock?.length >= 2, 'Business-owned assigned stock distinguished');
    assert(invRes.data.grouped?.platformOrders?.length >= 4, 'Platform consumables distinguished');
    assert(invRes.data.lowStockAlerts?.length >= 1, 'Low stock alert identified for item <= threshold (R32 gas)');

    // Damaged Item Report
    const dmgReportRes = await makeRequest('POST', '/inventory/return-report', {
      itemId: 'INV-05',
      reason: 'damaged_in_transit',
      quantity: 1.0,
      description: 'Brass valve nozzle cracked on delivery from hub.'
    });
    assert(dmgReportRes.status === 201, 'POST /inventory/return-report returns 201 Created');
    assert(dmgReportRes.data.returnTicket?.status === 'Pending Inspection at Regional Logistics Hub', 'Return ticket queued for inspection');

    // Negative stock prevention
    const negStockRes = await makeRequest('POST', '/inventory/return-report', {
      itemId: 'INV-05',
      reason: 'damaged_in_transit',
      quantity: 999.0 // Exceeds available stock
    });
    assert(negStockRes.status === 400, 'Attempting to return more than available stock is rejected (Negative stock prevented)');

    // 9. Equipment & Uniform Shop (Sandbox Order)
    console.log('\n[9] Equipment Shop & Sandbox Purchase Flow');
    const shopRes = await makeRequest('GET', '/shop');
    assert(shopRes.status === 200, 'GET /shop returns 200 OK');
    assert(shopRes.data.items?.length >= 5, 'Shop catalog items returned');

    const orderRes = await makeRequest('POST', '/shop/order', {
      itemId: 'SH-01',
      quantity: 1,
      deliveryMethod: 'hub_pickup'
    });
    assert(orderRes.status === 201, 'POST /shop/order returns 201 Created');
    assert(orderRes.data.order?.fulfilmentStatus.includes('Ready for Pickup'), 'Order generated with pickup status');
    assert(orderRes.data.order?.sandboxNotice.includes('Sandbox demonstration order'), 'Order clearly marked sandbox simulation');

    console.log('\n======================================================');
    console.log(`TOTAL PHASE 2 TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log('======================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
