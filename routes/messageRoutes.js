const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { optionalAuth } = require('../middleware/auth');

// Get messages for a room
router.get('/:room', optionalAuth, async (req, res) => {
  try {
    const { room } = req.params;
    const messages = await Message.find({ room })
      .sort({ createdAt: 1 }) // Oldest first
      .limit(100); // Limit to last 100 messages to prevent overload
      
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
});

module.exports = router;
