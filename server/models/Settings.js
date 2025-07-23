import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  taxPercentage: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  // Tax enable/disable setting
  taxEnabled: {
    type: Boolean,
    default: true
  },
  // Payment mode enable/disable setting
  paymentModeEnabled: {
    type: Boolean,
    default: true
  },
  // Can add more settings in the future
  currency: {
    type: String,
    default: 'INR'
  },
  currencySymbol: {
    type: String,
    default: '₹'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings; 