const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 * @param {Object} options - Notification options
 * @param {string} options.recipient - ID of the user receiving the notification
 * @param {string} [options.sender] - ID of the user sending the notification (optional)
 * @param {string} options.type - Type of notification ('challenge_created', 'submission_graded', 'badge_earned', 'info', 'other')
 * @param {string} options.message - Notification message
 * @param {string} [options.link] - Optional link to redirect the user
 */
const createNotification = async ({ recipient, sender, type, message, link }) => {
  try {
    const notification = new Notification({
      recipient,
      sender,
      type,
      message,
      link
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // We don't necessarily want to throw and crash the main process if a notification fails
    return null;
  }
};

module.exports = {
  createNotification
};
