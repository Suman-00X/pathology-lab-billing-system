import mongoose from 'mongoose';
import Client from '../models/Client.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAndCreateTestClient() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pathology_lab');
    console.log('🔗 Connected to database');
    
    // Check if test client exists
    let client = await Client.findOne({ email: 'mylab@test.com' });
    
    if (client) {
      console.log('✅ Test client found:');
      console.log('- Organization:', client.organizationName);
      console.log('- Email:', client.email);
      console.log('- Active:', client.isActive);
      console.log('- Test Client:', client.isTestClient);
      
      // Test password verification
      const isValidPassword = await client.comparePassword('test123');
      console.log('- Password test123 valid:', isValidPassword);
      
      // Test PIN verification
      const isValidPin = await client.compareSecretPin('Bill@delete001');
      console.log('- PIN Bill@delete001 valid:', isValidPin);
      
    } else {
      console.log('❌ Test client not found, creating...');
      
      // Create test client
      client = new Client({
        organizationName: 'Test Pathology Lab',
        email: 'mylab@test.com',
        password: 'test123',
        secretPin: 'Bill@delete001',
        isTestClient: true,
        isActive: true
      });
      
      await client.save();
      console.log('✅ Test client created successfully');
    }
    
    await mongoose.disconnect();
    console.log('📊 Disconnected from database');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndCreateTestClient();
