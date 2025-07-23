import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { config, validateEnvironment } from './config/config.js';

// Load environment variables from .env file
dotenv.config();

console.log('🚀 Starting Pathology Lab Billing Server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || 5000);

// Validate environment configuration
validateEnvironment();

// Import routes
import labRoutes from './routes/labRoutes.js';
import testGroupRoutes from './routes/testGroupRoutes.js';
import billRoutes from './routes/billRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import paymentModeRoutes from './routes/paymentModeRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import referredDoctorRoutes from './routes/referredDoctorRoutes.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
try {
  console.log('📊 Connecting to database...');
  await connectDB();
  console.log('✅ Database connected successfully');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
  origin: config.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'] 
    : config.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/test-groups', (req, res, next) => {

  next();
});

// Serve static files (for logo uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/lab', labRoutes);
app.use('/api/test-groups', testGroupRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payment-modes', paymentModeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/referred-doctors', referredDoctorRoutes);

// Error handling middleware
app.use((err, req, res, next) => {

  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: config.NODE_ENV === 'development' ? err.message : 'Internal server error',
    path: req.url,
    method: req.method
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Pathology Lab Billing Server is running!' });
});

const PORT = config.PORT;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎉 Server is running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
}).on('error', (err) => {
  console.error('❌ Server startup error:', err);
  process.exit(1);
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
}); 