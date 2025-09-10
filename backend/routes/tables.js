const express = require('express');
const {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getAvailableTables
} = require('../controllers/tableController');
const { protect } = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

// Public route
router.get('/available', getAvailableTables);

// Protected admin routes
router.use(protect, authorizeRoles('admin'));

router.route('/')
  .get(getTables)
  .post(createTable);


  
router.route('/:id')
  .put(updateTable)
  .delete(deleteTable);

module.exports = router;