import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import Client from '../models/Client.js';
import Bill from '../models/Bill.js';
import TestGroup from '../models/TestGroup.js';
import Test from '../models/Test.js';
import PaymentMode from '../models/PaymentMode.js';
import ReferredDoctor from '../models/ReferredDoctor.js';
import Lab from '../models/Lab.js';
import Settings from '../models/Settings.js';
import Report from '../models/Report.js';

async function migrateToMultiTenant() {
  try {
    console.log('🚀 Starting migration to multi-tenant system...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pathology_lab', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('📊 Connected to database');

    // Create test client
    console.log('👤 Creating test client...');
    
    // Check if test client already exists
    let testClient = await Client.findOne({ email: 'mylab@test.com' });
    
    if (!testClient) {
      testClient = new Client({
        organizationName: 'Test Pathology Lab',
        email: 'mylab@test.com',
        password: 'test123',
        secretPin: 'Bill@delete001',
        isTestClient: true,
        isActive: true
      });
      await testClient.save();
      console.log('✅ Test client created successfully');
    } else {
      console.log('ℹ️ Test client already exists');
    }

    const testClientId = testClient._id;

    // Migrate existing data to test client
    console.log('📦 Migrating existing data to test client...');

    // 1. Migrate Bills
    console.log('📋 Migrating bills...');
    const billsResult = await Bill.updateMany(
      { clientId: { $exists: false } },
      { $set: { clientId: testClientId } }
    );
    console.log(`   Updated ${billsResult.modifiedCount} bills`);

    // 2. Migrate Test Groups
    console.log('🧪 Migrating test groups...');
    const testGroupsResult = await TestGroup.updateMany(
      { clientId: { $exists: false } },
      { $set: { clientId: testClientId } }
    );
    console.log(`   Updated ${testGroupsResult.modifiedCount} test groups`);

    // 3. Migrate Tests
    console.log('🔬 Migrating tests...');
    const testsResult = await Test.updateMany(
      { clientId: { $exists: false } },
      { $set: { clientId: testClientId } }
    );
    console.log(`   Updated ${testsResult.modifiedCount} tests`);

    // 4. Migrate Payment Modes
    console.log('💳 Migrating payment modes...');
    const paymentModesResult = await PaymentMode.updateMany(
      { clientId: { $exists: false } },
      { $set: { clientId: testClientId } }
    );
    console.log(`   Updated ${paymentModesResult.modifiedCount} payment modes`);

    // 5. Migrate Referred Doctors
    console.log('👨‍⚕️ Migrating referred doctors...');
    const doctorsResult = await ReferredDoctor.updateMany(
      { clientId: { $exists: false } },
      { $set: { clientId: testClientId } }
    );
    console.log(`   Updated ${doctorsResult.modifiedCount} doctors`);

    // 6. Migrate Lab info
    console.log('🏥 Migrating lab information...');
    const labResult = await Lab.updateMany(
      { clientId: { $exists: false } },
      { $set: { clientId: testClientId } }
    );
    console.log(`   Updated ${labResult.modifiedCount} lab records`);

    // 7. Migrate Settings
    console.log('⚙️ Migrating settings...');
    const settingsResult = await Settings.updateMany(
      { clientId: { $exists: false } },
      { $set: { clientId: testClientId } }
    );
    console.log(`   Updated ${settingsResult.modifiedCount} settings records`);

    // 8. Migrate Reports
    console.log('📄 Migrating reports...');
    const reportsResult = await Report.updateMany(
      { clientId: { $exists: false } },
      { $set: { clientId: testClientId } }
    );
    console.log(`   Updated ${reportsResult.modifiedCount} reports`);

    // Create default settings for test client if none exist
    const existingSettings = await Settings.findOne({ clientId: testClientId });
    if (!existingSettings) {
      console.log('⚙️ Creating default settings for test client...');
      const defaultSettings = new Settings({
        clientId: testClientId,
        taxPercentage: 0,
        taxEnabled: true,
        paymentModeEnabled: true,
        printHeaderEnabled: true,
        currency: 'INR',
        currencySymbol: '₹'
      });
      await defaultSettings.save();
      console.log('✅ Default settings created');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Test Client Details:');
    console.log(`   Organization: ${testClient.organizationName}`);
    console.log(`   Email: ${testClient.email}`);
    console.log(`   Password: test123`);
    console.log(`   Secret PIN: Bill@delete001`);
    console.log(`   Client ID: ${testClientId}`);

    console.log('\n📊 Migration Summary:');
    console.log(`   Bills: ${billsResult.modifiedCount}`);
    console.log(`   Test Groups: ${testGroupsResult.modifiedCount}`);
    console.log(`   Tests: ${testsResult.modifiedCount}`);
    console.log(`   Payment Modes: ${paymentModesResult.modifiedCount}`);
    console.log(`   Doctors: ${doctorsResult.modifiedCount}`);
    console.log(`   Lab Records: ${labResult.modifiedCount}`);
    console.log(`   Settings: ${settingsResult.modifiedCount}`);
    console.log(`   Reports: ${reportsResult.modifiedCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from database');
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToMultiTenant()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

export default migrateToMultiTenant;
