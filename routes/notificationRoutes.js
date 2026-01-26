const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth'); // Assuming you have an auth middleware
const mongoose = require('mongoose');

// GET /api/notifications - Get all notifications for the current user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .limit(50); // Limit to last 50 notifications
    
    // Count unread
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id, 
      read: false 
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des notifications' });
  }
});

// PUT /api/notifications/:id/read - Mark a specific notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/notifications - Create a notification (Internal/Admin use mostly, or via other controllers)
// For testing purposes, we can expose this, but generally notifications are side-effects.
// We'll keep it simple for now and rely on other controllers to import the model directly.

module.exports = router;
