const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isSuperadmin, isAdmin } = require('../middleware/roleCheck');

// Routes Superadmin uniquement
// Routes Superadmin (Gestion des rôles)
router.post('/users/promote', protect, isSuperadmin, adminController.promoteUser);
router.post('/users/demote', protect, isSuperadmin, adminController.demoteUser);
router.get('/stats', protect, isSuperadmin, adminController.getStats);

// Routes Admin (Gestion des challenges et soumissions)
router.get('/challenges/pending', protect, isAdmin, adminController.getPendingChallenges);
router.patch('/challenges/:id/approve', protect, isAdmin, adminController.approveChallenge);
router.patch('/challenges/:id/reject', protect, isAdmin, adminController.rejectChallenge);
router.patch('/challenges/:id/finalize', protect, isAdmin, adminController.finalizeChallenge);
router.delete('/challenges/:id', protect, isAdmin, adminController.deleteChallenge);

// Gestion Users (Delete - Désactivé dans le controller)
router.delete('/users/:id', protect, isSuperadmin, adminController.deleteUser);

module.exports = router;
