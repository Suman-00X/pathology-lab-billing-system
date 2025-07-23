import Bill from '../models/Bill.js';
import TestGroup from '../models/TestGroup.js';
import Report from '../models/Report.js';
import Settings from '../models/Settings.js';
import ReferredDoctor from '../models/ReferredDoctor.js';
import { referredDoctorController } from './referredDoctorController.js';

export const billController = {
  // Create a new bill and its corresponding report
  async createBill(req, res) {
    try {
      const { patient, referredBy, testGroups: testGroupIds, toBePaidAmount, paymentDetails = [], paidAmount, dues = 0, notes, isPaymentModeEnabled } = req.body;

      if (!testGroupIds || testGroupIds.length === 0) {
        return res.status(400).json({ message: 'At least one test group is required.' });
      }

      // Create or update the referred doctor in the database
      if (referredBy && referredBy.doctorName && referredBy.phone) {
        try {
          await referredDoctorController.findOrCreateDoctor({
            doctorName: referredBy.doctorName,
            phone: referredBy.phone,
            qualification: referredBy.qualification || ''
          });
        } catch (doctorError) {
          console.error('Error managing doctor:', doctorError.message);
          // Continue with bill creation even if doctor save fails
        }
      }

      // Fetch test groups and calculate total amount
      const testGroups = await TestGroup.find({ '_id': { $in: testGroupIds } }).populate('tests');
      if (testGroups.length !== testGroupIds.length) {
        return res.status(400).json({ message: 'One or more invalid test groups provided.' });
      }

      // Get settings
      const settings = await Settings.findOne() || { taxPercentage: 0, taxEnabled: true, paymentModeEnabled: true };
      
      const totalAmount = testGroups.reduce((sum, group) => sum + group.price, 0);
      
      // Calculate tax only if enabled
      const taxAmount = settings.taxEnabled ? (totalAmount * settings.taxPercentage) / 100 : 0;
      const totalWithTax = totalAmount + taxAmount;
      
      // Calculate discount and final amount
      const discount = totalWithTax - (toBePaidAmount || totalWithTax);
      const finalAmount = toBePaidAmount || totalWithTax;

      // Calculate paid amount based on payment mode
      let totalPayments = 0;
      if (isPaymentModeEnabled) {
        // Payment mode enabled: calculate from paymentDetails only
        totalPayments = paymentDetails.length > 0 
          ? paymentDetails.reduce((sum, payment) => Number(sum) + Number(payment.amount || 0), 0) 
          : 0;
      } else {
        // Payment mode disabled: use paidAmount from request
        totalPayments = paidAmount !== undefined ? Number(paidAmount) : 0;
      }



             // Create and save the new bill
       const newBill = new Bill({
         patient,
         referredBy,
         testGroups: testGroupIds,
         totalAmount,
         taxAmount,
         totalWithTax,
         toBePaidAmount,
         discount,
         finalAmount,
         paymentDetails,
         paidAmount: Number(totalPayments),
         dues: Number(dues),
         isPaymentModeEnabled: Boolean(isPaymentModeEnabled),
         paymentStatus: (() => {
           if (totalPayments >= finalAmount) return 'Paid';
           if (totalPayments > 0) return 'Partially Paid';
           return 'Pending';
         })(),
         notes
       });
      await newBill.save();
        
        // Create the corresponding report
      const reportResults = [];
      for (const group of testGroups) {
        for (const test of group.tests) {
          reportResults.push({
            test: test._id,
            name: test.name,
            methodology: test.methodology,
            normalRange: test.normalRange
          });
        }
      }

      const newReport = new Report({
        bill: newBill._id,
        results: reportResults
      });
      await newReport.save();

      await newBill.populate([
        { path: 'testGroups', select: 'name price' },
        { path: 'paymentDetails.mode', select: 'name' }
      ]);
      res.status(201).json({ message: 'Bill created successfully', bill: newBill });

    } catch (error) {

      res.status(500).json({ message: 'Error creating bill', error: error.message });
    }
  },

  // Delete a bill and its corresponding report
  async deleteBill(req, res) {
    try {
      const bill = await Bill.findByIdAndDelete(req.params.id);
      if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
      }

      // Delete the corresponding report
      await Report.deleteOne({ bill: bill._id });

      res.json({ message: 'Bill and associated report deleted successfully' });
    } catch (error) {

      res.status(500).json({ message: 'Error deleting bill', error: error.message });
    }
  },

  // Update bill
  async updateBill(req, res) {
    try {
             const {
         patient,
         referredBy,
         testGroups: testGroupIds,
         toBePaidAmount,
         paymentDetails,
         paymentStatus,
         paidAmount,
         dues,
         status,
         reportDate,
         notes,
         isPaymentModeEnabled
       } = req.body;

      const billToUpdate = await Bill.findById(req.params.id);
      if (!billToUpdate) {
        return res.status(404).json({ message: 'Bill not found' });
      }

      // Update basic fields
      if (patient) billToUpdate.patient = patient;
      if (referredBy) {
        billToUpdate.referredBy = referredBy;
        
        // Update or create the referred doctor in the database
        if (referredBy.doctorName && referredBy.phone) {
          try {
            await referredDoctorController.findOrCreateDoctor({
              doctorName: referredBy.doctorName,
              phone: referredBy.phone,
              qualification: referredBy.qualification || ''
            });
          } catch (doctorError) {
            console.error('Error managing doctor during update:', doctorError.message);
            // Continue with bill update even if doctor save fails
          }
        }
      }
             if (paymentStatus) billToUpdate.paymentStatus = paymentStatus;
       if (paidAmount !== undefined) billToUpdate.paidAmount = Number(paidAmount);
       if (dues !== undefined) billToUpdate.dues = Number(dues);
       if (status) billToUpdate.status = status;
       if (reportDate) billToUpdate.reportDate = reportDate;
       if (notes !== undefined) billToUpdate.notes = notes;
       if (isPaymentModeEnabled !== undefined) billToUpdate.isPaymentModeEnabled = Boolean(isPaymentModeEnabled);

      // If test groups are being updated, recalculate totals and update the report
      if (testGroupIds) {
        const testGroups = await TestGroup.find({ '_id': { $in: testGroupIds } }).populate('tests');
        if (testGroups.length !== testGroupIds.length) {
          return res.status(400).json({ message: 'One or more invalid test groups provided.' });
        }
        
        billToUpdate.testGroups = testGroupIds;
        
        // Get settings and recalculate amounts
        const settings = await Settings.findOne() || { taxPercentage: 0, taxEnabled: true, paymentModeEnabled: true };
        billToUpdate.totalAmount = testGroups.reduce((sum, group) => sum + group.price, 0);
        billToUpdate.taxAmount = settings.taxEnabled ? (billToUpdate.totalAmount * settings.taxPercentage) / 100 : 0;
        billToUpdate.totalWithTax = billToUpdate.totalAmount + billToUpdate.taxAmount;

        // Update the corresponding report
        const reportResults = [];
        for (const group of testGroups) {
          for (const test of group.tests) {
            reportResults.push({
              test: test._id,
              name: test.name,
              methodology: test.methodology,
              normalRange: test.normalRange,
            });
          }
        }
        await Report.findOneAndUpdate({ bill: billToUpdate._id }, { results: reportResults });
      }

      // Handle toBePaidAmount and recalculate discount
      if (toBePaidAmount !== undefined) {
        billToUpdate.toBePaidAmount = toBePaidAmount;
        billToUpdate.discount = billToUpdate.totalWithTax - toBePaidAmount;
        billToUpdate.finalAmount = toBePaidAmount;
      } else {
        billToUpdate.finalAmount = billToUpdate.totalWithTax - billToUpdate.discount;
      }

      // Handle payment details and paid amount
      if (paymentDetails !== undefined) {
        billToUpdate.paymentDetails = paymentDetails;
        
        if (billToUpdate.isPaymentModeEnabled) {
          // When payment mode is enabled, calculate from payment details
          const totalPayments = paymentDetails.reduce((sum, payment) => Number(sum) + Number(payment.amount || 0), 0);
          billToUpdate.paidAmount = totalPayments;
        } else if (paidAmount !== undefined) {
          // When payment mode is disabled, use the paidAmount directly from request
          billToUpdate.paidAmount = Number(paidAmount);
        }
        
        // Update payment status based on paid amount
        if (billToUpdate.paidAmount >= billToUpdate.finalAmount) {
          billToUpdate.paymentStatus = 'Paid';
        } else if (billToUpdate.paidAmount > 0) {
          billToUpdate.paymentStatus = 'Partially Paid';
        } else {
          billToUpdate.paymentStatus = 'Pending';
        }
      } else if (paidAmount !== undefined) {
        // When payment mode is disabled, use the paidAmount directly from request
        billToUpdate.paidAmount = Number(paidAmount);
        
        // Update payment status based on paid amount
        if (billToUpdate.paidAmount >= billToUpdate.finalAmount) {
          billToUpdate.paymentStatus = 'Paid';
        } else if (billToUpdate.paidAmount > 0) {
          billToUpdate.paymentStatus = 'Partially Paid';
        } else {
          billToUpdate.paymentStatus = 'Pending';
        }
      }

      await billToUpdate.save();
      
      
      await billToUpdate.populate([
        { path: 'testGroups', select: 'name price' },
        { path: 'paymentDetails.mode', select: 'name' }
      ]);
      
      res.json({ message: 'Bill updated successfully', bill: billToUpdate });
    } catch (error) {

      res.status(500).json({ message: 'Error updating bill', error: error.message });
    }
  },

  // Get all bills with pagination and filters
  async getAllBills(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        paymentStatus, 
        search,
        searchBy = 'all', // 'all', 'patientName', 'patientPhone', 'doctorName', 'testGroup', 'address'
        sortBy = 'billDate', // 'billDate', 'patientName', 'doctorName', 'finalAmount', 'billNumber', 'paymentStatus'
        sortOrder = 'desc', // 'asc' or 'desc'
        // New filter parameters
        startDate,
        endDate,
        amountFilter, // 'greater', 'less', 'equal'
        amountValue,
        doctorId
      } = req.query;

      let filter = {};
      if (status) filter.status = status;
      if (paymentStatus) filter.paymentStatus = paymentStatus;
      
      // Date range filter
      if (startDate || endDate) {
        filter.billDate = {};
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          filter.billDate.$gte = start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.billDate.$lte = end;
        }
      }

      // Amount filter
      if (amountFilter && amountValue) {
        const amount = parseFloat(amountValue);
        if (!isNaN(amount)) {
          if (amountFilter === 'greater') {
            filter.finalAmount = { $gt: amount };
          } else if (amountFilter === 'less') {
            filter.finalAmount = { $lt: amount };
          } else if (amountFilter === 'equal') {
            filter.finalAmount = amount;
          }
        }
      }

      // Doctor filter
      if (doctorId && doctorId !== 'all' && doctorId !== '') {
        try {
          const doctor = await ReferredDoctor.findById(doctorId);
          if (doctor) {
            // Simple filter by doctor name (primary) and phone (secondary verification)
            filter['referredBy.doctorName'] = doctor.name;
            filter['referredBy.phone'] = doctor.phone;
          }
        } catch (error) {
          console.error('❌ Error finding doctor for filter:', error.message);
        }
      }
      
      // Enhanced search functionality
      if (search && search.trim()) {
        const searchTerm = search.trim();
        const searchRegex = { $regex: searchTerm, $options: 'i' };
        
        // Create search filter
        let searchConditions = [];
        
        if (searchBy === 'all') {
          // Search across all fields
          searchConditions = [
            { 'patient.name': searchRegex },
            { 'patient.phone': searchRegex },
            { 'patient.address.street': searchRegex },
            { 'patient.address.city': searchRegex },
            { 'patient.address.state': searchRegex },
            { 'patient.address.pincode': searchRegex },
            { 'referredBy.doctorName': searchRegex },
            { 'referredBy.phone': searchRegex },
            { billNumber: searchRegex }
          ];
        } else if (searchBy === 'patientName') {
          searchConditions = [{ 'patient.name': searchRegex }];
        } else if (searchBy === 'patientPhone') {
          searchConditions = [{ 'patient.phone': searchRegex }];
        } else if (searchBy === 'doctorName') {
          searchConditions = [
            { 'referredBy.doctorName': searchRegex },
            { 'referredBy.phone': searchRegex }
          ];
        } else if (searchBy === 'address') {
          searchConditions = [
            { 'patient.address.street': searchRegex },
            { 'patient.address.city': searchRegex },
            { 'patient.address.state': searchRegex },
            { 'patient.address.pincode': searchRegex }
          ];
        }

        // Add search conditions to filter
        if (searchConditions.length > 0) {
          if (Object.keys(filter).length > 0) {
            // Combine existing filters with search using $and
            filter = { 
              $and: [
                filter,
                { $or: searchConditions }
              ]
            };
          } else {
            // Only search filter
            filter = { $or: searchConditions };
          }
        }
      }

      // Build sort object
      let sortObject = {};
      if (sortBy === 'billDate') {
        sortObject.billDate = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'patientName') {
        sortObject['patient.name'] = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'doctorName') {
        sortObject['referredBy.doctorName'] = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'finalAmount') {
        sortObject.finalAmount = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'billNumber') {
        sortObject.billNumber = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'paymentStatus') {
        sortObject.paymentStatus = sortOrder === 'asc' ? 1 : -1;
      } else {
        // Default sort
        sortObject.billDate = -1;
      }

      const skip = (page - 1) * limit;

      // For test group search, we need to use aggregation
      let bills;
      let total;

      if (search && searchBy === 'testGroup') {
        const searchRegex = { $regex: search.trim(), $options: 'i' };
        
        // Use aggregation to search in populated test groups
        const aggregationPipeline = [
          {
            $lookup: {
              from: 'testgroups',
              localField: 'testGroups',
              foreignField: '_id',
              as: 'populatedTestGroups'
            }
          },
          {
            $match: {
              ...filter,
              'populatedTestGroups.name': searchRegex
            }
          },
          {
            $sort: sortObject
          },
          {
            $skip: skip
          },
          {
            $limit: parseInt(limit)
          },
          {
            $lookup: {
              from: 'testgroups',
              localField: 'testGroups',
              foreignField: '_id',
              as: 'testGroups'
            }
          },
          {
            $project: {
              populatedTestGroups: 0 // Remove the temporary field
            }
          }
        ];

        bills = await Bill.aggregate(aggregationPipeline);
        
        // Get total count for pagination
        const countPipeline = [
          {
            $lookup: {
              from: 'testgroups',
              localField: 'testGroups',
              foreignField: '_id',
              as: 'populatedTestGroups'
            }
          },
          {
            $match: {
              ...filter,
              'populatedTestGroups.name': searchRegex
            }
          },
          {
            $count: "total"
          }
        ];
        
        const countResult = await Bill.aggregate(countPipeline);
        total = countResult.length > 0 ? countResult[0].total : 0;
      } else {
        // Regular query for other searches
        bills = await Bill.find(filter)
          .populate({ path: 'testGroups', select: 'name price' })
          .sort(sortObject)
          .skip(skip)
          .limit(parseInt(limit));

        total = await Bill.countDocuments(filter);
      }

      res.json({
        bills,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        searchBy,
        sortBy,
        sortOrder,
        appliedFilters: {
          startDate,
          endDate,
          amountFilter,
          amountValue,
          doctorId,
          search,
          searchBy
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching bills', error: error.message });
    }
  },

  // Get single bill by ID
  async getBillById(req, res) {
    try {
      const bill = await Bill.findById(req.params.id)
        .populate({ path: 'testGroups', select: 'name price tests', populate: { path: 'tests', select: 'name methodology normalRange' }})
        .populate({ path: 'paymentDetails.mode', select: 'name' });
      
      if (!bill) return res.status(404).json({ message: 'Bill not found' });
      
      
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching bill', error: error.message });
    }
  },

  // Get bill by bill number
  async getBillByNumber(req, res) {
    try {
      const bill = await Bill.findOne({ billNumber: req.params.billNumber })
        .populate({ path: 'testGroups', select: 'name price' });
      
      if (!bill) return res.status(404).json({ message: 'Bill not found' });
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching bill', error: error.message });
    }
  },
  
  // Update payment status
  async updatePaymentStatus(req, res) {
    try {
      const { paidAmount, paymentStatus, dues } = req.body;
      const bill = await Bill.findById(req.params.id);

      if (!bill) return res.status(404).json({ message: 'Bill not found' });

      if (paidAmount !== undefined) bill.paidAmount = paidAmount;
      if (dues !== undefined) bill.dues = dues;
      if (paymentStatus) bill.paymentStatus = paymentStatus;

      await bill.save();
      res.json({ message: 'Payment status updated', bill });
    } catch (error) {
      res.status(500).json({ message: 'Error updating payment', error: error.message });
    }
  },

  // Get bill statistics summary
  async getBillStats(req, res) {
    try {
      const { dateRange, startDate, endDate } = req.query;
      
      // Calculate date filters based on range
      let dateFilter = {};
      const now = new Date();
      
      switch (dateRange) {
        case 'today':
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          const endOfDay = new Date(now.setHours(23, 59, 59, 999));
          dateFilter = { billDate: { $gte: startOfDay, $lte: endOfDay } };
          break;
        case 'thisMonth':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          dateFilter = { billDate: { $gte: startOfMonth, $lte: endOfMonth } };
          break;
        case 'ytd':
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
          dateFilter = { billDate: { $gte: startOfYear, $lte: endOfYear } };
          break;
        case 'custom':
          if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter = { billDate: { $gte: start, $lte: end } };
          }
          break;
        case 'overall':
        default:
          // No date filter for overall
          dateFilter = {};
          break;
      }

      // Basic counts
      const totalCases = await Bill.countDocuments(dateFilter);
      const pendingPaymentCount = await Bill.countDocuments({ 
        ...dateFilter, 
        paymentStatus: { $ne: 'Paid' } 
      });
      const paidBillsCount = await Bill.countDocuments({ 
        ...dateFilter, 
        paymentStatus: 'Paid' 
      });
      const partiallyPaidCount = await Bill.countDocuments({ 
        ...dateFilter, 
        paymentStatus: 'Partially Paid' 
      });

      // Revenue calculations (total bill amounts - paid + dues)
      const totalRevenueResult = await Bill.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]);
      const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

      const totalPaymentReceivedResult = await Bill.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ]);
      const totalPaymentReceived = totalPaymentReceivedResult.length > 0 ? totalPaymentReceivedResult[0].total : 0;

      const pendingPaymentAmountResult = await Bill.aggregate([
        { $match: { ...dateFilter, paymentStatus: { $ne: 'Paid' } } },
        { $group: { _id: null, total: { $sum: '$dues' } } }
      ]);
      const pendingPaymentAmount = pendingPaymentAmountResult.length > 0 ? pendingPaymentAmountResult[0].total : 0;

      // Top performing test groups
      const topTestGroups = await Bill.aggregate([
        { $match: dateFilter },
        { $unwind: '$testGroups' },
        { $lookup: { from: 'testgroups', localField: 'testGroups', foreignField: '_id', as: 'testGroup' } },
        { $unwind: '$testGroup' },
        { $group: { 
          _id: '$testGroup._id', 
          name: { $first: '$testGroup.name' },
          count: { $sum: 1 },
          revenue: { $sum: '$testGroup.price' }
        }},
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      // Payment method breakdown
      const paymentMethodBreakdown = await Bill.aggregate([
        { $match: { ...dateFilter, paymentStatus: { $ne: 'Pending' } } },
        { $unwind: '$paymentDetails' },
        { $lookup: { from: 'paymentmodes', localField: 'paymentDetails.mode', foreignField: '_id', as: 'mode' } },
        { $unwind: '$mode' },
        { $group: { 
          _id: '$mode.name', 
          amount: { $sum: '$paymentDetails.amount' },
          count: { $sum: 1 }
        }},
        { $sort: { amount: -1 } }
      ]);

      // Monthly revenue trend (for charts)
      let monthlyTrend = [];
      if (dateRange === 'ytd' || dateRange === 'overall') {
        monthlyTrend = await Bill.aggregate([
          { $match: { 
            ...dateFilter, 
            paymentStatus: 'Paid',
            billDate: { $gte: new Date(now.getFullYear(), 0, 1) } // Current year
          }},
          { $group: { 
            _id: { 
              month: { $month: '$billDate' },
              year: { $year: '$billDate' }
            },
            revenue: { $sum: '$finalAmount' },
            count: { $sum: 1 }
          }},
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
      }

      // Average bill value
      const avgBillValueResult = await Bill.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, avgValue: { $avg: '$finalAmount' } } }
      ]);
      const averageBillValue = avgBillValueResult.length > 0 ? avgBillValueResult[0].avgValue : 0;

      // Collection efficiency
      const collectionEfficiency = totalCases > 0 ? (paidBillsCount / totalCases) * 100 : 0;

      // Top performing doctors
      const topDoctors = await Bill.aggregate([
        { $match: dateFilter },
        { $group: { 
          _id: {
            name: '$referredBy.doctorName',
            phone: '$referredBy.phone'
          },
          totalAmount: { $sum: '$finalAmount' },
          billCount: { $sum: 1 },
          paidAmount: { $sum: '$paidAmount' },
          qualification: { $first: '$referredBy.qualification' }
        }},
        { $sort: { totalAmount: -1 } },
        { $limit: 5 },
        { $project: {
          _id: 0,
          name: '$_id.name',
          phone: '$_id.phone',
          qualification: '$qualification',
          totalAmount: 1,
          billCount: 1,
          paidAmount: 1
        }}
      ]);

      res.json({
        // Basic metrics
        totalCases,
        totalRevenue,
        totalPaymentReceived,
        pendingPaymentAmount,
        pendingPaymentCount,
        
        // Payment status breakdown
        paidBillsCount,
        partiallyPaidCount,
        
        // Performance metrics
        averageBillValue,
        collectionEfficiency,
        
        // Top performers
        topTestGroups,
        topDoctors,
        
        // Payment breakdown
        paymentMethodBreakdown,
        
        // Trends
        monthlyTrend,
        
        // Legacy fields for backward compatibility
        totalBills: totalCases,
        todaysBills: dateRange === 'today' ? totalCases : 0,
        pendingPayments: pendingPaymentCount,
        completedBills: paidBillsCount,
        todaysRevenue: dateRange === 'today' ? totalRevenue : 0
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
  }
}; 