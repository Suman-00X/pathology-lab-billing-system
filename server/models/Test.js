import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  // Multi-tenant support
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true
  },
  testGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestGroup'
  },
  normalRange: {
    type: String,
    trim: true,
    required: [true, 'Normal range is required']
  },
  units: {
    type: String,
    trim: true,
    required: [true, 'Units are required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for multi-tenant performance
testSchema.index({ clientId: 1, name: 1 });
testSchema.index({ clientId: 1, isActive: 1 });

const Test = mongoose.model('Test', testSchema);

export default Test; 