import express from 'express';
import { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } from '../controllers/menuController.js';
import { protect, isAdminOrManager } from '../middleware/authMiddleware.js';
import { validateMenuItem } from '../middleware/validateMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', protect, isAdminOrManager, upload.single('image'), validateMenuItem, createMenuItem);
router.put('/:id', protect, isAdminOrManager, upload.single('image'), updateMenuItem);
router.delete('/:id', protect, isAdminOrManager, deleteMenuItem);
router.patch('/:id/availability', protect, isAdminOrManager, toggleAvailability);
export default router;
