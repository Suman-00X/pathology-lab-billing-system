import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import { config } from '../config/config.js';

async function testDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check total number of bills
    const totalBills = await Bill.countDocuments();
    console.log(`📊 Total bills in database: ${totalBills}`);

    if (totalBills > 0) {
      // Get a sample bill
      const sampleBill = await Bill.findOne();
      console.log('📄 Sample bill structure:', {
        _id: sampleBill._id,
        billNumber: sampleBill.billNumber,
        hasPaymentDetails: !!sampleBill.paymentDetails,
        paymentDetailsLength: sampleBill.paymentDetails?.length || 0,
        hasIsPaymentModeEnabled: 'isPaymentModeEnabled' in sampleBill,
        isPaymentModeEnabled: sampleBill.isPaymentModeEnabled
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testDatabase(); 