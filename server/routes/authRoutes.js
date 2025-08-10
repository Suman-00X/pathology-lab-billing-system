import express from 'express';
import authController from '../controllers/authController.js';
import { authenticateClient } from '../middleware/auth.js';

const router = express.Router();

// Authentication routes
router.post('/login', authController.login);
router.post('/verify-pin', authenticateClient, authController.verifyPin);
router.get('/me', authenticateClient, authController.getMe);
router.post('/change-password', authenticateClient, authController.changePassword);
router.post('/change-pin', authenticateClient, authController.changeSecretPin);

export default router;
