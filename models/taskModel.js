const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    priority: {
      type: String,
      enum: ['urgent', 'high', 'medium', 'low', 'easy'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    attachments:{
        type: String,
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
