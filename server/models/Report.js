import mongoose from 'mongoose';

const reportResultSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  units: {
    type: String
  },
  normalRange: {
    type: String,
    required: true
  },
  result: {
    type: String,
    trim: true,
    default: ''
  },
  flag: {
    type: String,
    enum: ['Normal', 'Low', 'High', ''],
    default: ''
  }
}, { _id: false });

const reportSchema = new mongoose.Schema({
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true,
    unique: true
  },
  reportDate: {
    type: Date,
    default: null
  },
  results: [reportResultSchema]
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

export default Report; 