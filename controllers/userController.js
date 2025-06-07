const User = require('../models/userModel');
const bcrypt = require('bcryptjs');


// Update current user's status
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['active', 'inactive', 'dnd', 'away'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const user = await User.findById(req.user._id);
    user.status = status;
    await user.save();

    res.json({ message: 'Status updated', status: user.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users (restricted to admin's division)
exports.getAllUsers = async (req, res) => {
  try {
    // Find the currently logged-in admin
    const admin = await User.findById(req.user._id);

    // If the user is not an admin, deny access
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Not an admin' });
    }

    // Fetch users only from the same division
    const users = await User.find({ division: admin.division })
      .select('username email status role division');

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update profile with optional password change
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, email, currentPassword, newPassword } = req.body;

    // Optional: Update username and email
    if (username) user.username = username;
    if (email) user.email = email;

    // If changing password
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      user.password = newPassword; // Will be hashed via pre-save middleware
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        division: user.division,
        status: user.status,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
