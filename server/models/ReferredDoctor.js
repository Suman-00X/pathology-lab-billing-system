import mongoose from 'mongoose';

const referredDoctorSchema = new mongoose.Schema({
  // Multi-tenant support
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Phone number must be exactly 10 digits'
    }
  },
  qualification: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for multi-tenant performance
referredDoctorSchema.index({ clientId: 1, phone: 1 }, { unique: true }); // Unique phone per client
referredDoctorSchema.index({ clientId: 1, name: 1 });

const ReferredDoctor = mongoose.model('ReferredDoctor', referredDoctorSchema);

export default ReferredDoctor; 