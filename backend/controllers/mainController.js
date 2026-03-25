import { Invoice, Table, Review, Expense, Activity } from '../models/index.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import { sendInvoiceEmail } from '../utils/email.js';
import { AppError } from '../middleware/errorMiddleware.js';

// ==================== INVOICE CONTROLLER ====================

export const createInvoice = async (req, res, next) => {
  try {
    const { orderId, sendEmail: shouldSendEmail } = req.body;
    const order = await Order.findById(orderId)
      .populate('customer', 'name email phone')
      .populate('table', 'tableNumber')
      .populate('items.menuItem', 'name');

    if (!order) return next(new AppError('Order not found.', 404));

    const invoiceData = {
      order: order._id,
      orderNumber: order.orderNumber,
      customer: order.customer?._id,
      customerName: order.customer?.name || order.customerName || 'Walk-in Customer',
      customerEmail: order.customer?.email || order.customerEmail,
      customerPhone: order.customer?.phone || order.customerPhone,
      items: order.items.map(item => ({
        name: item.name || item.menuItem?.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subtotal: order.subtotal,
      taxRate: order.taxRate,
      tax: order.tax,
      discount: order.discount,
      deliveryCharge: order.deliveryCharge,
      total: order.total,
      paymentMethod: order.paymentMethod,
      status: order.paymentStatus === 'paid' ? 'paid' : 'draft',
      generatedBy: req.user._id
    };

    const invoice = await Invoice.create(invoiceData);

    if (shouldSendEmail && invoiceData.customerEmail) {
      try {
        const pdfBuffer = await generateInvoicePDF({ ...invoice.toObject(), order, customer: order.customer });
        await sendInvoiceEmail(invoiceData.customerEmail, invoiceData.customerName, pdfBuffer, invoice.invoiceNumber);
      } catch (emailError) {
        console.error('Email send failed:', emailError);
      }
    }

    res.status(201).json({ success: true, message: 'Invoice created!', data: invoice });
  } catch (error) {
    next(error);
  }
};

export const getInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } }
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('customer', 'name email')
      .populate('generatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, data: invoices, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('order')
      .populate('generatedBy', 'name');
    if (!invoice) return next(new AppError('Invoice not found.', 404));
    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const downloadInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('order');
    if (!invoice) return next(new AppError('Invoice not found.', 404));

    const pdfBuffer = await generateInvoicePDF(invoice.toObject());
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// ==================== TABLE CONTROLLER ====================

export const getTables = async (req, res, next) => {
  try {
    const { status, floor } = req.query;
    const query = { isActive: true };
    if (status) query.status = status;
    if (floor) query.floor = floor;

    const tables = await Table.find(query)
      .populate('currentOrder', 'orderNumber status total items')
      .sort({ tableNumber: 1 });
    res.json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

export const createTable = async (req, res, next) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json({ success: true, message: 'Table created!', data: table });
  } catch (error) {
    next(error);
  }
};

export const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!table) return next(new AppError('Table not found.', 404));
    res.json({ success: true, message: 'Table updated!', data: table });
  } catch (error) {
    next(error);
  }
};

export const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!table) return next(new AppError('Table not found.', 404));
    res.json({ success: true, message: 'Table deactivated.' });
  } catch (error) {
    next(error);
  }
};

export const updateTableStatus = async (req, res, next) => {
  try {
    const { status, reservation } = req.body;
    const update = { status };
    if (reservation) update.reservation = reservation;
    const table = await Table.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!table) return next(new AppError('Table not found.', 404));
    res.json({ success: true, message: 'Table status updated!', data: table });
  } catch (error) {
    next(error);
  }
};

// ==================== DASHBOARD CONTROLLER ====================

export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalOrders, todayOrders, pendingOrders,
      revenueAll, revenueToday, revenueThisMonth, revenueLastMonth,
      totalUsers, totalItems, activeTables,
      ordersByStatus, ordersByType, topItems,
      recentOrders, dailyRevenue, monthlyExpenses
    ] = await Promise.all([
      Order.countDocuments({ isDeleted: false }),
      Order.countDocuments({ createdAt: { $gte: today }, isDeleted: false }),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] }, isDeleted: false }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: thisMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      User.countDocuments({ isActive: true }),
      MenuItem.countDocuments({ isAvailable: true }).catch(() => 0),
      Table.countDocuments({ status: 'occupied' }),
      Order.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { isDeleted: false } }, { $group: { _id: '$orderType', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.menuItem', name: { $first: '$items.name' }, count: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Order.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).populate('customer', 'name').populate('table', 'tableNumber'),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Expense.aggregate([
        { $match: { createdAt: { $gte: thisMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ])
    ]);

    const thisMonthRevenue = revenueThisMonth[0]?.total || 0;
    const lastMonthRevenue = revenueLastMonth[0]?.total || 0;
    const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          todayOrders,
          pendingOrders,
          totalRevenue: revenueAll[0]?.total || 0,
          todayRevenue: revenueToday[0]?.total || 0,
          thisMonthRevenue,
          lastMonthRevenue,
          revenueGrowth,
          totalUsers,
          activeTables
        },
        charts: { ordersByStatus, ordersByType, dailyRevenue, monthlyExpenses },
        topItems,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const formatMap = { day: '%Y-%m-%d', week: '%Y-W%V', month: '%Y-%m' };
    const format = formatMap[groupBy] || formatMap.day;

    const salesData = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 }, avgOrder: { $avg: '$total' } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: salesData });
  } catch (error) {
    next(error);
  }
};

// ==================== REVIEW CONTROLLER ====================

export const getReviews = async (req, res, next) => {
  try {
    const { menuItem, page = 1, limit = 10, rating } = req.query;
    const query = { isPublished: true };
    if (menuItem) query.menuItem = menuItem;
    if (rating) query.rating = parseInt(rating);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('customer', 'name avatar')
      .populate('menuItem', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, data: reviews, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { menuItem, order, rating, title, comment } = req.body;
    const existing = await Review.findOne({ customer: req.user._id, menuItem });
    if (existing) return next(new AppError('You have already reviewed this item.', 400));

    const review = await Review.create({ customer: req.user._id, menuItem, order, rating, title, comment });

    // Update menu item rating
    if (menuItem) {
      const stats = await Review.aggregate([
        { $match: { menuItem: review.menuItem, isPublished: true } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      if (stats.length > 0) {
        await MenuItem.findByIdAndUpdate(menuItem, { 'ratings.average': stats[0].avg.toFixed(1), 'ratings.count': stats[0].count });
      }
    }

    res.status(201).json({ success: true, message: 'Review submitted!', data: review });
  } catch (error) {
    next(error);
  }
};

export const replyToReview = async (req, res, next) => {
  try {
    const { message } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { reply: { message, repliedBy: req.user._id, repliedAt: new Date() } },
      { new: true }
    );
    if (!review) return next(new AppError('Review not found.', 404));
    res.json({ success: true, message: 'Reply added!', data: review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};

// ==================== EXPENSE CONTROLLER ====================

export const getExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;
    const query = {};
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .populate('addedBy', 'name')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalAmount = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: expenses,
      totalAmount: totalAmount[0]?.total || 0,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, addedBy: req.user._id });
    res.status(201).json({ success: true, message: 'Expense recorded!', data: expense });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) return next(new AppError('Expense not found.', 404));
    res.json({ success: true, message: 'Expense updated!', data: expense });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Expense deleted.' });
  } catch (error) {
    next(error);
  }
};

// ==================== USER CONTROLLER ====================

export const getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search, isActive } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

    res.json({ success: true, data: users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await User.create({ ...req.body, isEmailVerified: true });
    res.status(201).json({ success: true, message: 'User created!', data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!user) return next(new AppError('User not found.', 404));
    res.json({ success: true, message: 'User updated!', data: user });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return next(new AppError('Cannot delete your own account.', 400));
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

// ==================== DELIVERY CONTROLLER ====================

export const getDeliveryOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { orderType: 'delivery', isDeleted: false };
    if (status) query.status = status;
    if (req.user.role === 'delivery') {
      query.$or = [{ deliveryBoy: req.user._id }, { status: 'ready', deliveryBoy: { $exists: false } }];
    }

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .populate('deliveryBoy', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const assignDelivery = async (req, res, next) => {
  try {
    const { deliveryBoyId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryBoy: deliveryBoyId, status: 'delivered' },
      { new: true }
    ).populate('deliveryBoy', 'name phone');

    if (!order) return next(new AppError('Order not found.', 404));
    res.json({ success: true, message: 'Delivery assigned!', data: order });
  } catch (error) {
    next(error);
  }
};

// ==================== ACTIVITY CONTROLLER ====================

export const getActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, level, user } = req.query;
    const query = {};
    if (level) query.level = level;
    if (user) query.user = user;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .populate('user', 'name role avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, data: activities, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};
