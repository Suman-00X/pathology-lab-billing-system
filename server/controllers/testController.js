import Test from '../models/Test.js';

export const testController = {
  // Get all tests
  async getAllTests(req, res) {
    try {
      const { active, search } = req.query;
      let filter = {};

      if (active === 'true') filter.isActive = true;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } }
        ];
      }

      const tests = await Test.find(filter)
        .sort({ name: 1 });

      res.json(tests);
    } catch (error) {
  
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get single test by ID
  async getTestById(req, res) {
    try {
      const test = await Test.findById(req.params.id);
      
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }
      
      res.json(test);
    } catch (error) {
  
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create new test
  async createTest(req, res) {
    try {
      const {
        name,
        code,
        price,
        normalRange,
        methodology,
        sampleType,
        preparationInstructions
      } = req.body;

      // Validation
      if (!name || !price || !normalRange || !normalRange.min || !normalRange.max || !normalRange.unit) {
        return res.status(400).json({ 
          message: 'Name, price, and complete normal range (min, max, unit) are required' 
        });
      }

      // Generate code if not provided
      const testCode = code || `TEST_${Date.now()}`;

      // Check if test code already exists
      const existingTest = await Test.findOne({ 
        code: { $regex: new RegExp(`^${testCode}$`, 'i') } 
      });
      
      if (existingTest) {
        return res.status(400).json({ message: 'Test with this code already exists' });
      }

      const test = new Test({
        name,
        code: testCode.toUpperCase(),
        price,
        normalRange,
        methodology,
        sampleType,
        preparationInstructions
      });

      await test.save();
      
      res.status(201).json({ message: 'Test created successfully', test });
    } catch (error) {
  
      if (error.code === 11000) {
        res.status(400).json({ message: 'Test with this code already exists' });
      } else {
        res.status(500).json({ message: 'Server error' });
      }
    }
  },

  // Update test
  async updateTest(req, res) {
    try {
      const {
        name,
        code,
        price,
        normalRange,
        methodology,
        sampleType,
        preparationInstructions,
        isActive
      } = req.body;

      // Check if another test with the same code exists
      if (code) {
        const existingTest = await Test.findOne({ 
          code: { $regex: new RegExp(`^${code}$`, 'i') },
          _id: { $ne: req.params.id }
        });
        
        if (existingTest) {
          return res.status(400).json({ message: 'Test with this code already exists' });
        }
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (code !== undefined) updateData.code = code.toUpperCase();
      if (price !== undefined) updateData.price = price;
      if (normalRange !== undefined) updateData.normalRange = normalRange;
      if (methodology !== undefined) updateData.methodology = methodology;
      if (sampleType !== undefined) updateData.sampleType = sampleType;
      if (preparationInstructions !== undefined) updateData.preparationInstructions = preparationInstructions;
      if (isActive !== undefined) updateData.isActive = isActive;

      const test = await Test.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }

      res.json({ message: 'Test updated successfully', test });
    } catch (error) {
  
      if (error.code === 11000) {
        res.status(400).json({ message: 'Test with this code already exists' });
      } else {
        res.status(500).json({ message: 'Server error' });
      }
    }
  },

  // Delete test
  async deleteTest(req, res) {
    try {
      const test = await Test.findByIdAndDelete(req.params.id);
      
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }

      res.json({ message: 'Test deleted successfully' });
    } catch (error) {
  
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Toggle test active status
  async toggleTestStatus(req, res) {
    try {
      const test = await Test.findById(req.params.id);
      
      if (!test) {
        return res.status(404).json({ message: 'Test not found' });
      }

      test.isActive = !test.isActive;
      await test.save();

      res.json({ 
        message: `Test ${test.isActive ? 'activated' : 'deactivated'} successfully`, 
        test 
      });
    } catch (error) {
  
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create multiple tests
  async createBulkTests(req, res) {
    try {
      const { tests } = req.body;
      
      if (!Array.isArray(tests) || tests.length === 0) {
        return res.status(400).json({ message: 'Tests array is required' });
      }

      const createdTests = [];
      const errors = [];

      for (let i = 0; i < tests.length; i++) {
        try {
          const testData = tests[i];
          
          // Validate required fields
          if (!testData.name || !testData.price || !testData.normalRange || 
              !testData.normalRange.min || !testData.normalRange.max || !testData.normalRange.unit) {
            errors.push(`Row ${i + 1}: Name, price, and complete normal range are required`);
            continue;
          }

          // Generate code if not provided
          const testCode = testData.code || `TEST_${Date.now()}_${i}`;
          
          // Check if test code already exists
          const existingTest = await Test.findOne({ 
            code: { $regex: new RegExp(`^${testCode}$`, 'i') } 
          });
          
          if (existingTest) {
            errors.push(`Row ${i + 1}: Test with code ${testCode} already exists`);
            continue;
          }

          const test = new Test({
            ...testData,
            code: testCode.toUpperCase()
          });

          await test.save();
          createdTests.push(test);
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      res.json({
        message: `${createdTests.length} tests created successfully`,
        createdTests,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
  
      res.status(500).json({ message: 'Server error' });
    }
  }
}; 