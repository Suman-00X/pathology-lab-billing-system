import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pathology_lab_billing',


  
  // Security Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'pathology-lab-billing-default-secret-change-in-production',
  
  // File Upload Configuration
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  
  // CORS Configuration
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000'
};

// Environment validation function
export const validateEnvironment = () => {
  const warnings = [];
  
  // Check for default JWT secret
  if (config.JWT_SECRET === 'pathology-lab-billing-default-secret-change-in-production') {
    warnings.push('⚠️  Using default JWT_SECRET. Please change this in production!');
  }
  
  // Check for development MongoDB URI in production
  if (config.NODE_ENV === 'production' && config.MONGODB_URI.includes('localhost')) {
    warnings.push('⚠️  Using localhost MongoDB URI in production. Please use a production database!');
  }
  
  // Check for development client URL in production
  if (config.NODE_ENV === 'production' && config.CLIENT_URL.includes('localhost')) {
    warnings.push('⚠️  Using localhost CLIENT_URL in production. Please set production URL!');
  }
  
  // Configuration logging removed
}; 