/**
 * KRISHNAGIRI HOME SERVICES - COMPREHENSIVE END-TO-END AUTOMATED TEST SUITE
 * 
 * Verifies complete real-time lifecycle:
 * 1. PostGIS-equivalent Geofencing (Hosur/Bargur rejection, Krishnagiri validation)
 * 2. Customer Booking Creation in Krishnagiri Town
 * 3. Multi-Factor Intelligent Auto-Assignment (35% ETA, 25% Skills, 15% Avail, 10% Reliab, 10% Workload, 5% Rating)
 * 4. Direct Worker Travel (NO hub, NO warehouse dispatch)
 * 5. Live GPS Tracking Session & Ingestion API
 * 6. Safety PIN / Service-Start OTP Verification
 * 7. Service Execution & Completion
 * 8. Partner & Admin Dashboard Operations Visibility
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', err => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTestSuite() {
  console.log('\n================================================================');
  console.log('🚀 KRISHNAGIRI HOME SERVICES PLATFORM - END-TO-END ACCEPTANCE SUITE');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // PHASE 1: GEOFENCING & SERVICE BOUNDARY VALIDATION
    // -------------------------------------------------------------
    console.log('--- TEST GROUP 1: Geofencing & Service Boundary Verification ---');

    // 1.1 Out-of-town address rejection: Hosur
    const hosurCheck = await makeRequest('POST', '/api/bookings/validate-coverage', {
      address: 'Near Bus Stand, Bagalur Road, Hosur',
      locality: 'Hosur',
      city: 'Hosur'
    });
    assert(hosurCheck.status === 200, 'Coverage validation endpoint responds 200');
    assert(hosurCheck.body.coverage.allowed === false, 'Hosur address correctly rejected from Phase 1 scope');
    assert(hosurCheck.body.coverage.message.includes('exclusively within Krishnagiri Town'), 'Polite expansion notice provided for Hosur');

    // 1.2 Out-of-town address rejection: Bargur
    const bargurCheck = await makeRequest('POST', '/api/bookings/validate-coverage', {
      address: 'Bargur Main Bazaar',
      locality: 'Bargur',
      city: 'Bargur'
    });
    assert(bargurCheck.body.coverage.allowed === false, 'Bargur address correctly rejected from Phase 1 scope');

    // 1.3 Out-of-town address rejection: Chennai
    const chennaiCheck = await makeRequest('POST', '/api/bookings/validate-coverage', {
      address: 'Anna Salai, T. Nagar, Chennai',
      locality: 'T. Nagar',
      city: 'Chennai'
    });
    assert(chennaiCheck.body.coverage.allowed === false, 'Chennai address rejected from Krishnagiri Town scope');

    // 1.4 Valid Krishnagiri Town Locality: Rayakottai Road
    const rayakottaiCheck = await makeRequest('POST', '/api/bookings/validate-coverage', {
      address: 'Door 42, Rayakottai Main Road, Near Old Bus Stand, Krishnagiri',
      locality: 'Rayakottai Road',
      city: 'Krishnagiri'
    });
    assert(rayakottaiCheck.body.coverage.allowed === true, 'Rayakottai Road verified within active Krishnagiri Town service boundary');
    assert(rayakottaiCheck.body.coverage.coordinates.lat === 12.5200, 'High-precision latitude matched for Rayakottai Road');

    // 1.5 Valid Krishnagiri Town Locality: Gandhi Nagar
    const gandhiNagarCheck = await makeRequest('POST', '/api/bookings/validate-coverage', {
      address: 'Plot 15, Gandhi Nagar 2nd Cross, Krishnagiri',
      locality: 'Gandhi Nagar',
      city: 'Krishnagiri'
    });
    assert(gandhiNagarCheck.body.coverage.allowed === true, 'Gandhi Nagar verified within active Krishnagiri Town service boundary');

    // -------------------------------------------------------------
    // PHASE 2: BOOKING CREATION WITH GEOFENCE ENFORCEMENT
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Booking Creation & Boundary Rejection ---');

    // 2.1 Attempt booking outside Krishnagiri -> must fail with HTTP 400
    const outOfTownBooking = await makeRequest('POST', '/api/bookings', {
      address: 'Denkanikottai Road, Hosur - 635109',
      serviceZone: 'Hosur',
      city: 'Hosur',
      totalAmount: 599,
      items: [{ id: 'ac-repair', title: 'AC Service and Repair', price: 599 }]
    });
    assert(outOfTownBooking.status === 400, 'Booking endpoint rejects out-of-town address with HTTP 400');
    assert(outOfTownBooking.body.serviceUnavailable === true, 'Response specifies serviceUnavailable: true');

    // 2.2 Create legitimate Krishnagiri Town Booking (AC Repair on Rayakottai Road)
    const bookingPayload = {
      userName: 'Anand Kumar',
      userPhone: '+91 94421 88390',
      userEmail: 'anand.krishnagiri@example.com',
      address: 'Plot 24, Sri Ram Nagar, Rayakottai Road, Krishnagiri Town - 635001',
      serviceZone: 'Rayakottai Road',
      city: 'Krishnagiri',
      serviceName: 'AC Service and Repair',
      serviceCategory: 'AC Service and Repair',
      slot: 'Today, 04:00 PM - 05:30 PM',
      totalAmount: 799,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      items: [
        {
          id: 'ac-powerjet',
          title: 'Powerjet AC Deep Clean & Diagnostic',
          price: 799,
          qty: 1,
          durationMins: 60
        }
      ]
    };

    const createRes = await makeRequest('POST', '/api/bookings', bookingPayload);
    assert(createRes.status === 201, 'Krishnagiri booking created successfully with HTTP 201');
    const createdBooking = createRes.body.booking;
    assert(createdBooking.id.startsWith('UC-'), 'Booking ID generated with authoritative prefix');
    assert(createdBooking.city === 'Krishnagiri', 'Booking city persisted as Krishnagiri');
    assert(createdBooking.serviceZone === 'Rayakottai Road', 'Service zone verified as Rayakottai Road');

    // -------------------------------------------------------------
    // PHASE 3: AUTOMATIC PROFESSIONAL DISPATCH & MULTI-FACTOR RANKING
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Automatic Worker Assignment Engine ---');

    // Fetch booking after auto-assignment
    const assignedRes = await makeRequest('GET', `/api/bookings/${createdBooking.id}`);
    const assignedBooking = assignedRes.body.booking;
    assert(assignedBooking.status === 'Assigned', 'Booking status automatically transitioned to Assigned');
    assert(assignedBooking.assignedProfessional != null, 'Professional worker successfully assigned');
    assert(assignedBooking.assignedProfessional.name === 'V. Saravanan', 'Best matching Krishnagiri AC specialist (V. Saravanan) selected');
    assert(assignedBooking.assignedPartner === 'V. Saravanan', 'Assigned partner recorded');
    assert(assignedBooking.partnerAgency === 'Krishnagiri Native Home Care LLP', 'Business partner agency linked');

    // Verify direct travel dispatch in timeline (NO hub, NO warehouse)
    const assignedTimeline = assignedBooking.timeline.find(t => t.status === 'Assigned');
    assert(assignedTimeline != null, 'Assigned timeline entry recorded in PostgreSQL/MongoDB');
    assert(assignedTimeline.description.includes('Direct dispatch from worker location'), 'Direct dispatch without hub stops documented in timeline');

    // -------------------------------------------------------------
    // PHASE 4: LIVE GPS TRACKING & DIRECT TRAVEL NAVIGATION
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Direct Travel Live GPS Tracking ---');

    const trkRes = await makeRequest('GET', `/api/tracking/${assignedBooking.id}`);
    assert(trkRes.status === 200, 'Tracking session endpoint responds HTTP 200');
    const session = trkRes.body.tracking;
    assert(session.workerName === 'V. Saravanan', 'Tracking session reflects assigned Krishnagiri professional');
    assert(session.customerCoords.lat > 12.48 && session.customerCoords.lat < 12.56, 'Customer coordinates inside Krishnagiri Town');
    assert(session.currentCoords.lat > 12.48 && session.currentCoords.lat < 12.56, 'Worker origin coordinates inside Krishnagiri Town');
    assert(session.safetyPin && session.safetyPin.length === 4, '4-Digit Safety PIN generated for customer');
    assert(session.routePolyline && session.routePolyline.length > 0, 'Road network route waypoints generated');

    // 4.1 Ingest Live Worker GPS Ping
    const pingRes = await makeRequest('POST', '/api/tracking/ping', {
      bookingId: assignedBooking.id,
      lat: 12.5210,
      lng: 78.2105,
      speed: 26,
      heading: 85,
      accuracy: 3.5
    });
    assert(pingRes.status === 200, 'Worker GPS ping ingested successfully via HTTP POST');
    assert(pingRes.body.tracking.speed === 26, 'Speed telemetry recorded (26 km/h)');
    assert(pingRes.body.tracking.locationEvents.length > 0, 'GPS telemetry event stored in audit ledger');

    // 4.2 Advance along road route towards customer address
    const advanceRes = await makeRequest('POST', `/api/tracking/advance-step/${assignedBooking.id}`);
    assert(advanceRes.status === 200, 'Route waypoint advanced towards customer address');
    assert(advanceRes.body.tracking.status === 'en_route', 'Worker status is en_route during travel');

    // -------------------------------------------------------------
    // PHASE 5: ARRIVAL & SAFETY PIN / START OTP VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 5: Worker Arrival & Safety PIN Verification ---');

    // 5.1 Incorrect Safety PIN attempt -> must be rejected
    const badPinRes = await makeRequest('POST', `/api/tracking/verify-pin/${assignedBooking.id}`, {
      pin: '0000'
    });
    assert(badPinRes.status === 400, 'Incorrect Safety PIN rejected with HTTP 400');

    // 5.2 Correct Safety PIN verification
    const goodPinRes = await makeRequest('POST', `/api/tracking/verify-pin/${assignedBooking.id}`, {
      pin: session.safetyPin
    });
    assert(goodPinRes.status === 200, 'Valid Safety PIN accepted with HTTP 200');
    assert(goodPinRes.body.tracking.status === 'in_progress', 'Tracking session transitioned to in_progress');

    // Verify booking status transitioned to In Progress in database
    const inProgBookingRes = await makeRequest('GET', `/api/bookings/${assignedBooking.id}`);
    assert(inProgBookingRes.body.booking.status === 'In Progress', 'Booking record transitioned to In Progress in database');

    // -------------------------------------------------------------
    // PHASE 6: SERVICE EXECUTION, COMPLETION & SETTLEMENT
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 6: Service Completion & Dashboard Sync ---');

    const completeRes = await makeRequest('POST', `/api/tracking/complete-service/${assignedBooking.id}`, {
      rating: 5,
      notes: 'AC powerjet servicing performed cleanly. Cooling optimal.'
    });
    assert(completeRes.status === 200, 'Service completion processed with HTTP 200');
    assert(completeRes.body.tracking.status === 'completed', 'Tracking status marked completed');
    assert(completeRes.body.booking.status === 'Completed', 'Booking status marked Completed in database');
    assert(completeRes.body.booking.rating === 5, 'Customer review rating 5 stars saved');

    // -------------------------------------------------------------
    // PHASE 7: OPERATIONS VISIBILITY (ADMIN & BUSINESS PARTNER)
    // -------------------------------------------------------------
    console.log('\n--- TEST GROUP 7: Operations Tracking Visibility ---');

    const opsRes = await makeRequest('GET', `/api/tracking/operations/all?partnerId=PTR-KRI-501`);
    assert(opsRes.status === 200, 'Partner operations tracking query responds 200');
    const partnerSessions = opsRes.body.sessions;
    const foundSession = partnerSessions.find(s => s.bookingId === assignedBooking.id);
    assert(foundSession != null, 'Partner dashboard sees live tracking session under its agency');

    console.log('\n================================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
    console.log('Krishnagiri Town Home Services Platform fully verified end-to-end.');
    console.log('================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    process.exit(1);
  }
}

runTestSuite();
