const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Protect routes - verify JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Format: Bearer <token>
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token payload (which has the user id)
    // We also check that the user still exists and is active
    const currentUser = await User.findById(decoded.id).select('-password');
    
    if (!currentUser) {
      return next(new ApiError(401, 'The user belonging to this token no longer exists.'));
    }

    if (!currentUser.isActive) {
      return next(new ApiError(401, 'User account has been deactivated.'));
    }

    // Add user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }
});

module.exports = { protect };