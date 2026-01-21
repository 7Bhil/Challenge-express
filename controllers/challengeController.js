const Challenge = require('../models/Challenge');

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
    let filter = {};
    
    // Les utilisateurs normaux ne voient que les challenges approuvés
    // Les Admins et Superadmins voient tous les challenges
    if (req.user && (req.user.role === 'Superadmin' || req.user.role === 'Admin')) {
      // Pas de filtre, voir tous les challenges
    } else {
      filter.validationStatus = 'approved';
    }

    const challenges = await Challenge.find(filter).sort({ createdAt: -1 });
    
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

// Récupérer un challenge par ID
exports.getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: challenge
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};