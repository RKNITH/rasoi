import express from 'express';
import { getActivities } from '../controllers/mainController.js';
import { protect, isAdminOrManager } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', protect, isAdminOrManager, getActivities);
export default router;
