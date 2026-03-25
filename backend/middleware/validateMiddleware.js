import Joi from 'joi';

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
  if (error) {
    const messages = error.details.map(d => d.message.replace(/['"]/g, '')).join(', ');
    return res.status(400).json({ success: false, message: messages });
  }
  next();
};

export const validateRegister = validate(
  Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    role: Joi.string().valid('customer').optional()
  })
);

export const validateLogin = validate(
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
);

export const validateOTP = validate(
  Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required()
  })
);

export const validateResetPassword = validate(
  Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    password: Joi.string().min(6).required()
  })
);

// NOTE: validateMenuItem is NOT used for multipart/form-data routes.
// Validation for menu items is handled inside the controller after
// FormData is parsed by multer. This export is kept for compatibility.
export const validateMenuItem = (req, res, next) => next();

export const validateOrder = validate(
  Joi.object({
    customerName: Joi.string().optional().allow(''),
    customerPhone: Joi.string().optional().allow(''),
    customerEmail: Joi.string().email().optional().allow(''),
    table: Joi.string().optional().allow(''),
    items: Joi.array().items(
      Joi.object({
        menuItem: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        specialInstructions: Joi.string().optional().allow('')
      })
    ).min(1).required(),
    orderType: Joi.string().valid('dine-in', 'takeaway', 'delivery', 'online').required(),
    deliveryAddress: Joi.object().optional(),
    discount: Joi.number().min(0).optional(),
    specialInstructions: Joi.string().optional().allow(''),
    paymentMethod: Joi.string().valid('cash', 'card', 'upi', 'online', 'wallet').optional()
  })
);

export const validateTable = validate(
  Joi.object({
    tableNumber: Joi.string().required(),
    capacity: Joi.number().min(1).required(),
    floor: Joi.string().optional().allow(''),
    section: Joi.string().optional().allow('')
  })
);

export const validateExpense = validate(
  Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    amount: Joi.number().min(0).required(),
    category: Joi.string().valid('ingredients', 'utilities', 'staff', 'maintenance', 'marketing', 'equipment', 'rent', 'other').optional(),
    date: Joi.date().optional(),
    paymentMethod: Joi.string().valid('cash', 'card', 'upi', 'bank_transfer').optional(),
    isRecurring: Joi.boolean().optional()
  })
);

export default validate;