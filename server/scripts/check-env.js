#!/usr/bin/env node

import dotenv from 'dotenv';
import { validateEnvironment } from '../config/config.js';

// Load environment variables
dotenv.config();

console.log('🔍 Environment Configuration Check');
console.log('==================================');

// Run validation
validateEnvironment();

console.log('✅ Environment check completed!');
console.log('');
console.log('💡 Tips:');
console.log('   - Run this script with: npm run check-env');
console.log('   - Always use secure secrets in production');
console.log('   - Keep your .env file secure and never commit it'); 