import express from 'express';
import { createInvoice, getInvoices, getInvoice, downloadInvoice } from '../controllers/mainController.js';
import { protect, isCashier } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', protect, isCashier, getInvoices);
router.get('/:id', protect, getInvoice);
router.get('/:id/download', protect, downloadInvoice);
router.post('/', protect, isCashier, createInvoice);
export default router;
