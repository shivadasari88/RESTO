const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ApiError(400, 'User already exists with this email'));
  }

  // Create user - password will be hashed by the pre-save middleware in the Model
  const user = await User.create({
    name,
    email,
    password, // This is the plain text password, which will be hashed
    role: role || 'customer' // Default to 'customer' if no role provided
  });

  // Generate JWT token
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ApiError(400, 'Please provide an email and password'));
  }

  // Check for user. Use select('+password') to include the password which is normally select:false
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ApiError(401, 'Invalid credentials'));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ApiError(401, 'Invalid credentials'));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new ApiError(401, 'Account has been deactivated. Please contact admin.'));
  }

  // Generate JWT token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private (Any logged-in user)
const getMe = asyncHandler(async (req, res, next) => {
  // req.user is set by the protect middleware (which runs before this controller)
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

module.exports = {
  register,
  login,
  getMe
};