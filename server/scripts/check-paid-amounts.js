import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import { config } from '../config/config.js';

async function checkPaidAmounts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all bills with detailed payment information
    const bills = await Bill.find().sort({ createdAt: -1 });
    console.log(`📊 Found ${bills.length} bills\n`);

    bills.forEach((bill, index) => {
      console.log(`📄 Bill ${index + 1}: ${bill.billNumber}`);
      console.log(`   Total Amount: ₹${bill.totalAmount}`);
      console.log(`   Paid Amount: ₹${bill.paidAmount}`);
      console.log(`   Payment Status: ${bill.paymentStatus}`);
      console.log(`   isPaymentModeEnabled: ${bill.isPaymentModeEnabled}`);
      
      if (bill.paymentDetails && bill.paymentDetails.length > 0) {
        console.log(`   Payment Details (${bill.paymentDetails.length} entries):`);
        bill.paymentDetails.forEach((payment, pIndex) => {
          console.log(`     ${pIndex + 1}. Mode: ${payment.paymentMode}, Amount: ₹${payment.amount}`);
        });
      } else {
        console.log(`   Payment Details: None`);
      }
      
      // Calculate expected paid amount
      let expectedPaidAmount = 0;
      if (bill.paymentDetails && bill.paymentDetails.length > 0) {
        expectedPaidAmount = bill.paymentDetails.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      } else {
        expectedPaidAmount = bill.paidAmount || 0;
      }
      
      console.log(`   Expected Paid Amount: ₹${expectedPaidAmount}`);
      console.log(`   Match: ${bill.paidAmount === expectedPaidAmount ? '✅' : '❌'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkPaidAmounts(); 