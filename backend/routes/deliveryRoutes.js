import express from 'express';
import { getDeliveryOrders, assignDelivery } from '../controllers/mainController.js';
import { protect, isAdminOrManager } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', protect, getDeliveryOrders);
router.patch('/:id/assign', protect, isAdminOrManager, assignDelivery);
export default router;
