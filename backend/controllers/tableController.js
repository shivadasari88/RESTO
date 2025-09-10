const Table = require('../models/Table');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private/Admin
const getTables = asyncHandler(async (req, res, next) => {
  const tables = await Table.find().sort({ tableNumber: 1 });
  
  res.status(200).json({
    success: true,
    count: tables.length,
    data: tables
  });
});

// @desc    Create new table
// @route   POST /api/tables
// @access  Private/Admin
const createTable = asyncHandler(async (req, res, next) => {
  const { tableNumber, capacity } = req.body;

  // Check if table number already exists
  const existingTable = await Table.findOne({ tableNumber });
  if (existingTable) {
    return next(new ApiError(400, 'Table number already exists'));
  }

  const table = await Table.create({
    tableNumber,
    capacity,
    qrCode: `table-${tableNumber}`
  });

  res.status(201).json({
    success: true,
    data: table
  });
});

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private/Admin
const updateTable = asyncHandler(async (req, res, next) => {
  let table = await Table.findById(req.params.id);

  if (!table) {
    return next(new ApiError(404, 'Table not found'));
  }

  // Check if table number is being changed and if it already exists
  if (req.body.tableNumber && req.body.tableNumber !== table.tableNumber) {
    const existingTable = await Table.findOne({ tableNumber: req.body.tableNumber });
    if (existingTable) {
      return next(new ApiError(400, 'Table number already exists'));
    }
  }

  table = await Table.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: table
  });
});

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
const deleteTable = asyncHandler(async (req, res, next) => {
  const table = await Table.findById(req.params.id);

  if (!table) {
    return next(new ApiError(404, 'Table not found'));
  }

  if (table.isOccupied) {
    return next(new ApiError(400, 'Cannot delete an occupied table'));
  }

  await table.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get available tables
// @route   GET /api/tables/available
// @access  Public
const getAvailableTables = asyncHandler(async (req, res, next) => {
  const tables = await Table.find({ isOccupied: false }).sort({ tableNumber: 1 });
  
  res.status(200).json({
    success: true,
    count: tables.length,
    data: tables
  });
});

module.exports = {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getAvailableTables
};