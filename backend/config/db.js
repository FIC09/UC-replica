import dns from 'dns';
import mongoose from 'mongoose';

// Authoritative Web MongoDB Atlas Cluster URI provided by user
const ATLAS_MONGO_URI = 'mongodb+srv://forgeindiaconnecttech26_db_user:lmyALE1vtNWEi6Ag@cluster0.my7b6sy.mongodb.net/urban_company?retryWrites=true&w=majority';

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI || ATLAS_MONGO_URI;
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // ignore
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Atlas Connected successfully: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    console.warn('⚠️ Server will continue running, but MongoDB operations will fail until connected.');
  }
}
