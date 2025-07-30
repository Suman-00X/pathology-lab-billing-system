import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import { config } from '../config/config.js';

async function migrateAddresses() {
  try {
    // Connect to database
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all bills with old address format
    const bills = await Bill.find({
      'patient.address.street': { $exists: true }
    });

    console.log(`Found ${bills.length} bills with old address format`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const bill of bills) {
      try {
        const oldAddress = bill.patient.address;
        
        // Check if it's the old format (object with street, city, state, pincode)
        if (oldAddress && typeof oldAddress === 'object' && oldAddress.street) {
          // Combine the address fields into a single string
          const newAddress = [
            oldAddress.street,
            oldAddress.city,
            oldAddress.state,
            oldAddress.pincode
          ].filter(Boolean).join(', ');

          // Update the bill with new address format
          await Bill.findByIdAndUpdate(bill._id, {
            'patient.address': newAddress
          });

          console.log(`Updated bill ${bill.billNumber}: "${newAddress}"`);
          updatedCount++;
        } else {
          console.log(`Skipped bill ${bill.billNumber}: already in new format or invalid format`);
          skippedCount++;
        }
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
  migrateAddresses();
}

export default migrateAddresses;