import express from 'express';
import { getTables, createTable, updateTable, deleteTable, updateTableStatus } from '../controllers/mainController.js';
import { protect, isAdminOrManager } from '../middleware/authMiddleware.js';
import { validateTable } from '../middleware/validateMiddleware.js';

const router = express.Router();
router.get('/', protect, getTables);
router.post('/', protect, isAdminOrManager, validateTable, createTable);
router.put('/:id', protect, isAdminOrManager, updateTable);
router.delete('/:id', protect, isAdminOrManager, deleteTable);
router.patch('/:id/status', protect, updateTableStatus);
export default router;
