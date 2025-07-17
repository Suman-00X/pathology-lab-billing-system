import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
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
  methodology: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Test = mongoose.model('Test', testSchema);

export default Test; 