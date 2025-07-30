import mongoose from 'mongoose';
import Test from '../models/Test.js';
import Report from '../models/Report.js';
import { config } from '../config/config.js';

async function migrateMethodologyToUnits() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update Test documents
    console.log('Updating Test documents...');
    const testResult = await Test.updateMany(
      { methodology: { $exists: true } },
      [
        {
          $set: {
            units: '$methodology'
          }
        },
        {
          $unset: 'methodology'
        }
      ]
    );
    console.log(`Updated ${testResult.modifiedCount} Test documents`);

    // Update Report documents
    console.log('Updating Report documents...');
    const reportResult = await Report.updateMany(
      { 'results.methodology': { $exists: true } },
      [
        {
          $set: {
            'results.units': '$results.methodology'
          }
        },
        {
          $unset: 'results.methodology'
        }
      ]
    );
    console.log(`Updated ${reportResult.modifiedCount} Report documents`);

    console.log('\nMigration completed successfully!');
    console.log(`- Updated ${testResult.modifiedCount} Test documents`);
    console.log(`- Updated ${reportResult.modifiedCount} Report documents`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrateMethodologyToUnits();
}

export default migrateMethodologyToUnits; 