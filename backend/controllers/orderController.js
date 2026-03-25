import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { Table } from '../models/index.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { Activity } from '../models/index.js';

const logActivity = async (user, action, entity, entityId, description) => {
  try {
    await Activity.create({ user: user?._id, action, entity, entityId, description, level: 'info' });
  } catch {}
};

// @desc    Create order
// @route   POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const { items, orderType, table, customerName, customerPhone, customerEmail, deliveryAddress, discount, specialInstructions, paymentMethod } = req.body;

    // Enrich items with current prices
    const enrichedItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) return next(new AppError(`Menu item not found: ${item.menuItem}`, 404));
      if (!menuItem.isAvailable) return next(new AppError(`${menuItem.name} is currently unavailable.`, 400));

      enrichedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.discountedPrice || menuItem.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      });
    }

    const orderData = {
      items: enrichedItems,
      orderType,
      discount: discount || 0,
      specialInstructions,
      paymentMethod: paymentMethod || 'cash',
      statusHistory: [{ status: 'pending', updatedBy: req.user?._id }]
    };

    if (req.user?.role === 'customer') {
      orderData.customer = req.user._id;
    } else {
      orderData.customerName = customerName;
      orderData.customerPhone = customerPhone;
      orderData.customerEmail = customerEmail;
    }

    if (orderType === 'dine-in' && table) {
      const tableDoc = await Table.findById(table);
      if (!tableDoc) return next(new AppError('Table not found.', 404));
      if (tableDoc.status === 'occupied') return next(new AppError('Table is already occupied.', 400));
      orderData.table = table;
      orderData.waiter = req.user?._id;
      tableDoc.status = 'occupied';
      await tableDoc.save();
    }

    if (orderType === 'delivery') {
      orderData.deliveryAddress = deliveryAddress;
      orderData.deliveryCharge = 40;
    }

    const order = await Order.create(orderData);
    await order.populate(['customer', 'table', 'waiter', { path: 'items.menuItem', select: 'name image' }]);

    // Update menu item order counts
    for (const item of enrichedItems) {
      await MenuItem.findByIdAndUpdate(item.menuItem, { $inc: { orderCount: item.quantity } });
    }

    await logActivity(req.user, 'CREATE_ORDER', 'Order', order._id, `Order ${order.orderNumber} created`);

    res.status(201).json({ success: true, message: 'Order placed successfully!', data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
export const getOrders = async (req, res, next) => {
  try {
    const { status, orderType, page = 1, limit = 20, search, date } = req.query;
    const query = { isDeleted: false };

    // Role-based filtering
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'waiter') {
      query.waiter = req.user._id;
    } else if (req.user.role === 'delivery') {
      query.$or = [{ deliveryBoy: req.user._id }, { orderType: 'delivery', status: { $in: ['ready'] } }];
    }

    if (status) query.status = status;
    if (orderType) query.orderType = orderType;
    if (search) query.orderNumber = { $regex: search, $options: 'i' };
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.createdAt = { $gte: start, $lt: end };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('table', 'tableNumber floor')
      .populate('waiter', 'name')
      .populate('deliveryBoy', 'name phone')
      .populate('items.menuItem', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone avatar')
      .populate('table', 'tableNumber floor section capacity')
      .populate('waiter', 'name email')
      .populate('deliveryBoy', 'name phone')
      .populate('items.menuItem', 'name image category')
      .populate('statusHistory.updatedBy', 'name role');

    if (!order) return next(new AppError('Order not found.', 404));

    // Customer can only view their own orders
    if (req.user.role === 'customer' && order.customer?._id.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied.', 403));
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found.', 404));

    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready'],
      ready: ['delivered', 'completed'],
      delivered: ['completed'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return next(new AppError(`Cannot transition from ${order.status} to ${status}.`, 400));
    }

    order.status = status;
    order.statusHistory.push({ status, updatedBy: req.user._id, note });

    // Free table when order is completed
    if ((status === 'completed' || status === 'cancelled') && order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: null });
    }

    // Assign delivery boy
    if (status === 'ready' && order.orderType === 'delivery' && req.user.role === 'delivery') {
      order.deliveryBoy = req.user._id;
    }

    await order.save();
    await logActivity(req.user, 'UPDATE_ORDER_STATUS', 'Order', order._id, `Order ${order.orderNumber} status changed to ${status}`);

    res.json({ success: true, message: `Order status updated to ${status}.`, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PATCH /api/orders/:id/payment
export const updatePayment = async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentMethod },
      { new: true }
    );
    if (!order) return next(new AppError('Order not found.', 404));
    await logActivity(req.user, 'UPDATE_PAYMENT', 'Order', order._id, `Payment ${paymentStatus} via ${paymentMethod}`);
    res.json({ success: true, message: 'Payment updated.', data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order (soft)
// @route   DELETE /api/orders/:id
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found.', 404));
    if (!['cancelled', 'completed'].includes(order.status)) {
      return next(new AppError('Only cancelled or completed orders can be deleted.', 400));
    }
    order.isDeleted = true;
    await order.save();
    res.json({ success: true, message: 'Order deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order stats
// @route   GET /api/orders/stats
export const getOrderStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, pendingOrders, revenue] = await Promise.all([
      Order.countDocuments({ isDeleted: false }),
      Order.countDocuments({ createdAt: { $gte: today }, isDeleted: false }),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] }, isDeleted: false }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        pendingOrders,
        totalRevenue: revenue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};
