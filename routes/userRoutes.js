const express = require('express');
const router = express.Router();
const { updateUserStatus, getAllUsers } = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// User updates own status
router.patch('/status', protect, updateUserStatus);

// Admin gets all users
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;
