import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/menuController.js';
import { protect, isAdminOrManager } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', getCategories);
router.post('/', protect, isAdminOrManager, createCategory);
router.put('/:id', protect, isAdminOrManager, updateCategory);
router.delete('/:id', protect, isAdminOrManager, deleteCategory);
export default router;
