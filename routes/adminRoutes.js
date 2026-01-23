const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isSuperadmin, isAdmin } = require('../middleware/roleCheck');

// Routes Superadmin uniquement
router.post('/users/promote', protect, isSuperadmin, adminController.promoteUser);
router.post('/users/demote', protect, isSuperadmin, adminController.demoteUser);
router.get('/challenges/pending', protect, isSuperadmin, adminController.getPendingChallenges);
router.patch('/challenges/:id/approve', protect, isSuperadmin, adminController.approveChallenge);
router.patch('/challenges/:id/reject', protect, isSuperadmin, adminController.rejectChallenge);
router.get('/stats', protect, isSuperadmin, adminController.getStats);
router.patch('/challenges/:id/finalize', protect, isSuperadmin, adminController.finalizeChallenge);

module.exports = router;
