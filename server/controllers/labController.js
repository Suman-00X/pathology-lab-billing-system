import Lab from '../models/Lab.js';
import fs from 'fs';
import path from 'path';

export const labController = {
  // Get lab details
  async getLabDetails(req, res) {
    try {
      const labs = await Lab.find().sort({ createdAt: -1 });
      
      // Return the first (most recent) lab or empty object
      const lab = labs.length > 0 ? labs[0] : null;
      res.json(lab);
    } catch (error) {
  
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get lab by ID
  async getLabById(req, res) {
    try {
      const lab = await Lab.findById(req.params.id);
      
      if (!lab) {
        return res.status(404).json({ message: 'Lab not found' });
      }
      
      res.json(lab);
    } catch (error) {
  
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create or update lab details
  async createOrUpdateLab(req, res) {
    try {
      const {
        name,
        address,
        gstNumber,
        pathologistName,
        contactInfo
      } = req.body;

      // Parse address and contactInfo if they're strings (for form data)
      const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
      const parsedContactInfo = typeof contactInfo === 'string' ? JSON.parse(contactInfo) : contactInfo;

      let logoPath = null;
      if (req.file) {
        logoPath = `/uploads/logos/${req.file.filename}`;
      }

      // Check if lab already exists (we only want one lab configuration)
      const existingLab = await Lab.findOne();

      if (existingLab) {
        // Update existing lab
        const updateData = {
          name,
          address: parsedAddress,
          gstNumber,
          pathologistName,
          contactInfo: parsedContactInfo
        };

        if (logoPath) {
          // Delete old logo if exists
          if (existingLab.logo) {
            const oldLogoPath = path.join(process.cwd(), 'uploads/logos', path.basename(existingLab.logo));
            if (fs.existsSync(oldLogoPath)) {
              fs.unlinkSync(oldLogoPath);
            }
          }
          updateData.logo = logoPath;
        }

        const lab = await Lab.findByIdAndUpdate(
          existingLab._id,
          updateData,
          { new: true }
        );

        res.json({ message: 'Lab details updated successfully', lab });
      } else {
        // Create new lab
        const lab = new Lab({
          name,
          address: parsedAddress,
          gstNumber,
          pathologistName,
          contactInfo: parsedContactInfo,
          logo: logoPath
        });

        await lab.save();
        res.status(201).json({ message: 'Lab details created successfully', lab });
      }
    } catch (error) {
  
      
      // Clean up uploaded file if there's an error
      if (req.file) {
        const filePath = req.file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update lab details
  async updateLab(req, res) {
    try {
      const {
        name,
        address,
        gstNumber,
        pathologistName,
        contactInfo
      } = req.body;

      // Parse address and contactInfo if they're strings (for form data)
      const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
      const parsedContactInfo = typeof contactInfo === 'string' ? JSON.parse(contactInfo) : contactInfo;

      let logoPath = null;
      if (req.file) {
        logoPath = `/uploads/logos/${req.file.filename}`;
      }

      const lab = await Lab.findById(req.params.id);
      if (!lab) {
        // Clean up uploaded file if lab not found
        if (req.file) {
          const filePath = req.file.path;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        return res.status(404).json({ message: 'Lab not found' });
      }

      const updateData = {
        name,
        address: parsedAddress,
        gstNumber,
        pathologistName,
        contactInfo: parsedContactInfo
      };

      if (logoPath) {
        // Delete old logo if exists
        if (lab.logo) {
          const oldLogoPath = path.join(process.cwd(), 'uploads/logos', path.basename(lab.logo));
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        }
        updateData.logo = logoPath;
      }

      const updatedLab = await Lab.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.json({ message: 'Lab details updated successfully', lab: updatedLab });
    } catch (error) {
  
      
      // Clean up uploaded file if there's an error
      if (req.file) {
        const filePath = req.file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete lab
  async deleteLab(req, res) {
    try {
      const lab = await Lab.findById(req.params.id);
      
      if (!lab) {
        return res.status(404).json({ message: 'Lab not found' });
      }

      // Delete logo file if exists
      if (lab.logo) {
        const logoPath = path.join(process.cwd(), 'uploads/logos', path.basename(lab.logo));
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
        }
      }

      await Lab.findByIdAndDelete(req.params.id);
      res.json({ message: 'Lab deleted successfully' });
    } catch (error) {
  
      res.status(500).json({ message: 'Server error' });
    }
  }
}; 