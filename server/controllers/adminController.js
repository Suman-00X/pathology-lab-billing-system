import Client from '../models/Client.js';
import Bill from '../models/Bill.js';
import TestGroup from '../models/TestGroup.js';
import Test from '../models/Test.js';
import PaymentMode from '../models/PaymentMode.js';
import ReferredDoctor from '../models/ReferredDoctor.js';
import Lab from '../models/Lab.js';
import Settings from '../models/Settings.js';
import Report from '../models/Report.js';

// Admin controller - only accessible in development mode
const adminController = {
  // Create a new client organization
  async createClient(req, res) {
    try {
      // Check if running in development mode
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Admin panel is only accessible in development mode' });
      }

      const { organizationName, email, password, secretPin, isTestClient } = req.body;

      // Validate required fields
      if (!organizationName || !email || !password || !secretPin) {
        return res.status(400).json({ 
          message: 'Organization name, email, password, and secret PIN are required' 
        });
      }

      // Check if client already exists
      const existingClient = await Client.findOne({ email: email.toLowerCase() });
      if (existingClient) {
        return res.status(409).json({ message: 'Client with this email already exists' });
      }

      // Create new client
      const newClient = new Client({
        organizationName,
        email: email.toLowerCase(),
        password,
        secretPin,
        isTestClient: isTestClient || false
      });

      await newClient.save();

      // Create default settings for the client
      const defaultSettings = new Settings({
        clientId: newClient._id,
        taxPercentage: 0,
        taxEnabled: true,
        paymentModeEnabled: true,
        printHeaderEnabled: true,
        currency: 'INR',
        currencySymbol: '₹'
      });
      await defaultSettings.save();

      res.status(201).json({ 
        message: 'Client created successfully', 
        client: newClient 
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating client', error: error.message });
    }
  },

  // Get all clients
  async getAllClients(req, res) {
    try {
      // Check if running in development mode
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Admin panel is only accessible in development mode' });
      }

      const clients = await Client.find().sort({ createdAt: -1 });
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching clients', error: error.message });
    }
  },

  // Get client by ID
  async getClientById(req, res) {
    try {
      // Check if running in development mode
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Admin panel is only accessible in development mode' });
      }

      const client = await Client.findById(req.params.id);
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }

      // Get stats for the client
      const stats = await Promise.all([
        Bill.countDocuments({ clientId: client._id }),
        TestGroup.countDocuments({ clientId: client._id }),
        Test.countDocuments({ clientId: client._id }),
        PaymentMode.countDocuments({ clientId: client._id }),
        ReferredDoctor.countDocuments({ clientId: client._id })
      ]);

      res.json({
        client,
        stats: {
          bills: stats[0],
          testGroups: stats[1],
          tests: stats[2],
          paymentModes: stats[3],
          doctors: stats[4]
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching client', error: error.message });
    }
  },

  // Update client
  async updateClient(req, res) {
    try {
      // Check if running in development mode
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Admin panel is only accessible in development mode' });
      }

      const { organizationName, email, isActive, isTestClient } = req.body;
      
      const updatedClient = await Client.findByIdAndUpdate(
        req.params.id,
        { organizationName, email, isActive, isTestClient },
        { new: true, runValidators: true }
      );

      if (!updatedClient) {
        return res.status(404).json({ message: 'Client not found' });
      }

      res.json({ message: 'Client updated successfully', client: updatedClient });
    } catch (error) {
      res.status(500).json({ message: 'Error updating client', error: error.message });
    }
  },

  // Delete client and all associated data
  async deleteClient(req, res) {
    try {
      // Check if running in development mode
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Admin panel is only accessible in development mode' });
      }

      const clientId = req.params.id;
      const client = await Client.findById(clientId);
      
      if (!client) {
        return res.status(404).json({ message: 'Client not found' });
      }

      // Delete all associated data
      await Promise.all([
        Bill.deleteMany({ clientId }),
        Report.deleteMany({ clientId }),
        TestGroup.deleteMany({ clientId }),
        Test.deleteMany({ clientId }),
        PaymentMode.deleteMany({ clientId }),
        ReferredDoctor.deleteMany({ clientId }),
        Lab.deleteMany({ clientId }),
        Settings.deleteMany({ clientId })
      ]);

      // Delete the client
      await Client.findByIdAndDelete(clientId);

      res.json({ message: 'Client and all associated data deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting client', error: error.message });
    }
  },

  // Get system stats
  async getSystemStats(req, res) {
    try {
      // Check if running in development mode
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Admin panel is only accessible in development mode' });
      }

      const stats = await Promise.all([
        Client.countDocuments(),
        Client.countDocuments({ isActive: true }),
        Client.countDocuments({ isTestClient: true }),
        Bill.countDocuments(),
        TestGroup.countDocuments(),
        Test.countDocuments()
      ]);

      res.json({
        totalClients: stats[0],
        activeClients: stats[1],
        testClients: stats[2],
        totalBills: stats[3],
        totalTestGroups: stats[4],
        totalTests: stats[5]
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching system stats', error: error.message });
    }
  }
};

export default adminController;
