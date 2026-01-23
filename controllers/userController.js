const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Récupérer tous les utilisateurs (Superadmin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    console.error('❌ Erreur récupération users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('badges.badge');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, passion, level, points, streak } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Mise à jour des champs
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (passion) user.passion = passion;
    if (level !== undefined) user.level = level;
    if (points !== undefined) user.points = points;
    if (streak !== undefined) user.streak = streak;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour user:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Supprimer un utilisateur (Superadmin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher la suppression du dernier Superadmin
    if (user.role === 'Superadmin') {
      const superadminCount = await User.countDocuments({ role: 'Superadmin' });
      if (superadminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer le dernier Superadmin'
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Inscription d'un nouvel utilisateur
exports.registerUser = async (req, res) => {
  const { name, email, password, passion, role } = req.body;
  console.log("Données reçues dans req.body:", req.body); 

  if (!name) {
    return res.status(400).json({ message: "Le nom est manquant dans la requête." });
  }

  try {
    const usercounter = await User.countDocuments();
    let userRole;
    if (usercounter === 0) {
      userRole = 'Superadmin';
    } else {
      userRole = role || 'Challenger';
    }

    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    if (existingUser) {
      return res.status(409).json({ message: "Un compte existe déjà avec cet email ou nom." });
    }

    const newUser = new User({
      name,
      email,
      password,
      passion,
      role: userRole,
    });

    const savedUser = await newUser.save();

    res.status(201).json({ 
      message: "Inscription réussie ! Vous pouvez maintenant vous connecter.", 
      user: { id: savedUser._id, name: savedUser.name }
    });

  } catch (error) {
    console.error("Erreur d'inscription:", error.message);
    res.status(500).json({ message: "Erreur serveur. Veuillez vérifier vos données." });
  }
};

// Mettre à jour le profil de l'utilisateur connecté
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, passion, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (passion) user.passion = passion;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        passion: updatedUser.passion,
        level: updatedUser.level,
        points: updatedUser.points,
        streak: updatedUser.streak,
        avatar: updatedUser.avatar
      }
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Récupérer le leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select('name avatar level points streak role')
      .sort({ points: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};