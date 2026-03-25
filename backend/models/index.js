import mongoose from 'mongoose';

// Table Model
const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  floor: {
    type: String,
    default: 'Ground'
  },
  section: String,
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  reservation: {
    customerName: String,
    customerPhone: String,
    date: Date,
    partySize: Number,
    notes: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Category Model
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: String,
  image: String,
  icon: String,
  color: { type: String, default: '#FF6B35' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Invoice Model
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  orderNumber: String,
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 5 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'online', 'wallet'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'cancelled'],
    default: 'draft'
  },
  notes: String,
  dueDate: Date,
  paidAt: Date,
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

// Review Model
const reviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: String,
  comment: String,
  images: [String],
  isPublished: { type: Boolean, default: true },
  reply: {
    message: String,
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    repliedAt: Date
  }
}, { timestamps: true });

// Expense Model
const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    enum: ['ingredients', 'utilities', 'staff', 'maintenance', 'marketing', 'equipment', 'rent', 'other'],
    default: 'other'
  },
  date: { type: Date, default: Date.now },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer'],
    default: 'cash'
  },
  receipt: String,
  isRecurring: { type: Boolean, default: false },
  recurringPeriod: String,
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Activity Log Model
const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  entity: String,
  entityId: mongoose.Schema.Types.ObjectId,
  description: String,
  metadata: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  level: {
    type: String,
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info'
  }
}, { timestamps: true });

activitySchema.index({ createdAt: -1 });
activitySchema.index({ user: 1 });

export const Table = mongoose.model('Table', tableSchema);
export const Category = mongoose.model('Category', categorySchema);
export const Invoice = mongoose.model('Invoice', invoiceSchema);
export const Review = mongoose.model('Review', reviewSchema);
export const Expense = mongoose.model('Expense', expenseSchema);
export const Activity = mongoose.model('Activity', activitySchema);
