const Badge = require('../models/Badge');
const User = require('../models/User');

const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId).populate('badges.badge');
    if (!user) return;

    // Récupérer tous les badges disponibles
    const allBadges = await Badge.find({});

    for (const badge of allBadges) {
      let qualifies = false;
      
      // Vérifier si l'utilisateur remplit les conditions
      switch (badge.requirementType) {
        case 'points':
          if (user.points >= badge.requirementValue) qualifies = true;
          break;
        case 'submissions':
          // Logique pour compter les soumissions (peut-être ajouter un champ submissionsCount dans User pour optimiser?)
          // Pour l'instant on simule ou on fait une requête si nécessaire
          break;
        case 'streak':
          if (user.streak >= badge.requirementValue) qualifies = true;
          break;
        case 'ranking_top3':
          // Cette partie sera gérée manuellement ou via une logique de podium
          break;
      }

      if (qualifies) {
        await awardBadge(user, badge);
      }
    }

    await user.save();
  } catch (error) {
    console.error('Erreur Badge Engine:', error);
  }
};

const awardBadge = async (user, badgeId, isRanking = false) => {
    // Vérifier si l'utilisateur l'a déjà
    const existingBadgeIndex = user.badges.findIndex(b => 
        b.badge._id.toString() === badgeId.toString() || b.badge.toString() === badgeId.toString()
    );

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
