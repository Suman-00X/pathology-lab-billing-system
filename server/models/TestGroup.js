import mongoose from 'mongoose';

const testGroupSchema = new mongoose.Schema({
  // Multi-tenant support
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Test group name is required'],
    trim: true,
    unique: false // Will be unique per client via compound index
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  sampleType: {
    type: String,
    required: [true, 'Sample type is required'],
    trim: true
  },
  sampleTestedIn: {
    type: String,
    required: [true, 'Sample tested in is required'],
    trim: true
  },
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isChecklistEnabled: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Indexes for multi-tenant performance
testGroupSchema.index({ clientId: 1, name: 1 }, { unique: true }); // Unique name per client
testGroupSchema.index({ clientId: 1, isActive: 1 });

const TestGroup = mongoose.model('TestGroup', testGroupSchema);

export default TestGroup; 