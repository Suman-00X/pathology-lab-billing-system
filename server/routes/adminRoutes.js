import express from 'express';
import adminController from '../controllers/adminController.js';

const router = express.Router();

// Admin routes - only accessible in development mode
router.post('/clients', adminController.createClient);
router.get('/clients', adminController.getAllClients);
router.get('/clients/:id', adminController.getClientById);
router.put('/clients/:id', adminController.updateClient);
router.delete('/clients/:id', adminController.deleteClient);
router.get('/stats', adminController.getSystemStats);

export default router;
