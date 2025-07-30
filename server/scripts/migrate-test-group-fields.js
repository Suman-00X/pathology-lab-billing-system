import mongoose from 'mongoose';
import TestGroup from '../models/TestGroup.js';
import { config } from '../config/config.js';

async function migrateTestGroupFields() {
  try {
    // Connect to database
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all test groups without the new fields
    const testGroups = await TestGroup.find({
      $or: [
        { sampleType: { $exists: false } },
        { sampleTestedIn: { $exists: false } }
      ]
    });

    console.log(`Found ${testGroups.length} test groups that need migration`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const testGroup of testGroups) {
      try {
        const updateData = {};
        
        // Add default values for missing fields
        if (!testGroup.sampleType) {
          updateData.sampleType = 'Blood'; // Default sample type
        }
        if (!testGroup.sampleTestedIn) {
          updateData.sampleTestedIn = 'Laboratory'; // Default sample tested in
        }

        if (Object.keys(updateData).length > 0) {
          // Update the test group with default values
          await TestGroup.findByIdAndUpdate(testGroup._id, updateData);

          console.log(`Updated test group "${testGroup.name}":`, updateData);
          updatedCount++;
        } else {
          console.log(`Skipped test group "${testGroup.name}": already has required fields`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error updating test group "${testGroup.name}":`, error.message);
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`- Updated: ${updatedCount} test groups`);
    console.log(`- Skipped: ${skippedCount} test groups`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateTestGroupFields();
}

export default migrateTestGroupFields; 