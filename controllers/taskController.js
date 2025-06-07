const Task = require('../models/taskModel');
const User = require('../models/userModel');

// Create a new task (Admin)
exports.createTask = async (req, res) => {
  try {
    // console.log("BODY:", req.body);
    const { title, description, assignedTo, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      createdBy: req.user._id,
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
    const tasks = await Task.find({ assignedTo: req.user._id }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all tasks (Admin only)
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'username email status').populate('createdBy', 'username');
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




exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    const [totalTasks, pendingTasks, inProgressTasks, completedTasks, overdueTasks, activeUsers] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'pending' }),
      Task.countDocuments({ status: 'in_progress' }),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ dueDate: { $lt: now }, status: { $ne: 'completed' } }),
      User.countDocuments({ status: 'active' }),
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

