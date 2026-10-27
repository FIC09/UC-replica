import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

const host = process.env.REDIS_HOST;
const port = parseInt(process.env.REDIS_PORT || '6379', 10);
const username = process.env.REDIS_USERNAME || 'default';
const password = process.env.REDIS_PASSWORD;
const isTls = process.env.REDIS_TLS === 'true' || process.env.REDIS_TLS === true;

console.log(`Connecting to Redis at ${host}:${port} (TLS: ${isTls}, User: ${username})...`);

const protocol = isTls ? 'rediss' : 'redis';
const url = `${protocol}://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}`;

const client = createClient({
  url,
  socket: {
    tls: isTls,
    rejectUnauthorized: true,
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
  }
});

client.on('error', (err) => {
  console.error('Redis Client Error:', err.message);
});

async function testPing() {
  try {
    await client.connect();
    console.log('Redis connected successfully!');
    const pong = await client.ping();
    console.log(`PING test response: ${pong}`);
    if (pong === 'PONG') {
      console.log('✅ Real Redis PING/PONG test PASSED!');
    } else {
      console.error('❌ Unexpected response:', pong);
    }
    await client.quit();
    process.exit(0);
  } catch (err) {
    console.error('Redis test failed:', err);
    process.exit(1);
  }
}

testPing();
