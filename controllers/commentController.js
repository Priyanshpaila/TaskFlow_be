const Comment = require('../models/commentModel');

exports.addComment = async (req, res) => {
  try {
    const { taskId, text } = req.body;

    const comment = await Comment.create({
      taskId,
      text,
      commentedBy: req.user._id,
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCommentsForTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const comments = await Comment.find({ taskId })
      .populate('commentedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
