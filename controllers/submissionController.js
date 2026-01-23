const Submission = require('../models/Submission');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const { checkAndAwardBadges } = require('../utils/badgeEngine');

// Créer une nouvelle soumission
exports.createSubmission = async (req, res) => {
  try {
    const { challengeId, githubUrl, liveUrl, description, technologies } = req.body;

    // Vérifier que le challenge existe
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge non trouvé'
      });
    }

    // Vérifier que l'utilisateur n'a pas déjà soumis pour ce challenge
    const existingSubmission = await Submission.findOne({
      challenge: challengeId,
      user: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà soumis une solution pour ce challenge'
      });
    }

    const submission = new Submission({
      challenge: challengeId,
      user: req.user._id,
      githubUrl,
      liveUrl,
      description,
      technologies: typeof technologies === 'string' 
        ? technologies.split(',').map(tech => tech.trim())
        : technologies
    });

    const savedSubmission = await submission.save();

    res.status(201).json({
      success: true,
      message: 'Soumission créée avec succès!',
      data: savedSubmission
    });

  } catch (error) {
    console.error('❌ Erreur création soumission:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Récupérer toutes les soumissions (pour Admin/Jury)
exports.getAllSubmissions = async (req, res) => {
  try {
    const { status, challengeId } = req.query;
    const filter = {};

    if (status) {
      const statuses = status.split(',');
      filter.status = { $in: statuses };
    }
    if (challengeId) filter.challenge = challengeId;

    const submissions = await Submission.find(filter)
      .populate('user', 'name email avatar')
      .populate('challenge', 'title difficulty')
      .populate('scores.jury', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Récupérer les soumissions d'un utilisateur
exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('challenge', 'title difficulty startDate endDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Récupérer une soumission par ID
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('user', 'name email avatar level')
      .populate('challenge', 'title description difficulty technologies')
      .populate('scores.jury', 'name role');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Noter une soumission (Jury uniquement)
exports.scoreSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { codeQuality, functionality, creativity, performance, documentation, comment } = req.body;

    // Vérifier que l'utilisateur est un Jury
    if (req.user.role !== 'Jury' && req.user.role !== 'Admin' && req.user.role !== 'Superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les jurys peuvent noter les soumissions'
      });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission non trouvée'
      });
    }

    // Vérifier si le jury a déjà noté cette soumission
    const existingScoreIndex = submission.scores.findIndex(
      score => score.jury.toString() === req.user._id.toString()
    );

    const newScore = {
      jury: req.user._id,
      codeQuality,
      functionality,
      creativity,
      performance,
      documentation,
      comment
    };

    if (existingScoreIndex !== -1) {
      // Mettre à jour la note existante
      submission.scores[existingScoreIndex] = newScore;
    } else {
      // Ajouter une nouvelle note
      submission.scores.push(newScore);
    }

    // Calculer le score final
    submission.calculateFinalScore();
    submission.status = 'under_review';

    await submission.save();

    // Mettre à jour les points de l'utilisateur
    const user = await User.findById(submission.user);
    if (user) {
      user.points += submission.pointsEarned;
      // Calculer le niveau basé sur les points
      user.level = Math.floor(user.points / 100) + 1;
      await user.save();
      
      // Vérifier les nouveaux badges
      await checkAndAwardBadges(user._id);
    }

    res.status(200).json({
      success: true,
      message: 'Note enregistrée avec succès',
      data: submission
    });

  } catch (error) {
    console.error('❌ Erreur notation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Approuver une soumission
exports.approveSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission non trouvée'
      });
    }

    submission.status = 'approved';
    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Soumission approuvée',
      data: submission
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Rejeter une soumission
exports.rejectSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission non trouvée'
      });
    }

    submission.status = 'rejected';
    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Soumission rejetée',
      data: submission
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
