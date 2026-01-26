const Challenge = require('../models/Challenge');
const mongoose = require('mongoose');

// Créer un nouveau challenge
exports.createChallenge = async (req, res) => {
  try {
    console.log('✅ createChallenge appelé');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    // Déterminer le statut de validation selon le rôle
    let validationStatus = 'pending';
    let validatedBy = null;
    let validatedAt = null;

    if (req.user.role === 'Superadmin') {
      validationStatus = 'approved';
      validatedBy = req.user._id;
      validatedAt = new Date();
    }

    const challengeData = {
      ...req.body,
      createdBy: {
        user: req.user._id,
        name: req.user.name,
        role: req.user.role
      },
      technologies: typeof req.body.technologies === 'string' 
        ? req.body.technologies.split(',').map(tech => tech.trim())
        : req.body.technologies,
      validationStatus,
      validatedBy,
      validatedAt
    };

    console.log('Challenge data:', challengeData);
    
    const challenge = new Challenge(challengeData);
    const savedChallenge = await challenge.save();
    
    console.log('✅ Challenge sauvegardé:', savedChallenge._id);
    
    res.status(201).json({
      success: true,
      message: validationStatus === 'approved' 
        ? 'Challenge créé et approuvé automatiquement!' 
        : 'Challenge créé, en attente de validation par le Superadmin',
      data: savedChallenge
    });
    
  } catch (error) {
    console.error('❌ Erreur création challenge:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Récupérer tous les challenges
exports.getAllChallenges = async (req, res) => {
  try {
    let matchStage = {};
    
    // Les utilisateurs normaux ne voient que les challenges approuvés et non expirés, 
    // SAUF s'ils demandent explicitement les archives (pour le leaderboard)
    if (req.user && (req.user.role === 'Superadmin' || req.user.role === 'Admin')) {
      // Admins voient tout
      if (req.query.status) {
        matchStage.status = req.query.status;
      }
    } else {
      if (req.query.type === 'archived') {
        matchStage = {
          validationStatus: 'approved',
          $or: [
            { endDate: { $lt: new Date() } },
            { status: 'completed' }
          ]
        };
      } else {
        matchStage = {
          validationStatus: 'approved',
          endDate: { $gte: new Date() },
          status: 'active'
        };
      }
    }

    const challenges = await Challenge.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'challenge',
          as: 'submissions'
        }
      },
      {
        $addFields: {
          participantCount: {
            $size: {
              $setUnion: ["$submissions.user", []] // Obtenir les utilisateurs uniques
            }
          }
        }
      },
      {
        $project: {
          submissions: 0 // Ne pas renvoyer les soumissions complètes pour alléger
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      count: challenges.length,
      data: challenges
    });
    
  } catch (error) {
    console.error('Erreur getAllChallenges:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Récupérer un challenge par ID
exports.getChallengeById = async (req, res) => {
  try {
    const challengeId = new mongoose.Types.ObjectId(req.params.id);

    const challenges = await Challenge.aggregate([
      { $match: { _id: challengeId } },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'challenge',
          as: 'submissions'
        }
      },
      {
        $addFields: {
          participantCount: {
            $size: {
              $setUnion: ["$submissions.user", []]
            }
          }
        }
      },
      {
        $project: {
          submissions: 0
        }
      }
    ]);

    if (!challenges.length) {
      return res.status(404).json({
        success: false,
        message: 'Challenge non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: challenges[0]
    });
    
  } catch (error) {
    console.error('Erreur getChallengeById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Récupérer le classement d'un challenge
exports.getChallengeLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    const Submission = require('../models/Submission');

    const leaderboard = await Submission.find({
      challenge: id,
      status: { $in: ['approved', 'under_review'] },
      finalScore: { $gt: 0 }
    })
    .populate('user', 'name avatar level')
    .sort({ finalScore: -1 })
    .limit(100);

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Erreur getChallengeLeaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Se porter volontaire comme jury pour un challenge
exports.volunteerAsJudge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge non trouvé' });
    }

    // Autoriser Jury, Admin et Superadmin
    if (req.user.role !== 'Jury' && req.user.role !== 'Admin' && req.user.role !== 'Superadmin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Seuls les membres du jury ou les admins peuvent se porter volontaires' 
      });
    }

    if (challenge.judges.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Vous êtes déjà jury pour ce challenge' });
    }

    challenge.judges.push(req.user._id);
    await challenge.save();

    res.status(200).json({
      success: true,
      message: 'Vous êtes maintenant jury pour ce challenge',
      data: challenge
    });
  } catch (error) {
    console.error('Erreur volunteerAsJudge:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Se retirer du jury d'un challenge
exports.leaveJudgeRole = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge non trouvé' });
    }

    challenge.judges = challenge.judges.filter(id => id.toString() !== req.user._id.toString());
    await challenge.save();

    res.status(200).json({
      success: true,
      message: "Vous n'êtes plus jury pour ce challenge",
      data: challenge
    });
  } catch (error) {
    console.error('Erreur leaveJudgeRole:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = exports;