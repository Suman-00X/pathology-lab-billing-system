import mongoose from 'mongoose';

const referredDoctorSchema = new mongoose.Schema({
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

// Index for faster searches
referredDoctorSchema.index({ name: 'text', phone: 'text' });

const ReferredDoctor = mongoose.model('ReferredDoctor', referredDoctorSchema);

export default ReferredDoctor; 