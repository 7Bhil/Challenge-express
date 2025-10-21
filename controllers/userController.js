const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

// Inscription d'un nouvel utilisateur
// controllers/userController.js


// --- Logique d'Inscription (POST /api/users/register) ---
exports.registerUser = async (req, res) => {
    // Le corps de la requête contient: name, email, password, passion, role
    const { name, email, password, passion, role } = req.body;
    console.log("Données reçues dans req.body:", req.body); 

    if (!name) {
        // Cette vérification simple vous aidera à déboguer rapidement
        return res.status(400).json({ message: "Le nom est manquant dans la requête." });
    }

    try {
        // 1. On utilise 'name' comme 'username' pour la cohérence avec le front-end
        const usercounter = await User.countDocuments();
         let userRole;
         if (usercounter === 0) {
             userRole = 'Superadmin'; // Premier utilisateur
         } else {
             userRole = role || 'Challenger'; // Rôle par défaut
         }
        // 2. Vérification de l'existence (Email ou Nom déjà utilisé)
        const existingUser = await User.findOne({ $or: [{ email }, { name }] });
        if (existingUser) {
            // Statut 409: Conflict est souvent plus précis pour les doublons
            return res.status(409).json({ message: "Un compte existe déjà avec cet email ou nom." });
        }

        // 3. Création et Sauvegarde du nouvel utilisateur
        // Le HACHAGE du mot de passe se fait AUTOMATIQUEMENT dans le hook 'pre-save' du Modèle !
        const newUser = new User({
            name,
            email,
            password,
            passion,
            role: userRole, // 'Challenger' par défaut
        });

        const savedUser = await newUser.save();

        // 4. Succès de la réponse
        res.status(201).json({ 
            message: "Inscription réussie ! Vous pouvez maintenant vous connecter.", 
            user: { id: savedUser._id, username: savedUser.username }
        });

    } catch (error) {
        // En cas d'erreur de validation Mongoose ou autre
        console.error("Erreur d'inscription:", error.message);
        res.status(500).json({ message: "Erreur serveur. Veuillez vérifier vos données." });
    }
};

// Connexion d'un utilisateur existant
exports.loginUser = async (req, res) => {
        const { email, password } = req.body;

  try {
    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Email ou mot de passe incorrect" });
    }
    const token = jwt.sign(
        { id: user._id, role: user.role},
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
    );

    res.status(200).json({ message: "Connexion réussie",
        token,
        user: {
            id: user._id,
            email: user.email,
            role: user.role
        }
    });
  } catch (err) {
    console.error("Erreur de connexion:", err)
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
}