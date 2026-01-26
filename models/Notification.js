const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['challenge_created', 'submission_graded', 'badge_earned', 'info', 'other'],
    default: 'info'
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String // Optional link to redirect the user (e.g., to the challenge detail)
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
