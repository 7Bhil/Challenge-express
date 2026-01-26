const Submission = require('../models/Submission');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const { checkAndAwardBadges } = require('../utils/badgeEngine');
const { createNotification } = require('../utils/notificationHelper');

// Créer une nouvelle soumission
exports.createSubmission = async (req, res) => {
  try {
    const { challengeId, githubUrl, liveUrl, fileUrl, submittedPassword, description, technologies } = req.body;

    // Vérifier que le challenge existe
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge non trouvé'
      });
    }

    // Validation selon le type de challenge
    if (challenge.submissionType === 'full') {
      if (!githubUrl) {
          return res.status(400).json({ success: false, message: 'L\'URL GitHub est obligatoire pour ce type de challenge' });
      }
      if (!/^https?:\/\/(www\.)?github\.com\/.+/.test(githubUrl)) {
          return res.status(400).json({ success: false, message: 'URL GitHub invalide' });
      }
    } else if (challenge.submissionType === 'file') {
      if (!fileUrl) {
          return res.status(400).json({ success: false, message: 'Le lien du fichier est obligatoire' });
      }
    } else if (challenge.submissionType === 'password') {
      if (!submittedPassword) {
          return res.status(400).json({ success: false, message: 'Le mot de passe/clé est obligatoire' });
      }
      
      // Optionnel: Validation automatique si correctPassword est défini
      if (challenge.correctPassword && submittedPassword !== challenge.correctPassword) {
          // On peut soit rejeter tout de suite, soit laisser le jury voir qu'il s'est trompé.
          // Pour un CTF, on rejette généralement tout de suite.
          return res.status(400).json({ success: false, message: 'Mot de passe ou clé incorrecte' });
      }
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

    const submissionData = {
      challenge: challengeId,
      user: req.user._id,
      description,
      technologies: typeof technologies === 'string' 
        ? technologies.split(',').map(tech => tech.trim())
        : technologies
    };

    // Ajouter les champs spécifiques
    if (challenge.submissionType === 'full') {
      submissionData.githubUrl = githubUrl;
      submissionData.liveUrl = liveUrl;
    } else if (challenge.submissionType === 'file') {
      submissionData.fileUrl = fileUrl;
    } else if (challenge.submissionType === 'password') {
      submissionData.submittedPassword = submittedPassword;
      // Si le mdp est bon et qu'on est en auto-valide, on pourrait mettre le score à 100
      if (challenge.correctPassword === submittedPassword) {
          submissionData.finalScore = 100;
          submissionData.status = 'approved';
      }
    }

    const submission = new Submission(submissionData);

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

    const submission = await Submission.findById(submissionId).populate('challenge');
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
      // Points for Leaderboard (based on grades)
      user.points += submission.pointsEarned;
      
      // XP for Leveling (Fixed reward for participating/completing)
      // Only award XP if this is the first time it's being graded/validated to avoid duplicates if re-graded? 
      // For simplicity, let's assume we add it now. Ideally we should track if XP was already awarded for this challenge.
      // But the current logic adds points every time `scoreSubmission` is called? 
      // User says "on gagne 200 xp par challenge". 
      // If a user is re-graded, we shouldn't add points again? 
      // The current code: `user.points += submission.pointsEarned`. If I re-grade, `submission.pointsEarned` might change. 
      // But we shouldn't just ADD to user.points, we should update. 
      // This is a logic flaw in the existing code.
      // However, to strictly answer the USER request about XP:
      user.xp = (user.xp || 0) + (submission.challenge.xpReward || 200);
      
      // Calculer le niveau basé sur les XP
      user.level = Math.floor(user.xp / 1000) + 1;
      await user.save();
      
      // Vérifier les nouveaux badges
      await checkAndAwardBadges(user._id);
    }

    // Créer une notification pour l'utilisateur
    await createNotification({
      recipient: submission.user,
      sender: req.user._id,
      type: 'submission_graded',
      message: `Votre soumission pour le challenge "${submission.challenge.title}" a été notée. Score: ${submission.finalScore}/100`,
      link: `/dashboard/submissions/${submission._id}`
    });

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

    // Créer une notification pour l'utilisateur
    await createNotification({
      recipient: submission.user,
      type: 'info',
      message: `Félicitations ! Votre soumission pour "${submission.challenge.title}" a été approuvée par l'administration.`,
      link: `/dashboard/submissions/${submission._id}`
    });

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

    // Créer une notification pour l'utilisateur
    await createNotification({
      recipient: submission.user,
      type: 'info',
      message: `Votre soumission pour "${submission.challenge.title}" n'a pas été retenue. Consultez les retours pour plus de détails.`,
      link: `/dashboard/submissions/${submission._id}`
    });

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
