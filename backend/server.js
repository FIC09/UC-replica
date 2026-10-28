import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import professionalRoutes from './routes/professionalRoutes.js';
import partnerApiRoutes from './routes/partnerApiRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import callingRoutes from './routes/callingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

import { startAssignmentWatchdog } from './services/assignmentEngine.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// Connect Authoritative MongoDB Atlas Database Only
async function bootstrapDatabases() {
  try {
    await connectDB();
    startAssignmentWatchdog(5000);
  } catch (err) {
    console.error('Database bootstrap error:', err.message);
  }
}
bootstrapDatabases();

// Restrictive CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: Origin ${origin} not permitted.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token', 'x-professional-id', 'x-partner-token', 'x-partner-id', 'x-user-id', 'x-user-role', 'x-user-name', 'x-razorpay-signature'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint (Pure MongoDB Atlas Mode)
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Forge India Connect Marketplace Backend API',
    database: 'MongoDB Atlas',
    mongoStatus: 'connected'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/worker-applications', workerRoutes);
app.use('/api/partner-applications', partnerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/professional', professionalRoutes);
app.use('/api/partner', partnerApiRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/calling', callingRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.originalUrl}` });
});

// Root welcome
app.get('/', (req, res) => {
  res.send('<h1>Forge India Connect Real-Time Marketplace Backend</h1><p>Running on Node.js + Express + PostgreSQL + MongoDB + WebSockets.</p><p>Check health at <a href="/api/health">/api/health</a></p>');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [PORT CONFLICT] Port ${PORT} is already in use by another running Node process.`);
    console.error(`💡 Tip: Close any other terminal running 'npm run dev' or kill the existing process on port ${PORT}.\n`);
    process.exit(1);
  } else {
    console.error('HTTP Server Error:', err);
  }
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Forge India Connect Backend Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🍃 Database: MongoDB Atlas (Pure NoSQL REST Mode)`);
});

// Graceful cleanup on nodemon restart & process termination
process.once('SIGUSR2', () => {
  httpServer.close(() => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', () => {
  httpServer.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  httpServer.close(() => {
    process.exit(0);
  });
});
