import express from 'express';
import { getDashboardStats, getSalesReport } from '../controllers/mainController.js';
import { protect, isAdminOrManager } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/stats', protect, isAdminOrManager, getDashboardStats);
router.get('/sales', protect, isAdminOrManager, getSalesReport);
export default router;
