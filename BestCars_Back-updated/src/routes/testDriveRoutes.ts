import express from 'express';
import { getAllTestDrives, submitTestDrive, updateTestDrive } from '../controllers/testDriveController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', submitTestDrive);
router.get('/', requireAuth, getAllTestDrives);
router.patch('/:id', requireAuth, updateTestDrive);

export default router;
