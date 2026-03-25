// authRoutes.js
import express from 'express';
import { register, login, logout, getMe, verifyEmail, resendOTP, forgotPassword, resetPassword, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin, validateOTP, validateResetPassword } from '../middleware/validateMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();
router.post('/register', validateRegister, register);
router.post('/verify-email', validateOTP, verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
