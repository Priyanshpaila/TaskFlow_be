const express = require('express');
const router = express.Router();
const { updateUserStatus, getAllUsers,updateUserProfile } = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// User updates own status
router.patch('/status', protect, updateUserStatus);

// User updates own profile
router.patch('/me/update', protect, updateUserProfile);


// Admin gets all users
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;
