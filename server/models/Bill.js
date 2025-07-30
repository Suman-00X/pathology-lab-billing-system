import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    unique: true
  },
  patient: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 0
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other']
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    }
  },
  referredBy: {
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true
    },
    qualification: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Doctor phone is required'],
      trim: true
    }
  },
  referringCustomer: {
    type: String,
    trim: true
  },
  testGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestGroup',
    required: true
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalWithTax: {
    type: Number,
    required: true,
    min: 0
  },
  toBePaidAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Partially Paid'],
    default: 'Pending'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  dues: {
    type: Number,
    default: 0,
    min: 0
  },
  isPaymentModeEnabled: {
    type: Boolean,
    default: false
  },
  paymentDetails: [{
    mode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentMode',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      default: Date.now
    },
    reference: {
      type: String,
      trim: true
    }
  }],
  billDate: {
    type: Date,
    default: Date.now
  },
  sampleCollectionDate: {
    type: Date,
    default: Date.now
  },
  sampleReceivedDate: {
    type: Date,
    default: Date.now
  },
  reportDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Sample Collected', 'In Progress', 'Completed', 'Delivered'],
    default: 'Sample Collected'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Generate bill number automatically
billSchema.pre('save', async function(next) {
  if (this.isNew) {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    const datePrefix = `${year}${month}${day}`;
    
    // Find the last bill number for today
    const lastBill = await this.constructor.findOne({
      billNumber: new RegExp(`^${datePrefix}`)
    }).sort({ billNumber: -1 });
    
    let sequence = 1;
    if (lastBill) {
      const lastSequence = parseInt(lastBill.billNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.billNumber = `${datePrefix}${sequence.toString().padStart(4, '0')}`;
  }
  next();
});

// Index for faster queries (billNumber already indexed by unique: true)
billSchema.index({ 'patient.name': 'text', 'patient.phone': 'text' });
billSchema.index({ billDate: -1 });
billSchema.index({ status: 1 });

const Bill = mongoose.model('Bill', billSchema);

export default Bill; 