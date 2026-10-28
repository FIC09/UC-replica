import dns from 'dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = 'mongodb+srv://forgeindiaconnecttech26_db_user:lmyALE1vtNWEi6Ag@cluster0.my7b6sy.mongodb.net/urban_company?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');

  // 1. Remove mock bookings
  const mockIds = ['UC-263021', 'UC-160976'];
  const delRes = await mongoose.connection.collection('bookings').deleteMany({
    id: { $in: mockIds }
  });
  console.log(`Deleted ${delRes.deletedCount} mock bookings.`);

  // 2. Also remove any bookings with dummy/mock names if any
  const mockNames = ['thursday', 'renug'];
  const delUsers = await mongoose.connection.collection('users').deleteMany({
    name: { $in: mockNames }
  });
  console.log(`Deleted ${delUsers.deletedCount} mock user accounts.`);

  // 3. Print remaining bookings
  const bookings = await mongoose.connection.collection('bookings').find({}).sort({ createdAt: -1 }).toArray();
  console.log(`Remaining valid bookings (${bookings.length}):`);
  bookings.forEach(b => {
    console.log(` - ID: ${b.id} | Customer: ${b.userName || b.customerName} | Service: ${b.serviceName} | Mode: ${b.assignmentMode} | AssignStatus: ${b.assignmentStatus} | Status: ${b.status}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
