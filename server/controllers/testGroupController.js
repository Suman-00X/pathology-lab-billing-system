import TestGroup from '../models/TestGroup.js';
import Test from '../models/Test.js';
import mongoose from 'mongoose';

export const testGroupController = {
  // Create a new test group
  async createTestGroup(req, res) {
    try {
      const { name, price, sampleType, sampleTestedIn } = req.body;
      if (!name || !price || !sampleType || !sampleTestedIn) {
        return res.status(400).json({ message: 'Name, price, sample type, and sample tested in are required.' });
      }

      const newTestGroup = new TestGroup({ name, price, sampleType, sampleTestedIn });
      await newTestGroup.save();
      res.status(201).json(newTestGroup);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'A test group with this name already exists.' });
      }
      res.status(500).json({ message: 'Error creating test group', error: error.message });
    }
  },

  // Get all test groups
  async getAllTestGroups(req, res) {
    try {
      const testGroups = await TestGroup.find().populate('tests').sort({ name: 1 });
      
      // Normalize data - ensure price field exists for legacy records
      const normalizedGroups = testGroups.map(group => {
        const groupObj = group.toObject();
        if (groupObj.price === undefined || groupObj.price === null) {
          groupObj.price = 0; // Default price for legacy records
        }
        // Remove deprecated fields
        delete groupObj.description;
        return groupObj;
      });
      
      res.json(normalizedGroups);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching test groups', error: error.message });
    }
  },

  // Get a single test group by ID
  async getTestGroupById(req, res) {
    try {
      const testGroup = await TestGroup.findById(req.params.id).populate('tests');
      if (!testGroup) {
        return res.status(404).json({ message: 'Test group not found' });
      }
      
      // Normalize data - ensure price field exists for legacy records
      const groupObj = testGroup.toObject();
      if (groupObj.price === undefined || groupObj.price === null) {
        groupObj.price = 0; // Default price for legacy records
      }
      // Remove deprecated fields
      delete groupObj.description;
      
      res.json(groupObj);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching test group', error: error.message });
    }
  },

  // Update a test group
  async updateTestGroup(req, res) {
    try {
      const { name, price, isActive, sampleType, sampleTestedIn } = req.body;
      const updatedTestGroup = await TestGroup.findByIdAndUpdate(
        req.params.id,
        { name, price, isActive, sampleType, sampleTestedIn },
        { new: true, runValidators: true }
      );
      if (!updatedTestGroup) {
        return res.status(404).json({ message: 'Test group not found' });
      }
      res.json(updatedTestGroup);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'A test group with this name already exists.' });
      }
      res.status(500).json({ message: 'Error updating test group', error: error.message });
    }
  },

  // Delete a test group
  async deleteTestGroup(req, res) {
    try {
      const testGroup = await TestGroup.findById(req.params.id);
      if (!testGroup) {
        return res.status(404).json({ message: 'Test group not found' });
      }

      // Delete all tests within this group
      await Test.deleteMany({ _id: { $in: testGroup.tests } });
      
      await TestGroup.findByIdAndDelete(req.params.id);

      res.json({ message: 'Test group and all its tests deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting test group', error: error.message });
    }
  },

  // Add a test to a test group
  async addTestToGroup(req, res) {
    try {
      const { groupId } = req.params;
      const { name, units, normalRange } = req.body;

      console.log('Adding test to group:', { groupId, name, units, normalRange });

      if (!name || !normalRange || !units) {
        return res.status(400).json({ message: 'Test name, normal range, and units are required.' });
      }

      const testGroup = await TestGroup.findById(groupId);
      if (!testGroup) {
        return res.status(404).json({ message: 'Test group not found' });
      }

      console.log('Found test group:', testGroup.name);

      const newTest = new Test({ name, units, normalRange, testGroup: groupId });
  
      console.log('Created new test:', newTest);
      
      await newTest.save();
  
      console.log('Saved test to database');

      testGroup.tests.push(newTest._id);
      await testGroup.save();
  
      console.log('Updated test group with new test');
      
      // Use a fresh query to get the updated group with populated tests
      const updatedGroup = await TestGroup.findById(groupId).populate('tests');
      
      // Normalize the response like in getAllTestGroups
      const groupObj = updatedGroup.toObject();
      if (groupObj.price === undefined || groupObj.price === null) {
        groupObj.price = 0;
      }
      delete groupObj.description;
      
      console.log('Returning updated group');
  
      res.status(201).json(groupObj);
    } catch (error) {
      console.error('Error adding test to group:', error);
      res.status(500).json({ 
        message: 'Error adding test to group', 
        error: error.message,
        details: error.stack 
      });
    }
  },

  // Remove a test from a test group (and delete the test)
  async removeTestFromGroup(req, res) {
    try {
      const { groupId, testId } = req.params;

      const testGroup = await TestGroup.findByIdAndUpdate(
        groupId,
        { $pull: { tests: testId } },
        { new: true }
      );

      if (!testGroup) {
        return res.status(404).json({ message: 'Test group not found' });
      }

      // Delete the test itself
      await Test.findByIdAndDelete(testId);

      await testGroup.populate('tests');
      res.json(testGroup);
    } catch (error) {
      res.status(500).json({ message: 'Error removing test from group', error: error.message });
    }
  },

  // Update a test within a group
  async updateTestInGroup(req, res) {
    try {
      const { testId } = req.params;
      const { name, units, normalRange } = req.body;

      const updatedTest = await Test.findByIdAndUpdate(
        testId,
        { name, units, normalRange },
        { new: true, runValidators: true }
      );

      if (!updatedTest) {
        return res.status(404).json({ message: 'Test not found' });
      }
      
      res.json(updatedTest);
    } catch (error) {
      res.status(500).json({ message: 'Error updating test', error: error.message });
    }
  }
}; 