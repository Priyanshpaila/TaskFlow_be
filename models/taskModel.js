const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,

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

    dueDate: Date,

    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'forward', 'abort'],
      default: 'pending',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    attachments: String,

    division: {
      type: String,
      required: true,
    },

    reason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
