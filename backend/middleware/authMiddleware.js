import { verifyToken } from '../utils/tokenUtils.js';
import User from '../models/User.js';


export const protect = async (req, res, next) => {
  try {
    let token;

    // Check cookie first, then Authorization header
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login to continue.'
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`Auth middleware error: ${error.message}`);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(500).json({ success: false, message: 'Authentication error.' });
  }
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

// Specific role checks
export const isAdmin = authorize('admin');
export const isAdminOrManager = authorize('admin', 'manager');
export const isCashier = authorize('admin', 'manager', 'cashier');
export const isWaiter = authorize('admin', 'manager', 'waiter');
export const isDelivery = authorize('admin', 'manager', 'delivery');
export const isStaff = authorize('admin', 'manager', 'cashier', 'waiter', 'delivery');

// Optional auth (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.cookies.jwt) token = req.cookies.jwt;
    else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) req.user = user;
    }
    next();
  } catch {
    next();
  }
};
