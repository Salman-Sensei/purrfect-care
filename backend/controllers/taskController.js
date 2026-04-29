const Task = require('../models/Task');

// @desc    Get tasks (optionally filtered by catId and date)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { catId, date } = req.query;
    const query = { userId: req.user._id };

    if (catId) query.catId = catId;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const tasks = await Task.find(query).populate('catId', 'name').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { catId, title, date, recurring, emoji } = req.body;

    if (!catId || !title) {
      return res.status(400).json({ message: 'Cat and title are required' });
    }

    const task = await Task.create({
      userId: req.user._id,
      catId, title, date, recurring, emoji,
    });

    const populated = await task.populate('catId', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id
// @access  Private
const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.completed = !task.completed;
    const updated = await task.save();
    await updated.populate('catId', 'name');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const fields = ['title', 'completed', 'date', 'recurring', 'emoji'];
    fields.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });

    const updated = await task.save();
    await updated.populate('catId', 'name');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

module.exports = { getTasks, createTask, toggleTask, updateTask, deleteTask };
