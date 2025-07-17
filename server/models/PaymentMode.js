import mongoose from 'mongoose';

const paymentModeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries (name already indexed by unique: true)
paymentModeSchema.index({ isActive: 1 });

const PaymentMode = mongoose.model('PaymentMode', paymentModeSchema);

export default PaymentMode; 