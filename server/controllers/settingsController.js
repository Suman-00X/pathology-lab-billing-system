import Settings from '../models/Settings.js';

// Get settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new Settings({
        taxPercentage: 0,
        taxEnabled: true,
        paymentModeEnabled: true,
        currency: 'INR',
        currencySymbol: '₹'
      });
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    const { taxPercentage, taxEnabled, paymentModeEnabled, currency, currencySymbol } = req.body;
    
    // Validate tax percentage
    if (taxPercentage !== undefined) {
      if (isNaN(taxPercentage) || taxPercentage < 0 || taxPercentage > 100) {
        return res.status(400).json({ message: 'Tax percentage must be between 0 and 100' });
      }
    }

    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create new settings if none exist
      settings = new Settings({
        taxPercentage: taxPercentage || 0,
        taxEnabled: taxEnabled !== undefined ? taxEnabled : true,
        paymentModeEnabled: paymentModeEnabled !== undefined ? paymentModeEnabled : true,
        currency: currency || 'INR',
        currencySymbol: currencySymbol || '₹'
      });
    } else {
      // Update existing settings
      if (taxPercentage !== undefined) settings.taxPercentage = taxPercentage;
      if (taxEnabled !== undefined) settings.taxEnabled = taxEnabled;
      if (paymentModeEnabled !== undefined) settings.paymentModeEnabled = paymentModeEnabled;
      if (currency !== undefined) settings.currency = currency;
      if (currencySymbol !== undefined) settings.currencySymbol = currencySymbol;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 