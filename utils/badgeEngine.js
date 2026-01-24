const Badge = require('../models/Badge');
const User = require('../models/User');
const Submission = require('../models/Submission');

const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId).populate('badges.badge');
    if (!user) return;

    // Récupérer tous les badges disponibles
    const allBadges = await Badge.find({});
    
    // Récupérer le nombre de soumissions de l'utilisateur
    const submissionsCount = await Submission.countDocuments({ user: userId });
    
    // Vérifier si l'utilisateur a un score parfait (dernière soumission)
    const lastSubmission = await Submission.findOne({ user: userId }).sort({ createdAt: -1 });
    const hasPerfectScore = lastSubmission && lastSubmission.finalScore === 100; // Si le score est sur 100

    for (const badge of allBadges) {
      let qualifies = false;
      
      // Vérifier si l'utilisateur remplit les conditions
      switch (badge.requirementType) {
        case 'points':
          if (user.points >= badge.requirementValue) qualifies = true;
          break;
        case 'submissions':
          if (submissionsCount >= badge.requirementValue) qualifies = true;
          break;
        case 'streak':
          if (user.streak >= badge.requirementValue) qualifies = true;
          break;
        case 'perfect_score':
          if (hasPerfectScore) qualifies = true;
          break;
        case 'ranking_top3':
          // Géré par le finalizeChallenge ou podium interactif
          break;
      }

      if (qualifies) {
        await awardBadge(user, badge._id);
      }
    }

    await user.save();
  } catch (error) {
    console.error('Erreur Badge Engine:', error);
  }
};

const awardBadge = async (user, badgeId, isRanking = false) => {
    // Vérifier si l'utilisateur l'a déjà
    const existingBadgeIndex = user.badges.findIndex(b => {
        const bId = b.badge && b.badge._id ? b.badge._id.toString() : (b.badge ? b.badge.toString() : null);
        return bId === badgeId.toString();
    });

    if (existingBadgeIndex !== -1) {
        // Si c'est un badge de classement (Top 1, 2, 3), on incrémente le multiplicateur
        if (isRanking) {
            user.badges[existingBadgeIndex].count += 1;
            user.badges[existingBadgeIndex].earnedAt = new Date();
        }
        // Sinon, on ne fait rien (on ne gagne pas deux fois le badge "1000 points")
    } else {
        // Nouvel accomplissement !
        user.badges.push({
            badge: badgeId,
            count: 1,
            earnedAt: new Date()
        });
    }
};

module.exports = { checkAndAwardBadges, awardBadge };
