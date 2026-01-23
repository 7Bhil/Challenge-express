const User = require('../models/User');
const Challenge = require('../models/Challenge');

// ============================================
// GESTION DES UTILISATEURS (Admin/Superadmin)
// ============================================

// Promouvoir un utilisateur
exports.promoteUser = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    // Empêcher l'auto-promotion (sécurité)
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre rôle'
      });
    }

    // Vérifier que seul le Superadmin peut promouvoir
    if (req.user.role !== 'Superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Seul le Superadmin peut promouvoir des utilisateurs'
      });
    }

    // Vérifier que le rôle est valide
    const validRoles = ['Challenger', 'Jury', 'Admin', 'Superadmin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    user.role = newRole;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Utilisateur promu au rôle ${newRole}`,
      data: user
    });

  } catch (error) {
    console.error('❌ Erreur promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Rétrograder un utilisateur
exports.demoteUser = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    // Empêcher l'auto-rétrogradation
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre rôle'
      });
    }

    // Vérifier que seul le Superadmin peut rétrograder
    if (req.user.role !== 'Superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Seul le Superadmin peut rétrograder des utilisateurs'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher de rétrograder le dernier Superadmin
    if (user.role === 'Superadmin') {
      const superadminCount = await User.countDocuments({ role: 'Superadmin' });
      if (superadminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de rétrograder le dernier Superadmin'
        });
      }
    }

    user.role = newRole;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Utilisateur rétrogradé au rôle ${newRole}`,
      data: user
    });

  } catch (error) {
    console.error('❌ Erreur rétrogradation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// VALIDATION DES CHALLENGES (Superadmin)
// ============================================

// Récupérer les challenges en attente de validation
exports.getPendingChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ validationStatus: 'pending' })
      .populate('createdBy.user', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: challenges.length,
      data: challenges
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Valider un challenge
exports.approveChallenge = async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge non trouvé'
      });
    }

    challenge.validationStatus = 'approved';
    challenge.validatedBy = req.user._id;
    challenge.validatedAt = new Date();
    challenge.status = 'active';

    await challenge.save();

    res.status(200).json({
      success: true,
      message: 'Challenge approuvé avec succès',
      data: challenge
    });

  } catch (error) {
    console.error('❌ Erreur validation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Rejeter un challenge
exports.rejectChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge non trouvé'
      });
    }

    challenge.validationStatus = 'rejected';
    challenge.validatedBy = req.user._id;
    challenge.validatedAt = new Date();
    challenge.rejectionReason = reason;
    challenge.status = 'inactive';

    await challenge.save();

    res.status(200).json({
      success: true,
      message: 'Challenge rejeté',
      data: challenge
    });

  } catch (error) {
    console.error('❌ Erreur rejet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Récupérer les statistiques (Superadmin)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalChallenges = await Challenge.countDocuments();
    const pendingChallenges = await Challenge.countDocuments({ validationStatus: 'pending' });
    const approvedChallenges = await Challenge.countDocuments({ validationStatus: 'approved' });

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalChallenges,
        pendingChallenges,
        approvedChallenges,
        usersByRole
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
