const Challenge = require('../models/Challenge');

// Créer un nouveau challenge
exports.createChallenge = async (req, res) => {
  try {
    console.log('✅ createChallenge appelé');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    const challengeData = {
      ...req.body,
      createdBy: {
        user: req.user._id,
        name: req.user.name,
        role: req.user.role
      },
      technologies: typeof req.body.technologies === 'string' 
        ? req.body.technologies.split(',').map(tech => tech.trim())
        : req.body.technologies
    };

    console.log('Challenge data:', challengeData);
    
    const challenge = new Challenge(challengeData);
    const savedChallenge = await challenge.save();
    
    console.log('✅ Challenge sauvegardé:', savedChallenge._id);
    
    res.status(201).json({
      success: true,
      message: 'Challenge créé avec succès!',
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
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    
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