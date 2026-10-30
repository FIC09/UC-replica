import dns from 'dns';
import mongoose from 'mongoose';

// Authoritative Web MongoDB Atlas Cluster URI provided by user
const ATLAS_MONGO_URI = 'mongodb+srv://forgeindiaconnecttech26_db_user:lmyALE1vtNWEi6Ag@cluster0.my7b6sy.mongodb.net/urban_company?retryWrites=true&w=majority';

// Prevent 10-second request buffering hang when database is disconnected or connecting
mongoose.set('bufferCommands', false);

let isConnecting = false;
let retryTimer = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1 || isConnecting) return mongoose.connection;
  isConnecting = true;
  const mongoURI = process.env.MONGO_URI || ATLAS_MONGO_URI;
  try {
    dns.setServers(['192.168.1.1', '8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // ignore
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Atlas Connected successfully: ${conn.connection.host} / ${conn.connection.name}`);
    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    console.warn('⚠️ Retrying connection to MongoDB Atlas in 10 seconds...');

    if (!retryTimer && mongoose.connection.readyState !== 1) {
      retryTimer = setInterval(() => {
        if (mongoose.connection.readyState !== 1) {
          connectDB();
        } else {
          clearInterval(retryTimer);
          retryTimer = null;
        }
      }, 10000);
    }
  }
}
