const { io } = require('socket.io-client');
const mongoose = require('mongoose');
const http = require('http');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://forgeindiaconnecttech26_db_user:lmyALE1vtNWEi6Ag@cluster0.my7b6sy.mongodb.net/urban_company?retryWrites=true&w=majority';
const BACKEND_URL = 'http://localhost:5000';

async function runComprehensiveMatrix() {
  console.log('======================================================================');
  console.log('🚀 FORGE INDIA CONNECT: WEBRTC VOICE CALLING COMPREHENSIVE TEST MATRIX');
  console.log('======================================================================');

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const testBookingId = 'BK-MATRIX-CALL-01';
  const customerId = 'cust-matrix-user';
  const workerId = 'WRK-MATRIX-PRO';

  // Seed test booking
  await db.collection('bookings').deleteOne({ id: testBookingId });
  await db.collection('bookings').insertOne({
    id: testBookingId,
    bookingReference: testBookingId,
    userId: customerId,
    customerId: customerId,
    userName: 'Ananya Sharma',
    userPhone: '+91 94432 77701',
    status: 'En Route',
    assignedProfessional: {
      id: workerId,
      name: 'Praveen Nair',
      phone: '+91 98840 55555',
      rating: 4.95
    },
    assignedWorkerId: workerId,
    serviceTitle: 'Split AC Power Jet Servicing',
    city: 'Krishnagiri',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Connect Customer & Pro sockets
  const customerSocket = io(BACKEND_URL, {
    transports: ['websocket'],
    auth: { userId: customerId, role: 'customer', name: 'Ananya Sharma' }
  });

  const proSocket = io(BACKEND_URL, {
    transports: ['websocket'],
    auth: { userId: workerId, proId: workerId, role: 'professional', name: 'Praveen Nair' }
  });

  await Promise.all([
    new Promise(res => customerSocket.on('connect', res)),
    new Promise(res => proSocket.on('connect', res))
  ]);

  await new Promise(res => customerSocket.emit('join_room', { room: `booking:${testBookingId}` }, res));
  await new Promise(res => proSocket.emit('join_room', { room: `booking:${testBookingId}` }, res));
  await new Promise(res => proSocket.emit('join_room', { room: `worker:${workerId}` }, res));

  console.log('\n----------------------------------------------------------------------');
  console.log('TEST 1: Call Rejection Handling');
  console.log('----------------------------------------------------------------------');
  {
    let callRejectedReceived = false;
    let rejectedReason = null;

    proSocket.once('webrtc_incoming_call', (data) => {
      console.log('  📞 [Pro] Incoming call received:', data.callId);
      setTimeout(() => {
        console.log('  ❌ [Pro] Emitting webrtc_call_reject...');
        proSocket.emit('webrtc_call_reject', {
          callId: data.callId,
          bookingId: testBookingId,
          reason: 'busy_with_inspection'
        });
      }, 200);
    });

    customerSocket.once('webrtc_call_rejected', (data) => {
      console.log('  🚫 [Customer] Received webrtc_call_rejected event! Reason:', data.reason);
      callRejectedReceived = true;
      rejectedReason = data.reason;
    });

    const initAck = await new Promise(res => {
      customerSocket.emit('webrtc_call_initiate', {
        bookingId: testBookingId,
        callerRole: 'customer',
        callerName: 'Ananya Sharma'
      }, res);
    });

    await new Promise(res => setTimeout(res, 800));

    if (!callRejectedReceived || rejectedReason !== 'busy_with_inspection') {
      throw new Error('Test 1 Failed: Call rejection event not properly propagated.');
    }

    // Verify MongoDB status
    const doc = await db.collection('callsessions').findOne({ callId: initAck.callId });
    if (!doc || doc.status !== 'rejected' || doc.disconnectReason !== 'busy_with_inspection') {
      throw new Error('Test 1 Failed: MongoDB document status not marked as rejected: ' + JSON.stringify(doc));
    }
    console.log('  ✓ Test 1 Passed: Rejection signaled and logged to MongoDB as status: rejected');
  }

  console.log('\n----------------------------------------------------------------------');
  console.log('TEST 2: Unauthorized Caller Rejection');
  console.log('----------------------------------------------------------------------');
  {
    const rogueSocket = io(BACKEND_URL, {
      transports: ['websocket'],
      auth: { userId: 'rogue-intruder-007', role: 'customer', name: 'Unknown Attacker' }
    });
    await new Promise(res => rogueSocket.on('connect', res));

    let authErrorReceived = false;
    rogueSocket.once('webrtc_call_error', (data) => {
      console.log('  🛡️ [Server -> Rogue] Access Denied:', data.message);
      authErrorReceived = true;
    });

    const ack = await new Promise(res => {
      rogueSocket.emit('webrtc_call_initiate', {
        bookingId: testBookingId,
        callerRole: 'customer',
        callerName: 'Unknown Attacker'
      }, res);
    });

    await new Promise(res => setTimeout(res, 400));
    rogueSocket.disconnect();

    if (!authErrorReceived && (ack && ack.success)) {
      throw new Error('Test 2 Failed: Unauthorized user was able to initiate call!');
    }
    console.log('  ✓ Test 2 Passed: Unauthorized user strictly blocked from initiating calls.');
  }

  console.log('\n----------------------------------------------------------------------');
  console.log('TEST 3: Busy Status Detection');
  console.log('----------------------------------------------------------------------');
  {
    // Start an active call between Customer & Pro
    let activeCallId = null;
    proSocket.once('webrtc_incoming_call', (data) => {
      activeCallId = data.callId;
      proSocket.emit('webrtc_call_accept', { callId: data.callId, bookingId: testBookingId });
    });

    const init1 = await new Promise(res => {
      customerSocket.emit('webrtc_call_initiate', {
        bookingId: testBookingId,
        callerRole: 'customer',
        callerName: 'Ananya Sharma'
      }, res);
    });

    await new Promise(res => setTimeout(res, 600));

    // While call 1 is active, simulate a third participant trying to call customer
    const caller2Socket = io(BACKEND_URL, {
      transports: ['websocket'],
      auth: { userId: customerId, role: 'customer', name: 'Ananya Sharma Tab 2' }
    });
    await new Promise(res => caller2Socket.on('connect', res));

    const busyAck = await new Promise(res => {
      caller2Socket.emit('webrtc_call_initiate', {
        bookingId: testBookingId,
        callerRole: 'customer',
        callerName: 'Ananya Sharma'
      }, res);
    });

    caller2Socket.disconnect();

    if (busyAck && busyAck.success) {
      throw new Error('Test 3 Failed: Server allowed duplicate call while participant was active.');
    }
    console.log('  ✓ Test 3 Passed: Busy status correctly detected and blocked with message:', busyAck.message);

    // End call 1 cleanly
    customerSocket.emit('webrtc_call_end', {
      callId: init1.callId,
      bookingId: testBookingId,
      durationSeconds: 12,
      reason: 'test_concluded'
    });
    await new Promise(res => setTimeout(res, 600));
  }

  console.log('\n----------------------------------------------------------------------');
  console.log('TEST 4: Professional Initiating Call to Customer');
  console.log('----------------------------------------------------------------------');
  {
    let customerReceivedCall = false;
    let customerAccepted = false;
    let proCallAccepted = false;

    customerSocket.once('webrtc_incoming_call', (data) => {
      console.log('  📞 [Customer] Received incoming call from technician:', data.callerName);
      customerReceivedCall = true;
      setTimeout(() => {
        console.log('  ✅ [Customer] Accepting call from technician...');
        customerSocket.emit('webrtc_call_accept', { callId: data.callId, bookingId: testBookingId });
      }, 200);
    });

    proSocket.once('webrtc_call_accepted', (data) => {
      console.log('  🤝 [Pro] Technician received webrtc_call_accepted from customer!');
      proCallAccepted = true;
      // Pro sends SDP offer
      proSocket.emit('webrtc_signal_offer', {
        callId: data.callId,
        bookingId: testBookingId,
        sdp: { type: 'offer', sdp: 'v=0\r\no=pro 12345 2 IN IP4 127.0.0.1\r\ns=audio\r\nm=audio 40000 RTP/SAVPF 111' }
      });
    });

    customerSocket.once('webrtc_signal_offer', (data) => {
      console.log('  📨 [Customer] Received SDP offer from technician, sending answer...');
      customerSocket.emit('webrtc_signal_answer', {
        callId: data.callId,
        bookingId: testBookingId,
        sdp: { type: 'answer', sdp: 'v=0\r\no=cust 12345 2 IN IP4 127.0.0.1\r\ns=audio\r\nm=audio 40002 RTP/SAVPF 111' }
      });
    });

    proSocket.once('webrtc_signal_answer', (data) => {
      console.log('  🎉 [Pro] Received SDP answer from customer! P2P connection active!');
      setTimeout(() => {
        proSocket.emit('webrtc_call_end', {
          callId: data.callId,
          bookingId: testBookingId,
          durationSeconds: 24,
          reason: 'normal_hangup'
        });
      }, 400);
    });

    console.log('  🚀 [Pro] Initiating call to customer...');
    const proAck = await new Promise(res => {
      proSocket.emit('webrtc_call_initiate', {
        bookingId: testBookingId,
        callerRole: 'professional',
        callerName: 'Praveen Nair'
      }, res);
    });

    await new Promise(res => setTimeout(res, 1500));

    if (!customerReceivedCall || !proCallAccepted) {
      throw new Error('Test 4 Failed: Professional-to-customer call flow did not complete.');
    }

    const doc = await db.collection('callsessions').findOne({ callId: proAck.callId });
    if (!doc || doc.status !== 'ended' || doc.durationSeconds !== 24 || doc.callerRole !== 'professional') {
      throw new Error('Test 4 Failed: MongoDB session does not match technician call: ' + JSON.stringify(doc));
    }
    console.log('  ✓ Test 4 Passed: Professional -> Customer call verified in MongoDB with duration 24s.');
  }

  // Cleanup
  customerSocket.disconnect();
  proSocket.disconnect();
  await mongoose.disconnect();

  console.log('\n======================================================================');
  console.log('🎉 ALL 4 TESTS IN THE COMPREHENSIVE MATRIX PASSED WITH 100% SUCCESS');
  console.log('======================================================================\n');
}

runComprehensiveMatrix()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Test Matrix Failed:', err);
    process.exit(1);
  });
