import MenuItem from '../models/MenuItem.js';
import { Category } from '../models/index.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Helper: parse booleans and numbers from FormData strings
const parseFormData = (body) => {
  const boolFields = ['isVegetarian', 'isVegan', 'isGlutenFree', 'isSpicy', 'isAvailable', 'isFeatured'];
  const numFields = ['price', 'discountedPrice', 'spiceLevel', 'preparationTime'];
  const arrFields = ['ingredients', 'allergens', 'tags'];

  const parsed = { ...body };

  boolFields.forEach(f => {
    if (f in parsed) parsed[f] = parsed[f] === 'true' || parsed[f] === true;
  });

  numFields.forEach(f => {
    if (parsed[f] !== undefined && parsed[f] !== '') {
      parsed[f] = parseFloat(parsed[f]);
    } else if (f === 'discountedPrice' && (parsed[f] === '' || parsed[f] === undefined)) {
      delete parsed[f]; // remove empty discountedPrice so it's not saved as NaN
    }
  });

  // Arrays — FormData sends repeated keys or comma-separated strings
  arrFields.forEach(f => {
    if (!parsed[f]) { parsed[f] = []; return; }
    if (typeof parsed[f] === 'string') {
      parsed[f] = parsed[f].split(',').map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsed[f])) parsed[f] = [parsed[f]];
  });

  // Nutrition info — comes as flat fields: calories, protein, carbs, fat
  const nutrition = {};
  ['calories', 'protein', 'carbs', 'fat'].forEach(k => {
    if (parsed[k] !== undefined && parsed[k] !== '') {
      nutrition[k] = parseFloat(parsed[k]);
      delete parsed[k];
    }
  });
  if (Object.keys(nutrition).length > 0) parsed.nutritionInfo = nutrition;

  return parsed;
};

// Validate required fields after FormData parsing
const validateMenuItemData = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (data.name && data.name.length > 100) errors.push('Name cannot exceed 100 characters');
  if (!data.category) errors.push('Category is required');
  if (data.price === undefined || isNaN(data.price) || data.price < 0) errors.push('Valid price is required');
  if (data.discountedPrice !== undefined && data.discountedPrice >= data.price) errors.push('Discounted price must be less than original price');
  if (data.spiceLevel !== undefined && (data.spiceLevel < 0 || data.spiceLevel > 5)) errors.push('Spice level must be 0–5');
  return errors;
};

// @desc    Get all menu items
// @route   GET /api/menu
export const getMenuItems = async (req, res, next) => {
  try {
    const { category, search, isVegetarian, isVegan, isAvailable, isFeatured, sort, page = 1, limit = 50, minPrice, maxPrice } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    if (isVegetarian === 'true') query.isVegetarian = true;
    if (isVegan === 'true') query.isVegan = true;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (isFeatured === 'true') query.isFeatured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      popular: { orderCount: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { 'ratings.average': -1 }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await MenuItem.countDocuments(query);
    const items = await MenuItem.find(query)
      .populate('category', 'name icon color')
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: items,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), limit: parseInt(limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
export const getMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate('category', 'name icon color')
      .populate('createdBy', 'name');
    if (!item) return next(new AppError('Menu item not found.', 404));
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Create menu item
// @route   POST /api/menu  (multipart/form-data OR application/json)
export const createMenuItem = async (req, res, next) => {
  try {
    const itemData = parseFormData({ ...req.body, createdBy: req.user._id });

    // Validate
    const errors = validateMenuItemData(itemData);
    if (errors.length > 0) return next(new AppError(errors.join(', '), 400));

    // Image: file upload takes priority, then imageUrl field
    if (req.file) {
      itemData.image = await uploadToCloudinary(req.file.buffer, 'rasoi/menu');
    } else if (itemData.imageUrl && itemData.imageUrl.trim()) {
      itemData.image = itemData.imageUrl.trim();
      delete itemData.imageUrl;
    }

    // Verify category exists
    const category = await Category.findById(itemData.category);
    if (!category) return next(new AppError('Category not found.', 404));

    const item = await MenuItem.create(itemData);
    await item.populate('category', 'name icon color');

    res.status(201).json({ success: true, message: 'Menu item created!', data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
export const updateMenuItem = async (req, res, next) => {
  try {
    const updateData = parseFormData({ ...req.body });

    // Image handling
    if (req.file) {
      updateData.image = await uploadToCloudinary(req.file.buffer, 'rasoi/menu');
    } else if (updateData.imageUrl && updateData.imageUrl.trim()) {
      updateData.image = updateData.imageUrl.trim();
      delete updateData.imageUrl;
    }

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('category', 'name icon color');

    if (!item) return next(new AppError('Menu item not found.', 404));
    res.json({ success: true, message: 'Menu item updated!', data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
export const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return next(new AppError('Menu item not found.', 404));
    res.json({ success: true, message: 'Menu item deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle availability
// @route   PATCH /api/menu/:id/availability
export const toggleAvailability = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return next(new AppError('Menu item not found.', 404));
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({
      success: true,
      message: `Item marked as ${item.isAvailable ? 'available' : 'unavailable'}.`,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories
// @route   GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Category created!', data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return next(new AppError('Category not found.', 404));
    res.json({ success: true, message: 'Category updated!', data: category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const itemCount = await MenuItem.countDocuments({ category: req.params.id });
    if (itemCount > 0) return next(new AppError(`Cannot delete category with ${itemCount} menu items.`, 400));
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};