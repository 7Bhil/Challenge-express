const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour vérifier le token
const auth = async (req, res, next) => {
  try {
    console.log('🔐 Middleware auth appelé');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    console.log('✅ Token trouvé, vérification...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token décodé:', decoded);
    
    const user = await User.findById(decoded.id).select('-password');
    console.log('✅ User trouvé:', user ? user.name : 'NULL');
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = user;
    console.log('✅ Auth réussie, passage au contrôleur');
    next();
  } catch (error) {
    console.error('❌ Erreur auth:', error.message);
    res.status(401).json({ error: 'Token invalide' });
  }
};

module.exports = { auth };