import express from 'express';
import {
  getAllPaymentModes,
  getPaymentModeById,
  createPaymentMode,
  updatePaymentMode,
  deletePaymentMode
} from '../controllers/paymentModeController.js';

const router = express.Router();

// GET /api/payment-modes - Get all payment modes
router.get('/', getAllPaymentModes);

// GET /api/payment-modes/:id - Get payment mode by ID
router.get('/:id', getPaymentModeById);

// POST /api/payment-modes - Create new payment mode
router.post('/', createPaymentMode);

// PUT /api/payment-modes/:id - Update payment mode
router.put('/:id', updatePaymentMode);

// DELETE /api/payment-modes/:id - Delete payment mode
router.delete('/:id', deletePaymentMode);

export default router; 