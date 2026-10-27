// Comprehensive test for Module 4 (Intelligent Auto-Assignment) & Module 5 (Real-time GPS Tracking)
const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:5000');
    const reqOptions = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('🚀 Starting Intelligent Auto-Assignment & Real-Time Tracking Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // TEST 1: Health Check
    console.log('--- TEST 1: Backend Health Check ---');
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'ok', 'Backend server is healthy and responding');

    // TEST 2: Customer creates AC repair booking in Krishnagiri Town
    console.log('\n--- TEST 2: Customer Books AC Repair in Krishnagiri Town ---');
    const bookingPayload = {
      userName: 'Vignesh Ramanathan',
      userPhone: '+91 98409 55678',
      userEmail: 'vignesh.raman@example.com',
      serviceName: 'Powerjet AC Servicing',
      serviceCategory: 'AC & Appliance Repair',
      city: 'Krishnagiri',
      serviceZone: 'Rayakottai Road',
      address: 'Near Government Hospital, Rayakottai Road, Krishnagiri - 635001',
      addressDetails: {
        locality: 'Rayakottai Road',
        city: 'Krishnagiri',
        pincode: '635001',
        fullAddress: 'Near Government Hospital, Rayakottai Road, Krishnagiri - 635001'
      },
      slot: 'Tomorrow, 10:00 AM - 11:00 AM',
      items: [
        {
          id: 'ac-foam-jet-service',
          title: 'Powerjet AC Servicing',
          price: 499,
          qty: 1
        }
      ],
      totalAmount: 548
    };

    const createRes = await request('POST', '/api/bookings', bookingPayload);
    assert(createRes.status === 201 && createRes.body.success, 'Booking created successfully in MongoDB');
    const booking = createRes.body.booking;
    const bookingId = booking.id;
    console.log(`  Created Booking ID: ${bookingId}`);

    // TEST 3: Verify Auto-Assignment Evaluation & Assignment
    console.log('\n--- TEST 3: Verify Auto-Assignment Results ---');
    // Fetch refreshed booking
    const getBookingRes = await request('GET', `/api/bookings/${bookingId}`);
    const updatedBooking = getBookingRes.body.booking;
    assert(updatedBooking.status === 'Assigned', `Booking status is "Assigned" (actual: ${updatedBooking.status})`);
    assert(updatedBooking.assignedProfessional && updatedBooking.assignedProfessional.name, `Worker assigned: ${updatedBooking.assignedProfessional?.name}`);
    console.log(`  Assigned Professional: ${updatedBooking.assignedProfessional?.name} (${updatedBooking.assignedProfessional?.trade})`);
    assert(updatedBooking.assignedProfessional.name === 'V. Saravanan' || updatedBooking.assignedProfessional.name === 'M. Prakash', 'Scoring engine prioritized top Krishnagiri AC specialist');

    // TEST 4: Verify Tracking Session Initialization
    console.log('\n--- TEST 4: Verify Live GPS Tracking Session ---');
    const trackingRes = await request('GET', `/api/tracking/${bookingId}`);
    assert(trackingRes.status === 200 && trackingRes.body.success, 'Tracking session found');
    const tracking = trackingRes.body.tracking;
    assert(tracking.workerName === updatedBooking.assignedProfessional.name, 'Tracking session worker matches assigned professional');
    assert(tracking.safetyPin && tracking.safetyPin.length === 4, `Safety PIN generated: ${tracking.safetyPin}`);
    assert(tracking.routePolyline && tracking.routePolyline.length > 0, `Route waypoints generated: ${tracking.routePolyline?.length} points`);
    console.log(`  Initial Distance: ${tracking.remainingDistanceKm} km, ETA: ${tracking.remainingEtaMinutes} mins`);

    // TEST 5: Worker GPS Telemetry Update (Ping)
    console.log('\n--- TEST 5: Live GPS Ping Submission ---');
    const pingRes = await request('POST', '/api/tracking/ping', {
      bookingId,
      lat: 13.0450,
      lng: 80.2355,
      speed: 28,
      heading: 90
    });
    assert(pingRes.status === 200 && pingRes.body.success, 'GPS ping accepted and processed');
    assert(pingRes.body.tracking.currentCoords.lat === 13.0450, 'Current coordinates updated accurately');
    assert(pingRes.body.tracking.locationEvents.length > 0, 'Location event appended to audit trail');

    // TEST 6: Step along route (Advance Waypoint)
    console.log('\n--- TEST 6: Route Progression & Distance Recalculation ---');
    const stepRes = await request('POST', `/api/tracking/advance-step/${bookingId}`);
    assert(stepRes.status === 200 && stepRes.body.success, 'Advance step executed');
    assert(stepRes.body.tracking.status === 'en_route', 'Status transitioned to "en_route"');
    console.log(`  Step 1 Position: ${JSON.stringify(stepRes.body.tracking.currentCoords)}, Distance: ${stepRes.body.tracking.remainingDistanceKm} km`);

    // TEST 7: Simulate Arrival at Doorstep
    console.log('\n--- TEST 7: Arrival at Customer Location ---');
    // Ping right at destination
    const arrivalPing = await request('POST', '/api/tracking/ping', {
      bookingId,
      lat: tracking.customerCoords.lat,
      lng: tracking.customerCoords.lng,
      speed: 0
    });
    assert(arrivalPing.body.tracking.status === 'arrived', 'System automatically detected arrival within radius');
    const bookingAtArrival = await request('GET', `/api/bookings/${bookingId}`);
    assert(bookingAtArrival.body.booking.status === 'Arrived', 'Authoritative Booking status updated to "Arrived"');

    // TEST 8: Customer Safety PIN Verification
    console.log('\n--- TEST 8: Safety PIN Verification to Start Work ---');
    const invalidPinRes = await request('POST', `/api/tracking/verify-pin/${bookingId}`, { pin: '0000' });
    assert(invalidPinRes.status === 400, 'Invalid PIN rejected with error');

    const validPinRes = await request('POST', `/api/tracking/verify-pin/${bookingId}`, { pin: tracking.safetyPin });
    assert(validPinRes.status === 200 && validPinRes.body.success, 'Valid PIN confirmed');
    assert(validPinRes.body.tracking.status === 'in_progress', 'Tracking status transitioned to "in_progress"');
    const bookingInProgress = await request('GET', `/api/bookings/${bookingId}`);
    assert(bookingInProgress.body.booking.status === 'In Progress', 'Booking status in DB updated to "In Progress"');

    // TEST 9: Service Completion & Rating
    console.log('\n--- TEST 9: Complete Service & Customer Review ---');
    const completeRes = await request('POST', `/api/tracking/complete-service/${bookingId}`, {
      notes: 'AC thoroughly serviced with Powerjet spray. Cooling efficiency tested: 16°C discharge.',
      rating: 5
    });
    assert(completeRes.status === 200 && completeRes.body.success, 'Service marked as completed');
    assert(completeRes.body.booking.status === 'Completed', 'Booking terminal state is "Completed"');
    assert(completeRes.body.booking.rating === 5, '5-star rating recorded on booking');

    // TEST 10: Operations Live Feed Query
    console.log('\n--- TEST 10: Operations Live Feed ---');
    const opsRes = await request('GET', '/api/tracking/operations/all');
    assert(opsRes.status === 200 && opsRes.body.count >= 1, `Operations center returned ${opsRes.body.count} tracking sessions`);

    console.log(`\n=========================================`);
    console.log(`FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test Suite encountered fatal error:', err);
    process.exit(1);
  }
}

runTestSuite();
