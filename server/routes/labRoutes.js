import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/config.js';
import { labController } from '../controllers/labController.js';

const router = express.Router();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for logo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/logos'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE // Use config for file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @route   GET /api/lab
// @desc    Get lab details
// @access  Public
router.get('/', labController.getLabDetails);

// @route   POST /api/lab
// @desc    Create or update lab details
// @access  Public
router.post('/', upload.single('logo'), labController.createOrUpdateLab);

// @route   PUT /api/lab/:id
// @desc    Update lab details
// @access  Public
router.put('/:id', upload.single('logo'), labController.updateLab);

// @route   DELETE /api/lab/:id
// @desc    Delete lab details
// @access  Public
router.delete('/:id', labController.deleteLab);

export default router; 