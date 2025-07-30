import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import { config } from '../config/config.js';

async function migrateSampleReceivedDate() {
  try {
    // Connect to database
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all bills without the sampleReceivedDate field
    const bills = await Bill.find({
      sampleReceivedDate: { $exists: false }
    });

    console.log(`Found ${bills.length} bills that need sampleReceivedDate migration`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const bill of bills) {
      try {
        // Set sampleReceivedDate to the same as sampleCollectionDate if it exists, otherwise use billDate
        const defaultDate = bill.sampleCollectionDate || bill.billDate || new Date();
        
        // Update the bill with default sampleReceivedDate
        await Bill.findByIdAndUpdate(bill._id, {
          sampleReceivedDate: defaultDate
        });

        console.log(`Updated bill ${bill.billNumber}: sampleReceivedDate set to ${defaultDate.toISOString().split('T')[0]}`);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating bill ${bill.billNumber}:`, error.message);
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`- Updated: ${updatedCount} bills`);
    console.log(`- Skipped: ${skippedCount} bills`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateSampleReceivedDate();
}

export default migrateSampleReceivedDate; 