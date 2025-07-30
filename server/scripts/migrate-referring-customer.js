import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import { config } from '../config/config.js';

async function migrateReferringCustomer() {
  try {
    // Connect to database
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all bills without the referringCustomer field
    const bills = await Bill.find({
      referringCustomer: { $exists: false }
    });

    console.log(`Found ${bills.length} bills that need referringCustomer migration`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const bill of bills) {
      try {
        // Set referringCustomer to empty string for existing bills
        await Bill.findByIdAndUpdate(bill._id, {
          referringCustomer: ''
        });

        console.log(`Updated bill ${bill.billNumber}: referringCustomer set to empty string`);
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
  migrateReferringCustomer();
}

export default migrateReferringCustomer; 