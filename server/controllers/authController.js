import Client from '../models/Client.js';
import { generateToken } from '../middleware/auth.js';

const authController = {
  // Client login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find client by email
      const client = await Client.findOne({ email: email.toLowerCase() });
      if (!client) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if client is active
      if (!client.isActive) {
        return res.status(401).json({ message: 'Account is deactivated. Please contact administrator.' });
      }

      // Verify password
      const isValidPassword = await client.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken(client._id);

      res.json({
        message: 'Login successful',
        token,
        client: {
          id: client._id,
          organizationName: client.organizationName,
          email: client.email,
          isTestClient: client.isTestClient
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error during login', error: error.message });
    }
  },

  // Verify secret PIN
  async verifyPin(req, res) {
    try {
      const { secretPin } = req.body;

      if (!secretPin) {
        return res.status(400).json({ message: 'Secret PIN is required' });
      }

      if (!req.client) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const isValidPin = await req.client.compareSecretPin(secretPin);
      if (!isValidPin) {
        return res.status(403).json({ message: 'Invalid secret PIN' });
      }

      res.json({ message: 'PIN verified successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error verifying PIN', error: error.message });
    }
  },

  // Get current client info
  async getMe(req, res) {
    try {
      if (!req.client) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      res.json({
        client: {
          id: req.client._id,
          organizationName: req.client.organizationName,
          email: req.client.email,
          isTestClient: req.client.isTestClient,
          settings: req.client.settings
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching client info', error: error.message });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }

      if (!req.client) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Verify current password
      const isValidPassword = await req.client.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(403).json({ message: 'Current password is incorrect' });
      }

      // Update password
      req.client.password = newPassword;
      await req.client.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error changing password', error: error.message });
    }
  },

  // Change secret PIN
  async changeSecretPin(req, res) {
    try {
      const { currentPin, newPin } = req.body;

      if (!currentPin || !newPin) {
        return res.status(400).json({ message: 'Current PIN and new PIN are required' });
      }

      if (newPin.length < 6) {
        return res.status(400).json({ message: 'New PIN must be at least 6 characters long' });
      }

      if (!req.client) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Verify current PIN
      const isValidPin = await req.client.compareSecretPin(currentPin);
      if (!isValidPin) {
        return res.status(403).json({ message: 'Current PIN is incorrect' });
      }

      // Update PIN
      req.client.secretPin = newPin;
      await req.client.save();

      res.json({ message: 'Secret PIN changed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error changing secret PIN', error: error.message });
    }
  }
};

export default authController;
