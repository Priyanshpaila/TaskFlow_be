const Task = require('../models/taskModel');
const User = require('../models/userModel');

// Create a new task (Admin)
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    // Get the logged-in admin's info
    const admin = await User.findById(req.user._id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create tasks' });
    }

    // Check that all assigned users belong to the same division
    const assignedUsers = await User.find({ _id: { $in: assignedTo } });
    const invalidUsers = assignedUsers.filter(u => u.division !== admin.division);
    if (invalidUsers.length > 0) {
      return res.status(400).json({ message: 'Some users are not in your division' });
    }

    // Create task with division from admin
    const task = await Task.create({
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      createdBy: admin._id,
      division: admin.division
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get tasks assigned to the logged-in user
exports.getTasksForUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all admin user IDs
    const adminUsers = await User.find({ role: 'admin' }).select('_id');
    const adminIds = adminUsers.map(admin => admin._id);

    // Fetch tasks:
    // (1) assigned to user AND created by admin
    // OR (2) created by user AND assigned to self (personal tasks)
    const tasks = await Task.find({
      $or: [
        { assignedTo: userId, createdBy: { $in: adminIds } }, // assigned by admin
        { assignedTo: userId, createdBy: userId },            // personal task
      ],
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks for user:', err);
    res.status(500).json({ message: err.message });
  }
};


// Get all tasks (Admin only, filtered by division)
exports.getAllTasks = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view all tasks' });
    }

    const tasks = await Task.find({ division: admin.division })
      .populate('assignedTo', 'username email status')
      .populate('createdBy', 'username');

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update task status (User)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!task.assignedTo.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dashboard stats (filtered by division for admins)
exports.getDashboardStats = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access stats' });
    }

    const now = new Date();
    const query = { division: admin.division };

    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      activeUsers
    ] = await Promise.all([
      Task.countDocuments(query),
      Task.countDocuments({ ...query, status: 'pending' }),
      Task.countDocuments({ ...query, status: 'in_progress' }),
      Task.countDocuments({ ...query, status: 'completed' }),
      Task.countDocuments({ ...query, dueDate: { $lt: now }, status: { $ne: 'completed' } }),
      User.countDocuments({ division: admin.division, status: 'active' }),
    ]);

    res.json({
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      activeUsers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload attachments to task
exports.uploadAttachment = async (req, res) => {
  try {
    const taskId = req.params.id;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!task.attachments) task.attachments = [];
    task.attachments.push(file.filename);

    await task.save();

    res.status(200).json({ message: 'File uploaded', filename: file.filename });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Create a new task (Admin or User)
exports.createTaskByAnyUser = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized user' });
    }

    const assignedUsers = await User.find({ _id: { $in: assignedTo } });

    // Create task with division from current user
    const task = await Task.create({
      title,
      description,
      assignedTo: [user._id], // 🔒 Assign only to self
      priority,
      dueDate,
      createdBy: user._id,
      division: user.division, // still associate with user's division
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// Edit an existing task (Admin or Task Creator)
exports.editTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const taskId = req.params.id;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: 'Unauthorized user' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only allow admins or the task creator to edit
    const isAdmin = user.role === 'admin';
    const isCreator = task.createdBy.toString() === req.user._id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'You are not authorized to edit this task' });
    }

    // If assignedTo is updated, verify division matches (only for admin)
    if (assignedTo && isAdmin) {
      const assignedUsers = await User.find({ _id: { $in: assignedTo } });
      const invalidUsers = assignedUsers.filter(u => u.division !== user.division);
      if (invalidUsers.length > 0) {
        return res.status(400).json({ message: 'Some assigned users are not in your division' });
      }
      task.assignedTo = assignedTo;
    }

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;

    await task.save();

    res.json({ message: 'Task updated', task });
  } catch (err) {
    console.error('Edit Task Error:', err);
    res.status(500).json({ message: err.message });
  }
};

