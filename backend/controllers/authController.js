import User from '../models/User.js';
import { generateToken, setTokenCookie, clearTokenCookie, generateOTP } from '../utils/tokenUtils.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../utils/email.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { logger } from '../utils/logger.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// @desc    Register new user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered. Please login.', 400));
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role === 'customer' ? 'customer' : 'customer', // Only allow customer registration
      emailOTP: otp,
      emailOTPExpiry: otpExpiry
    });

    await sendVerificationEmail(email, name, otp);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the OTP to verify your account.',
      data: { email: user.email }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email OTP
// @route   POST /api/auth/verify-email
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      emailOTP: otp,
      emailOTPExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired OTP.', 400));
    }

    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpiry = undefined;
    await user.save();

    await sendWelcomeEmail(email, user.name, user.role);

    const token = generateToken({ id: user._id, role: user.role });
    setTokenCookie(res, token);

    res.json({
      success: true,
      message: 'Email verified successfully!',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isEmailVerified: false });

    if (!user) {
      return next(new AppError('User not found or already verified.', 404));
    }

    const otp = generateOTP();
    user.emailOTP = otp;
    user.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, user.name, otp);

    res.json({ success: true, message: 'OTP sent successfully to your email.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Login
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid credentials.', 401));
    }

    if (user.isLocked()) {
      return next(new AppError('Account temporarily locked due to too many failed attempts. Try again in 2 hours.', 423));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return next(new AppError('Invalid credentials.', 401));
    }

    if (!user.isEmailVerified) {
      const otp = generateOTP();
      user.emailOTP = otp;
      user.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendVerificationEmail(email, user.name, otp);

      return res.status(403).json({
        success: false,
        message: 'Please verify your email. A new OTP has been sent.',
        needsVerification: true,
        email
      });
    }

    if (!user.isActive) {
      return next(new AppError('Account deactivated. Contact admin.', 401));
    }

    // Reset login attempts
    await user.updateOne({ $set: { loginAttempts: 0, lastLogin: Date.now() }, $unset: { lockUntil: 1 } });

    const token = generateToken({ id: user._id, role: user.role });
    setTokenCookie(res, token);

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
export const logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Security: don't reveal if email exists
      return res.json({ success: true, message: 'If that email exists, an OTP has been sent.' });
    }

    const otp = generateOTP();
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(email, user.name, otp);

    res.json({ success: true, message: 'Password reset OTP sent to your email.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({
      email,
      passwordResetOTP: otp,
      passwordResetOTPExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired OTP.', 400));
    }

    user.password = password;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful! You can now login.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update-profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const updateData = { name, phone, address };

    if (req.file) {
      updateData.avatar = await uploadToCloudinary(req.file.buffer, 'restaurant-management/avatars');
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated!', data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect.', 401));
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    next(error);
  }
};
