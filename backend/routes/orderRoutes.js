import express from 'express';
import { createOrder, getOrders, getOrder, updateOrderStatus, updatePayment, deleteOrder, getOrderStats } from '../controllers/orderController.js';
import { protect, isAdminOrManager, isCashier, optionalAuth } from '../middleware/authMiddleware.js';
import { validateOrder } from '../middleware/validateMiddleware.js';

const router = express.Router();
router.get('/stats', protect, isAdminOrManager, getOrderStats);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.post('/', optionalAuth, validateOrder, createOrder);
router.patch('/:id/status', protect, updateOrderStatus);
router.patch('/:id/payment', protect, isCashier, updatePayment);
router.delete('/:id', protect, isAdminOrManager, deleteOrder);
export default router;
