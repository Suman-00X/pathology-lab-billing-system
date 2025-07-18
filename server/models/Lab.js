import mongoose from 'mongoose';

const labSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String, // File path to uploaded logo
    default: null
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    }
  },
  gstNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null/undefined values while maintaining uniqueness for actual values
    trim: true
  },
  pathologistName: {
    type: String,
    required: true,
    trim: true
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

const Lab = mongoose.model('Lab', labSchema);

export default Lab; 