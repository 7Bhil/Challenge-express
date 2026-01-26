const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    default: 'community_general'
  },
  author: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  time: {
    type: String // We simply store the display time formatted string for now, or Date if we want to reformat on client
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
