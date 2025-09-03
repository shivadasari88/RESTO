const express = require('express');
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuItemImage
} = require('../controllers/menuController');
const { protect } = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.route('/')
  .get(getMenuItems);

router.route('/:id')
  .get(getMenuItem);

// Protected admin routes
router.use(protect, authorizeRoles('admin'));

router.route('/')
  .post(createMenuItem);

router.route('/:id')
  .put(updateMenuItem)
  .delete(deleteMenuItem);

router.route('/:id/image')
  .put(upload.single('image'), uploadMenuItemImage);

module.exports = router;