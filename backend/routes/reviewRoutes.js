import express from 'express';
import { getReviews, createReview, replyToReview, deleteReview } from '../controllers/mainController.js';
import { protect, isAdminOrManager } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', getReviews);
router.post('/', protect, createReview);
router.post('/:id/reply', protect, isAdminOrManager, replyToReview);
router.delete('/:id', protect, isAdminOrManager, deleteReview);
export default router;
