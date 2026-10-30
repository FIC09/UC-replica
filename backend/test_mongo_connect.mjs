import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const candidates = [
  'mongodb+srv://urban-company-replica:Password123@cluster0.my7b6sy.mongodb.net/urban_company?retryWrites=true&w=majority',
  'mongodb+srv://urban-company-replica:Password123@cluster0.my7b6sy.mongodb.net/urban-company-replica?retryWrites=true&w=majority',
  'mongodb+srv://urban-company-replica:Password123@cluster0.my7b6sy.mongodb.net/?retryWrites=true&w=majority',
  'mongodb+srv://forgeindiaconnecttech26_db_user:lmyALE1vtNWEi6Ag@cluster0.my7b6sy.mongodb.net/urban-company-replica?retryWrites=true&w=majority',
  'mongodb+srv://forgeindiaconnecttech26_db_user:lmyALE1vtNWEi6Ag@cluster0.my7b6sy.mongodb.net/urban_company?retryWrites=true&w=majority'
];

async function tryConnect(uri) {
  console.log('\nTesting URI:', uri.replace(/:([^:@]+)@/, ':****@'));
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log('>>> SUCCESS! Connected to:', conn.connection.host, 'DB:', conn.connection.name);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.log('Failed:', err.message);
    return false;
  }
}

async function run() {
  for (const uri of candidates) {
    const ok = await tryConnect(uri);
    if (ok) {
      console.log('\n*** WORKING URI FOUND ***:', uri);
      process.exit(0);
    }
  }
  console.log('\nNone of the URIs could connect.');
  process.exit(1);
}

run();
