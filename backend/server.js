import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://rasoi-seven.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Auth-specific stricter rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' }
});

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data Sanitization
app.use(mongoSanitize());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Restaurant Management API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/activities', activityRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
