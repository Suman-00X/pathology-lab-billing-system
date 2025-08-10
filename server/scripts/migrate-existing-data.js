import mongoose from 'mongoose';
import Client from '../models/Client.js';
import Bill from '../models/Bill.js';
import TestGroup from '../models/TestGroup.js';
import Test from '../models/Test.js';
import PaymentMode from '../models/PaymentMode.js';
import ReferredDoctor from '../models/ReferredDoctor.js';
import Lab from '../models/Lab.js';
import Settings from '../models/Settings.js';
import Report from '../models/Report.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateExistingData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pathology_lab');
    console.log('🔗 Connected to database');
    
    // Find test client
    const testClient = await Client.findOne({ email: 'mylab@test.com' });
    if (!testClient) {
      console.log('❌ Test client not found. Run check-test-client.js first.');
      return;
    }
    
    console.log('✅ Test client found:', testClient.organizationName);
    const testClientId = testClient._id;
    
    // Check for data that needs migration (data without clientId)
    const [bills, testGroups, tests, paymentModes, doctors, labs, settings, reports] = await Promise.all([
      Bill.countDocuments({ clientId: { $exists: false } }),
      TestGroup.countDocuments({ clientId: { $exists: false } }),
      Test.countDocuments({ clientId: { $exists: false } }),
      PaymentMode.countDocuments({ clientId: { $exists: false } }),
      ReferredDoctor.countDocuments({ clientId: { $exists: false } }),
      Lab.countDocuments({ clientId: { $exists: false } }),
      Settings.countDocuments({ clientId: { $exists: false } }),
      Report.countDocuments({ clientId: { $exists: false } })
    ]);
    
    console.log('\n📊 Data needing migration:');
    console.log(`- Bills: ${bills}`);
    console.log(`- Test Groups: ${testGroups}`);
    console.log(`- Tests: ${tests}`);
    console.log(`- Payment Modes: ${paymentModes}`);
    console.log(`- Doctors: ${doctors}`);
    console.log(`- Labs: ${labs}`);
    console.log(`- Settings: ${settings}`);
    console.log(`- Reports: ${reports}`);
    
    if (bills + testGroups + tests + paymentModes + doctors + labs + settings + reports === 0) {
      console.log('\n✅ No data needs migration or migration already completed');
      
      // Check if test client has any data
      const [clientBills, clientTestGroups, clientTests] = await Promise.all([
        Bill.countDocuments({ clientId: testClientId }),
        TestGroup.countDocuments({ clientId: testClientId }),
        Test.countDocuments({ clientId: testClientId })
      ]);
      
      console.log('\n📈 Test client current data:');
      console.log(`- Bills: ${clientBills}`);
      console.log(`- Test Groups: ${clientTestGroups}`);
      console.log(`- Tests: ${clientTests}`);
      
      await mongoose.disconnect();
      return;
    }
    
    console.log('\n🔄 Starting migration...');
    
    // Migrate data
    const results = await Promise.all([
      Bill.updateMany({ clientId: { $exists: false } }, { $set: { clientId: testClientId } }),
      TestGroup.updateMany({ clientId: { $exists: false } }, { $set: { clientId: testClientId } }),
      Test.updateMany({ clientId: { $exists: false } }, { $set: { clientId: testClientId } }),
      PaymentMode.updateMany({ clientId: { $exists: false } }, { $set: { clientId: testClientId } }),
      ReferredDoctor.updateMany({ clientId: { $exists: false } }, { $set: { clientId: testClientId } }),
      Lab.updateMany({ clientId: { $exists: false } }, { $set: { clientId: testClientId } }),
      Settings.updateMany({ clientId: { $exists: false } }, { $set: { clientId: testClientId } }),
      Report.updateMany({ clientId: { $exists: false } }, { $set: { clientId: testClientId } })
    ]);
    
    console.log('\n✅ Migration completed:');
    console.log(`- Bills: ${results[0].modifiedCount} migrated`);
    console.log(`- Test Groups: ${results[1].modifiedCount} migrated`);
    console.log(`- Tests: ${results[2].modifiedCount} migrated`);
    console.log(`- Payment Modes: ${results[3].modifiedCount} migrated`);
    console.log(`- Doctors: ${results[4].modifiedCount} migrated`);
    console.log(`- Labs: ${results[5].modifiedCount} migrated`);
    console.log(`- Settings: ${results[6].modifiedCount} migrated`);
    console.log(`- Reports: ${results[7].modifiedCount} migrated`);
    
    // Create default settings if none exist
    const existingSettings = await Settings.findOne({ clientId: testClientId });
    if (!existingSettings) {
      console.log('\n⚙️ Creating default settings...');
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
    
    await mongoose.disconnect();
    console.log('\n📊 Disconnected from database');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

migrateExistingData();
