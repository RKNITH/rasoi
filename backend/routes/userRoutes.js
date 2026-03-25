import express from 'express';
import { getUsers, getUser, createUser, updateUser, toggleUserStatus, deleteUser } from '../controllers/mainController.js';
import { protect, isAdmin, isAdminOrManager } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', protect, isAdminOrManager, getUsers);
router.get('/:id', protect, isAdminOrManager, getUser);
router.post('/', protect, isAdmin, createUser);
router.put('/:id', protect, isAdminOrManager, updateUser);
router.patch('/:id/toggle-status', protect, isAdmin, toggleUserStatus);
router.delete('/:id', protect, isAdmin, deleteUser);
export default router;
