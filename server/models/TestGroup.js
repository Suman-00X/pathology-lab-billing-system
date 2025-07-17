import mongoose from 'mongoose';

const testGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Test group name is required'],
    trim: true,
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const TestGroup = mongoose.model('TestGroup', testGroupSchema);

export default TestGroup; 