const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

router.get('/', badgeController.getAllBadges);

// Protégé - Admin uniquement
router.post('/', protect, isAdmin, badgeController.createBadge);
router.delete('/:id', protect, isAdmin, badgeController.deleteBadge);

module.exports = router;
