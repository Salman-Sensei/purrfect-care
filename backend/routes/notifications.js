const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User    = require('../models/User');
const { sendDailyDigest } = require('../services/emailService');

// @desc  Get notification preferences
// @route GET /api/notifications/preferences
router.get('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('emailNotifications email name');
    res.json({ emailNotifications: user.emailNotifications, email: user.email });
  } catch {
    res.status(500).json({ message: 'Failed to fetch preferences' });
  }
});

// @desc  Update notification preferences
// @route PUT /api/notifications/preferences
router.put('/preferences', protect, async (req, res) => {
  try {
    const { emailNotifications } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { emailNotifications },
      { new: true }
    ).select('emailNotifications email');
    res.json({ emailNotifications: user.emailNotifications });
  } catch {
    res.status(500).json({ message: 'Failed to update preferences' });
  }
});

// @desc  Send test digest to current user immediately
// @route POST /api/notifications/send-test
router.post('/send-test', protect, async (req, res) => {
  try {
    const user   = await User.findById(req.user._id).select('email name');
    const result = await sendDailyDigest(req.user._id, user.email, user.name);
    if (result.skipped) {
      return res.json({ message: 'No tasks or vet appointments to report — nothing was sent.', skipped: true });
    }
    res.json({
      message: `Email sent to ${user.email}! Check your inbox. 📧`,
      taskCount: result.taskCount,
      vetCount:  result.vetCount,
    });
  } catch (err) {
    console.error('Email send error:', err.message);
    res.status(500).json({ message: `Failed to send email: ${err.message}` });
  }
});

module.exports = router;
