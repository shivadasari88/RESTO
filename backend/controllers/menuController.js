const MenuItem = require('../models/MenuItem');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = asyncHandler(async (req, res, next) => {
  // Start with filtering for available items only for public access
  let filter = { availability: true };

  // Handle category filter
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Handle price filters
  if (req.query['price[lt]']) {
    filter.price = { ...filter.price, $lt: parseFloat(req.query['price[lt]']) };
  }
  if (req.query['price[lte]']) {
    filter.price = { ...filter.price, $lte: parseFloat(req.query['price[lte]']) };
  }
  if (req.query['price[gt]']) {
    filter.price = { ...filter.price, $gt: parseFloat(req.query['price[gt]']) };
  }
  if (req.query['price[gte]']) {
    filter.price = { ...filter.price, $gte: parseFloat(req.query['price[gte]']) };
  }

  // Handle dietary filters
  if (req.query.isVegetarian === 'true') {
    filter.isVegetarian = true;
  }
  if (req.query.isVegan === 'true') {
    filter.isVegan = true;
  }

  // Build query
  let query = MenuItem.find(filter);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('category name'); // Default sort
  }

  // Field limiting (projection)
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v'); // Exclude __v by default
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  
  // Get total count for pagination
  const total = await MenuItem.countDocuments(filter);

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const menuItems = await query;

  // Pagination result
  const pagination = {};
  
  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: menuItems.length,
    pagination,
    data: menuItems
  });
});

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItem = asyncHandler(async (req, res, next) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return next(new ApiError(404, `Menu item not found with id of ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    data: menuItem
  });
});

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.addedBy = req.user.id;

  const menuItem = await MenuItem.create(req.body);

  res.status(201).json({
    success: true,
    data: menuItem
  });
});

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = asyncHandler(async (req, res, next) => {
  let menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return next(new ApiError(404, `Menu item not found with id of ${req.params.id}`));
  }

  menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: menuItem
  });
});

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = asyncHandler(async (req, res, next) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return next(new ApiError(404, `Menu item not found with id of ${req.params.id}`));
  }

  await menuItem.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload image for menu item
// @route   PUT /api/menu/:id/image
// @access  Private/Admin
const uploadMenuItemImage = asyncHandler(async (req, res, next) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return next(new ApiError(404, `Menu item not found with id of ${req.params.id}`));
  }

  if (!req.file) {
    return next(new ApiError(400, 'Please upload an image file'));
  }

  // Update the image URL - construct the path that will be accessible from the frontend
  menuItem.imageUrl = `/uploads/${req.file.filename}`;
  await menuItem.save();

  res.status(200).json({
    success: true,
    data: menuItem
  });
});

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuItemImage
};