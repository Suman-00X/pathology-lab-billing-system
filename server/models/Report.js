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
  // Multi-tenant support
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true,
    unique: false // Will be unique via compound index with clientId
  },
  reportDate: {
    type: Date,
    default: null
  },
  results: [reportResultSchema]
}, { timestamps: true });

// Indexes for multi-tenant performance
reportSchema.index({ clientId: 1, bill: 1 }, { unique: true }); // Unique bill per client
reportSchema.index({ clientId: 1, reportDate: -1 });

const Report = mongoose.model('Report', reportSchema);

export default Report; 