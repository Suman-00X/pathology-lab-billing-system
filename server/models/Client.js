import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const clientSchema = new mongoose.Schema({
  // Organization details
  organizationName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Security
  secretPin: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Status and metadata
  isActive: {
    type: Boolean,
    default: true
  },
  isTestClient: {
    type: Boolean,
    default: false
  },
  
  // Additional settings
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    }
  }
}, {
  timestamps: true
});

// Index for performance
clientSchema.index({ email: 1 });
clientSchema.index({ isActive: 1 });

// Hash password before saving
clientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Hash secret pin before saving
clientSchema.pre('save', async function(next) {
  if (!this.isModified('secretPin')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.secretPin = await bcrypt.hash(this.secretPin, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
clientSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Compare secret pin method
clientSchema.methods.compareSecretPin = async function(candidatePin) {
  return bcrypt.compare(candidatePin, this.secretPin);
};

// Transform output (remove sensitive data)
clientSchema.methods.toJSON = function() {
  const clientObject = this.toObject();
  delete clientObject.password;
  delete clientObject.secretPin;
  return clientObject;
};

const Client = mongoose.model('Client', clientSchema);

export default Client;
