const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  catId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cat',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: () => new Date().setHours(0, 0, 0, 0),
  },
  recurring: {
    type: Boolean,
    default: false,
  },
  emoji: {
    type: String,
    default: '✅',
  },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
