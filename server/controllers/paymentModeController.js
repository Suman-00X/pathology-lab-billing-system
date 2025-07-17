import PaymentMode from '../models/PaymentMode.js';

// Get all payment modes
export const getAllPaymentModes = async (req, res) => {
  try {
    const paymentModes = await PaymentMode.find({ isActive: true }).sort({ name: 1 });
    res.json(paymentModes);
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
};

// Get payment mode by ID
export const getPaymentModeById = async (req, res) => {
  try {
    const paymentMode = await PaymentMode.findById(req.params.id);
    if (!paymentMode) {
      return res.status(404).json({ message: 'Payment mode not found' });
    }
    res.json(paymentMode);
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
};

// Create payment mode
export const createPaymentMode = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Payment mode name is required' });
    }

    // Check if payment mode already exists
    const existingMode = await PaymentMode.findOne({ 
      name: name.trim(), 
      isActive: true 
    });
    if (existingMode) {
      return res.status(400).json({ message: 'Payment mode already exists' });
    }

    const paymentMode = new PaymentMode({
      name: name.trim()
    });

    await paymentMode.save();
    res.status(201).json(paymentMode);
  } catch (error) {

    if (error.code === 11000) {
      res.status(400).json({ message: 'Payment mode name must be unique' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Update payment mode
export const updatePaymentMode = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Payment mode name is required' });
    }

    // Check if another payment mode with same name exists
    const existingMode = await PaymentMode.findOne({ 
      name: name.trim(), 
      _id: { $ne: req.params.id },
      isActive: true 
    });
    if (existingMode) {
      return res.status(400).json({ message: 'Payment mode name already exists' });
    }

    const paymentMode = await PaymentMode.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!paymentMode) {
      return res.status(404).json({ message: 'Payment mode not found' });
    }

    res.json(paymentMode);
  } catch (error) {

    if (error.code === 11000) {
      res.status(400).json({ message: 'Payment mode name must be unique' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Delete payment mode (soft delete)
export const deletePaymentMode = async (req, res) => {
  try {
    const paymentMode = await PaymentMode.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!paymentMode) {
      return res.status(404).json({ message: 'Payment mode not found' });
    }

    res.json({ message: 'Payment mode deleted successfully' });
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
}; 