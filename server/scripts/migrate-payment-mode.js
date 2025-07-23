import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import { config } from '../config/config.js';

async function migratePaymentMode() {
  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check total number of bills
    const totalBills = await Bill.countDocuments();
    console.log(`📊 Total bills in database: ${totalBills}`);

    // Find all bills that don't have isPaymentModeEnabled field
    const billsToUpdate = await Bill.find({
      $or: [
        { isPaymentModeEnabled: { $exists: false } },
        { isPaymentModeEnabled: null }
      ]
    });

    console.log(`📊 Found ${billsToUpdate.length} bills to update`);

    if (billsToUpdate.length === 0) {
      console.log('✅ No bills need migration');
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const bill of billsToUpdate) {
      try {
        // Determine if payment mode was enabled based on payment details
        const hasPaymentDetails = bill.paymentDetails && bill.paymentDetails.length > 0;
        
        // Update the bill
        await Bill.findByIdAndUpdate(bill._id, {
          isPaymentModeEnabled: hasPaymentDetails
        });

        updatedCount++;
        console.log(`✅ Updated bill ${bill.billNumber} - Payment mode: ${hasPaymentDetails ? 'enabled' : 'disabled'}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating bill ${bill.billNumber}:`, error.message);
      }
    }

    console.log(`\n📈 Migration completed:`);
    console.log(`   ✅ Successfully updated: ${updatedCount} bills`);
    console.log(`   ❌ Errors: ${errorCount} bills`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration if this file is executed directly
console.log('🚀 Starting migration script...');
migratePaymentMode().then(() => {
  console.log('🏁 Migration script completed');
}).catch((error) => {
  console.error('💥 Migration script failed:', error);
});

export default migratePaymentMode; 