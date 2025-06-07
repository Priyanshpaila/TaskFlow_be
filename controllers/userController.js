const User = require('../models/userModel');

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

// Get all users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('username email status role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
