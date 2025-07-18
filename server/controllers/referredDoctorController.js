import ReferredDoctor from '../models/ReferredDoctor.js';
import Bill from '../models/Bill.js';

export const referredDoctorController = {
  // Helper function to update all bills that reference a doctor
  async updateBillsForDoctor(oldPhone, newDoctorData) {
    try {
      const { name, phone, qualification } = newDoctorData;
      
      // Update all bills that reference this doctor by old phone number
      const updateResult = await Bill.updateMany(
        { 'referredBy.phone': oldPhone },
        {
          $set: {
            'referredBy.doctorName': name,
            'referredBy.phone': phone,
            'referredBy.qualification': qualification
          }
        }
      );

      console.log(`Updated ${updateResult.modifiedCount} bills for doctor: ${name}`);
      return updateResult;
    } catch (error) {
      console.error('Error updating bills for doctor:', error);
      throw error;
    }
  },
  // Get all doctors with optional search and pagination
  async getAllDoctors(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        searchBy = 'all', // 'all', 'name', 'phone'
        sortBy = 'createdAt', // 'createdAt', 'name', 'phone', 'totalAmount', 'billCount'
        sortOrder = 'desc', // 'asc' or 'desc'
        startDate, 
        endDate 
      } = req.query;
      
      let filter = {};
      
      // Enhanced search functionality
      if (search && search.trim()) {
        const searchTerm = search.trim();
        const searchRegex = { $regex: searchTerm, $options: 'i' };
        
        if (searchBy === 'all') {
          // Search across all fields
          filter.$or = [
            { name: searchRegex },
            { phone: searchRegex },
            { qualification: searchRegex }
          ];
        } else if (searchBy === 'name') {
          filter.name = searchRegex;
        } else if (searchBy === 'phone') {
          filter.phone = searchRegex;
        }
      }

      const skip = (page - 1) * limit;
      
      // Build sort object for doctors query
      let doctorSortObject = {};
      if (sortBy === 'createdAt') {
        doctorSortObject.createdAt = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'name') {
        doctorSortObject.name = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'phone') {
        doctorSortObject.phone = sortOrder === 'asc' ? 1 : -1;
      } else {
        // Default sort by creation date
        doctorSortObject.createdAt = -1;
      }
      
      // Get doctors with pagination
      const doctors = await ReferredDoctor.find(filter)
        .sort(doctorSortObject)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await ReferredDoctor.countDocuments(filter);

      // Calculate total amounts for each doctor
      const doctorsWithTotals = await Promise.all(
        doctors.map(async (doctor) => {
          // Build date filter for bills
          let billDateFilter = {};
          if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            billDateFilter.billDate = { $gte: start, $lte: end };
          }

          // Aggregate bills for this doctor
          const result = await Bill.aggregate([
            {
              $match: {
                'referredBy.doctorName': doctor.name,
                'referredBy.phone': doctor.phone,
                ...billDateFilter
              }
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$finalAmount' },
                billCount: { $sum: 1 }
              }
            }
          ]);

          const doctorData = doctor.toObject();
          doctorData.totalReferredAmount = result.length > 0 ? result[0].totalAmount : 0;
          doctorData.totalBillsReferred = result.length > 0 ? result[0].billCount : 0;
          
          return doctorData;
        })
      );

      // Apply sorting based on calculated fields if needed
      if (sortBy === 'totalAmount') {
        doctorsWithTotals.sort((a, b) => {
          const comparison = a.totalReferredAmount - b.totalReferredAmount;
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      } else if (sortBy === 'billCount') {
        doctorsWithTotals.sort((a, b) => {
          const comparison = a.totalBillsReferred - b.totalBillsReferred;
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      }

      res.json({
        doctors: doctorsWithTotals,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        searchBy,
        sortBy,
        sortOrder
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }
  },

  // Get single doctor by ID
  async getDoctorById(req, res) {
    try {
      const doctor = await ReferredDoctor.findById(req.params.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching doctor', error: error.message });
    }
  },

  // Create new doctor
  async createDoctor(req, res) {
    try {
      const { name, phone, qualification } = req.body;
      
      // Check if doctor with this phone already exists
      const existingDoctor = await ReferredDoctor.findOne({ phone });
      if (existingDoctor) {
        return res.status(400).json({ message: 'Doctor with this phone number already exists' });
      }

      const newDoctor = new ReferredDoctor({
        name: name.trim(),
        phone: phone.trim(),
        qualification: qualification?.trim() || ''
      });

      await newDoctor.save();
      res.status(201).json({ message: 'Doctor created successfully', doctor: newDoctor });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Doctor with this phone number already exists' });
      }
      res.status(500).json({ message: 'Error creating doctor', error: error.message });
    }
  },

  // Update doctor
  async updateDoctor(req, res) {
    try {
      const { name, phone, qualification } = req.body;
      
      // Get the existing doctor to check for mobile number changes
      const existingDoctor = await ReferredDoctor.findById(req.params.id);
      if (!existingDoctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      const oldPhone = existingDoctor.phone;
      const newPhone = phone.trim();
      
      // If mobile number is changing, we need to create a new doctor and update bills
      if (oldPhone !== newPhone) {
        // Check if another doctor already has this new phone number
        const doctorWithNewPhone = await ReferredDoctor.findOne({ 
          phone: newPhone, 
          _id: { $ne: req.params.id } 
        });
        
        if (doctorWithNewPhone) {
          return res.status(400).json({ 
            message: 'Another doctor with this phone number already exists' 
          });
        }

        // Create new doctor with new mobile number
        const newDoctor = new ReferredDoctor({
          name: name.trim(),
          phone: newPhone,
          qualification: qualification?.trim() || ''
        });
        await newDoctor.save();

        // Update all bills that reference the old doctor to point to new doctor
        await this.updateBillsForDoctor(oldPhone, {
          name: name.trim(),
          phone: newPhone,
          qualification: qualification?.trim() || ''
        });

        // Keep the old doctor record for historical purposes (don't delete)
        // but you could optionally mark it as inactive
        
        res.json({ 
          message: 'New doctor created and all bills updated successfully', 
          doctor: newDoctor,
          billsUpdated: true
        });
      } else {
        // Mobile number is not changing, just update the existing doctor
        // Check if another doctor has this phone number
        const existingDoctorWithPhone = await ReferredDoctor.findOne({ 
          phone: newPhone, 
          _id: { $ne: req.params.id } 
        });
        if (existingDoctorWithPhone) {
          return res.status(400).json({ 
            message: 'Another doctor with this phone number already exists' 
          });
        }

        // Update the existing doctor
        const updatedDoctor = await ReferredDoctor.findByIdAndUpdate(
          req.params.id,
          {
            name: name.trim(),
            phone: newPhone,
            qualification: qualification?.trim() || ''
          },
          { new: true, runValidators: true }
        );

        // Update all bills that reference this doctor
        await this.updateBillsForDoctor(oldPhone, {
          name: name.trim(),
          phone: newPhone,
          qualification: qualification?.trim() || ''
        });

        res.json({ 
          message: 'Doctor updated successfully and all bills updated', 
          doctor: updatedDoctor,
          billsUpdated: true
        });
      }
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'Another doctor with this phone number already exists' 
        });
      }
      res.status(500).json({ 
        message: 'Error updating doctor', 
        error: error.message 
      });
    }
  },

  // Delete doctor
  async deleteDoctor(req, res) {
    try {
      // Check if doctor has any bills
      const billCount = await Bill.countDocuments({
        $or: [
          { 'referredBy.doctorName': { $exists: true } },
          { 'referredBy.phone': { $exists: true } }
        ]
      });

      const doctor = await ReferredDoctor.findById(req.params.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      // Check if this specific doctor has bills
      const doctorBillCount = await Bill.countDocuments({
        'referredBy.doctorName': doctor.name,
        'referredBy.phone': doctor.phone
      });

      if (doctorBillCount > 0) {
        return res.status(400).json({ 
          message: `Cannot delete doctor. ${doctorBillCount} bills are associated with this doctor.` 
        });
      }

      await ReferredDoctor.findByIdAndDelete(req.params.id);
      res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting doctor', error: error.message });
    }
  },

  // Get bills by doctor ID
  async getDoctorBills(req, res) {
    try {
      const { page = 1, limit = 10, startDate, endDate } = req.query;
      
      const doctor = await ReferredDoctor.findById(req.params.id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      // Build date filter
      let dateFilter = {};
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.billDate = { $gte: start, $lte: end };
      }

      const filter = {
        'referredBy.doctorName': doctor.name,
        'referredBy.phone': doctor.phone,
        ...dateFilter
      };

      const skip = (page - 1) * limit;
      
      const bills = await Bill.find(filter)
        .populate({ path: 'testGroups', select: 'name price' })
        .sort({ billDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Bill.countDocuments(filter);

      res.json({
        bills,
        doctor: {
          _id: doctor._id,
          name: doctor.name,
          phone: doctor.phone,
          qualification: doctor.qualification
        },
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching doctor bills', error: error.message });
    }
  },

  // Find or create doctor (for bill creation)
  async findOrCreateDoctor(doctorData) {
    try {
      const { doctorName, phone, qualification } = doctorData;
      
      // Try to find existing doctor by phone
      let doctor = await ReferredDoctor.findOne({ phone: phone.trim() });
      
      if (!doctor) {
        // Create new doctor if none exists with this phone
        doctor = new ReferredDoctor({
          name: doctorName.trim(),
          phone: phone.trim(),
          qualification: qualification?.trim() || ''
        });
        await doctor.save();
      } else {
        // If doctor exists with same phone, only update name and qualification if they're different
        // This preserves the doctor record integrity while allowing minor updates
        let needsUpdate = false;
        
        const newName = doctorName.trim();
        const newQualification = qualification?.trim() || '';
        
        if (doctor.name !== newName) {
          doctor.name = newName;
          needsUpdate = true;
        }
        
        if (doctor.qualification !== newQualification) {
          doctor.qualification = newQualification;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await doctor.save();
        }
      }
      
      return doctor;
    } catch (error) {
      throw new Error(`Error managing doctor: ${error.message}`);
    }
  },

  // Search doctor by mobile number (for auto-fill in forms)
  async searchByMobile(req, res) {
    try {
      const { mobile } = req.params;
      
      // Validate mobile number format
      if (!/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({ message: 'Invalid mobile number format. Must be exactly 10 digits.' });
      }

      const doctor = await ReferredDoctor.findOne({ phone: mobile });
      
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found with this mobile number' });
      }

      res.json({
        message: 'Doctor found',
        doctor: {
          _id: doctor._id,
          name: doctor.name,
          phone: doctor.phone,
          qualification: doctor.qualification
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error searching doctor', error: error.message });
    }
  }
}; 