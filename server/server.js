import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { config, validateEnvironment } from './config/config.js';

// Load environment variables from .env file
dotenv.config();

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
await connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true
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

app.listen(PORT, () => {
  console.log("App runnung on port : ", PORT)
}); 