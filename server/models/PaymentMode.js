import mongoose from 'mongoose';

const paymentModeSchema = new mongoose.Schema({
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
    trim: true,
    unique: false // Will be unique per client via compound index
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for multi-tenant performance
paymentModeSchema.index({ clientId: 1, name: 1 }, { unique: true }); // Unique name per client
paymentModeSchema.index({ clientId: 1, isActive: 1 });

const PaymentMode = mongoose.model('PaymentMode', paymentModeSchema);

export default PaymentMode; 