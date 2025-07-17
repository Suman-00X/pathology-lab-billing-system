import express from 'express';
import { testGroupController } from '../controllers/testGroupController.js';

const router = express.Router();

// Test Group routes
router.post('/', testGroupController.createTestGroup);
router.get('/', testGroupController.getAllTestGroups);
router.get('/:id', testGroupController.getTestGroupById);
router.put('/:id', testGroupController.updateTestGroup);
router.delete('/:id', testGroupController.deleteTestGroup);

// Routes for tests within a group
router.post('/:groupId/tests', testGroupController.addTestToGroup);
router.delete('/:groupId/tests/:testId', testGroupController.removeTestFromGroup);
router.put('/tests/:testId', testGroupController.updateTestInGroup);

export default router; 