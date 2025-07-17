import express from 'express';
import { referredDoctorController } from '../controllers/referredDoctorController.js';

const router = express.Router();

// Get all doctors with pagination and search
router.get('/', referredDoctorController.getAllDoctors);

// Search doctor by mobile number (for auto-fill in forms)
router.get('/search/mobile/:mobile', referredDoctorController.searchByMobile);

// Get single doctor by ID
router.get('/:id', referredDoctorController.getDoctorById);

// Create new doctor
router.post('/', referredDoctorController.createDoctor);

// Update doctor
router.put('/:id', referredDoctorController.updateDoctor);

// Delete doctor
router.delete('/:id', referredDoctorController.deleteDoctor);

// Get bills by doctor ID
router.get('/:id/bills', referredDoctorController.getDoctorBills);

export default router; 