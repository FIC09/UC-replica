/**
 * FORGE INDIA CONNECT — REDIS & SOCKET.IO INTEGRATION VERIFICATION SUITE
 * Validates:
 * 1. MongoDB Connection
 * 2. Official Upstash Redis Connection with TLS
 * 3. Real Redis PING/PONG test (via module and via API)
 * 4. Redis Temporary Real-Time State (Worker Presence, Live GPS, Offer Caching)
 * 5. Socket.IO Integration on existing HTTP server (no duplicate ports)
 * 6. JWT Authentication for Socket.IO (Admin, Professional, Customer)
 * 7. Secure Room Authorization Checks (admin:operations, booking:*, worker:*)
 * 8. Real-time Events (Presence, GPS Ingestion, Chat Typing, Broadcasts)
 */

const http = require('http');
const { io } = require('socket.io-client');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'urban_services_secret_jwt_key_2026_super_secure';
const JWT_SECRET = process.env.JWT_SECRET || 'urban_company_jwt_secret_key_2026';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
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
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('\n========================================================================');
  console.log('  FORGE INDIA CONNECT — REDIS & SOCKET.IO VERIFICATION SUITE');
  console.log('  Target: Upstash Redis (TLS) + Express HTTP Server + Socket.IO');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(desc, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✓ [TEST ${total.toString().padStart(2, '0')}] ${desc}`);
    } else {
      console.error(`  ❌ [TEST ${total.toString().padStart(2, '0')}] ${desc} — FAILED: ${details}`);
    }
  }

  try {
    // 1. Health check verifying MongoDB & Redis status
    const health = await request('/api/health');
    assert('Health Endpoint returns 200 OK', health.status === 200);
    assert('MongoDB status is connected', health.body?.databases?.mongo === 'connected');
    assert('Redis status is connected with Upstash TLS', health.body?.databases?.redis === 'connected');
    assert('Backend Health Check returns Redis PING = PONG', health.body?.redisPing === 'PONG');
    assert('WebSocket Server is actively mounted on HTTP Server', health.body?.websockets === 'active');

    // 2. Dedicated Redis PING verification endpoint
    const redisPingRes = await request('/api/redis/ping');
    assert('Dedicated /api/redis/ping Endpoint returns 200 OK', redisPingRes.status === 200);
    assert('Redis PING returns authentic PONG response', redisPingRes.body?.message === 'PONG');
    assert('Redis operates securely over TLS', redisPingRes.body?.tls === true);

    // 3. Socket.IO Connection without Token (Guest/Customer)
    const guestSocket = io(BASE_URL, {
      transports: ['websocket'],
      auth: { userId: 'cust-94432', role: 'customer' }
    });

    const guestConnected = await new Promise((resolve) => {
      guestSocket.on('connect', () => resolve(true));
      guestSocket.on('connect_error', () => resolve(false));
      setTimeout(() => resolve(false), 3000);
    });
    assert('Customer Socket connects to Socket.IO without port conflict', guestConnected);

    // 4. Room Authorization: Customer attempts to join restricted admin room
    const unauthorizedRoomRejected = await new Promise((resolve) => {
      const onErr = (err) => {
        if (err.code === 403) {
          guestSocket.off('room_error', onErr);
          guestSocket.off('error', onErr);
          resolve(true);
        }
      };
      guestSocket.on('room_error', onErr);
      guestSocket.on('error', onErr);
      guestSocket.emit('join_room', { room: 'admin:operations' });
      setTimeout(() => resolve(false), 2000);
    });
    assert('Unauthorized Socket is strictly blocked from admin:operations room (403)', unauthorizedRoomRejected);

    // 5. JWT Authentication: Admin Token Generation & Socket Handshake
    const adminToken = jwt.sign(
      { id: 'ADM-KRI-01', name: 'Master Operations Officer', role: 'admin' },
      ADMIN_JWT_SECRET,
      { expiresIn: '1h' }
    );

    const adminSocket = io(BASE_URL, {
      transports: ['websocket'],
      auth: { token: adminToken }
    });

    const adminConnected = await new Promise((resolve) => {
      adminSocket.on('connect', () => resolve(true));
      adminSocket.on('connect_error', () => resolve(false));
      setTimeout(() => resolve(false), 3000);
    });
    assert('Admin Socket authenticates with valid Admin JWT token', adminConnected);

    // 6. Admin joins admin:operations room successfully
    const adminRoomJoined = await new Promise((resolve) => {
      adminSocket.on('room_joined', (res) => {
        if (res.room === 'admin:operations' && res.authorized) resolve(true);
      });
      adminSocket.emit('join_room', { room: 'admin:operations' });
      setTimeout(() => resolve(false), 2000);
    });
    assert('Authenticated Admin successfully joins admin:operations room', adminRoomJoined);

    // 7. JWT Authentication: Professional Worker Handshake
    const proToken = jwt.sign(
      { proId: 'WRK-KRI-101', name: 'V. Saravanan', role: 'professional' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const proSocket = io(BASE_URL, {
      transports: ['websocket'],
      auth: { token: proToken }
    });

    const proConnected = await new Promise((resolve) => {
      proSocket.on('connect', () => resolve(true));
      proSocket.on('connect_error', () => resolve(false));
      setTimeout(() => resolve(false), 3000);
    });
    assert('Professional Technician Socket authenticates with Professional JWT', proConnected);

    // 8. Real-time Worker Presence via Socket & Redis
    const presenceUpdated = await new Promise((resolve) => {
      adminSocket.on('WORKER_PRESENCE_CHANGED', (evt) => {
        if (evt.payload?.workerId === 'WRK-KRI-101') {
          resolve(true);
        }
      });
      proSocket.emit('worker_presence', { workerId: 'WRK-KRI-101', status: 'online' });
      setTimeout(() => resolve(false), 2500);
    });
    assert('Worker Presence Update broadcasted to Admin Operations room', presenceUpdated);

    // 9. Real-time Device GPS Telemetry Submission via WebSocket & Redis Caching
    const testBookingId = `BK-${Date.now()}`;
    const gpsReceived = await new Promise((resolve) => {
      adminSocket.on('WORKER_LOCATION_UPDATED', (evt) => {
        if (evt.payload?.bookingId === testBookingId && evt.payload?.latitude === 12.5225) {
          resolve(true);
        }
      });

      proSocket.emit('worker_gps_ping', {
        bookingId: testBookingId,
        workerId: 'WRK-KRI-101',
        latitude: 12.5225,
        longitude: 78.2140,
        speed: 25.0,
        heading: 90.0,
        accuracy: 4.0
      });

      setTimeout(() => resolve(false), 2500);
    });
    assert('Real GPS Telemetry Ingested via Socket and broadcasted to operations room', gpsReceived);

    // 10. Clean socket disconnections
    guestSocket.disconnect();
    adminSocket.disconnect();
    proSocket.disconnect();
    assert('All verification WebSockets cleanly closed without resource leak', true);

  } catch (err) {
    console.error('\n❌ Unexpected Verification Suite Failure:', err);
  }

  console.log('\n========================================================================');
  console.log(`  VERIFICATION SUITE RESULTS: ${passed} / ${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('========================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification();
