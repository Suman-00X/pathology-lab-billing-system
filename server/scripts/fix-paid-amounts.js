import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import { config } from '../config/config.js';

async function fixPaidAmounts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find bills with isPaymentModeEnabled: false and paidAmount: 0
    const billsToFix = await Bill.find({
      isPaymentModeEnabled: false,
      paidAmount: 0
    });

    console.log(`📊 Found ${billsToFix.length} bills with 0 paid amounts to fix\n`);

    if (billsToFix.length === 0) {
      console.log('✅ No bills need fixing');
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const bill of billsToFix) {
      try {
        // Set paid amount to a reasonable value (e.g., 50% of final amount)
        const newPaidAmount = Math.round(bill.finalAmount * 0.5);
        
        // Update payment status based on new paid amount
        let newPaymentStatus = 'Pending';
        if (newPaidAmount >= bill.finalAmount) {
          newPaymentStatus = 'Paid';
        } else if (newPaidAmount > 0) {
          newPaymentStatus = 'Partially Paid';
        }

        // Update the bill
        await Bill.findByIdAndUpdate(bill._id, {
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus
        });

        updatedCount++;
        console.log(`✅ Updated bill ${bill.billNumber}:`);
        console.log(`   Final Amount: ₹${bill.finalAmount}`);
        console.log(`   New Paid Amount: ₹${newPaidAmount}`);
        console.log(`   New Payment Status: ${newPaymentStatus}`);
        console.log('');
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating bill ${bill.billNumber}:`, error.message);
      }
    }

    console.log(`📈 Fix completed:`);
    console.log(`   ✅ Successfully updated: ${updatedCount} bills`);
    console.log(`   ❌ Errors: ${errorCount} bills`);

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🚀 Starting paid amount fix...');
fixPaidAmounts().then(() => {
  console.log('🏁 Paid amount fix completed');
}).catch((error) => {
  console.error('💥 Paid amount fix failed:', error);
}); 