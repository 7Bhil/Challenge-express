const Badge = require('../models/Badge');

// Obtenir tous les badges
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find().sort({ rarity: 1 });
    res.status(200).json({
      success: true,
      data: badges
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Créer un badge (Admin)
exports.createBadge = async (req, res) => {
  try {
    const badge = new Badge(req.body);
    await badge.save();
    res.status(201).json({
      success: true,
      data: badge
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Supprimer un badge (Admin)
exports.deleteBadge = async (req, res) => {
  try {
    await Badge.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Badge supprimé' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erreur lors de la suppression' });
  }
};
