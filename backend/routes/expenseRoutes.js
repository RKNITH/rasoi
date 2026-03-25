import express from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/mainController.js';
import { protect, isAdminOrManager } from '../middleware/authMiddleware.js';
import { validateExpense } from '../middleware/validateMiddleware.js';

const router = express.Router();
router.get('/', protect, isAdminOrManager, getExpenses);
router.post('/', protect, isAdminOrManager, validateExpense, createExpense);
router.put('/:id', protect, isAdminOrManager, updateExpense);
router.delete('/:id', protect, isAdminOrManager, deleteExpense);
export default router;
