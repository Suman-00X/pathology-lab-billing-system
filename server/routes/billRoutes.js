import express from 'express';
import { billController } from '../controllers/billController.js';

const router = express.Router();

// @route   GET /api/bills
// @desc    Get all bills
// @access  Public
router.get('/', billController.getAllBills);

// @route   GET /api/bills/:id
// @desc    Get single bill
// @access  Public
router.get('/:id', billController.getBillById);

// @route   GET /api/bills/number/:billNumber
// @desc    Get bill by bill number
// @access  Public
router.get('/number/:billNumber', billController.getBillByNumber);

// @route   POST /api/bills
// @desc    Create a new bill
// @access  Public
router.post('/', billController.createBill);

// @route   PUT /api/bills/:id
// @desc    Update a bill
// @access  Public
router.put('/:id', billController.updateBill);

// @route   POST /api/bills/:id/delete
// @desc    Delete a bill (using POST for better body handling)
// @access  Public
router.post('/:id/delete', billController.deleteBill);

// @route   PUT /api/bills/:id/payment
// @desc    Update payment status
// @access  Public
router.put('/:id/payment', billController.updatePaymentStatus);

// @route   GET /api/bills/stats/summary
// @desc    Get bills summary statistics
// @access  Public
router.get('/stats/summary', billController.getBillStats);

export default router; 