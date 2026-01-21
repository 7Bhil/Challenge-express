// Middleware pour vérifier les rôles
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Rôle requis: ${allowedRoles.join(' ou ')}`
      });
    }

    next();
  };
};

// Middleware spécifiques pour chaque rôle
const isSuperadmin = checkRole('Superadmin');
const isAdmin = checkRole('Superadmin', 'Admin');
const isJury = checkRole('Superadmin', 'Admin', 'Jury');
const isChallenger = checkRole('Superadmin', 'Admin', 'Jury', 'Challenger');

module.exports = {
  checkRole,
  isSuperadmin,
  isAdmin,
  isJury,
  isChallenger
};
