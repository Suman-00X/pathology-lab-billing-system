import express from 'express';
import { reportController } from '../controllers/reportController.js';

const router = express.Router();

// Get a report by bill ID
router.get('/bill/:billId', reportController.getReportByBillId);

// Set report date when report is first generated or printed
router.post('/bill/:billId/set-report-date', reportController.setReportDate);

// Update a report by its own ID
router.put('/:reportId', reportController.updateReport);

export default router; 