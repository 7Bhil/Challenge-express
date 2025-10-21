const User = require("../models/User"); // ⬅️ ASSURE-TOI QUE CETTE LIGNE EXISTE

exports.checkAuth = async (req, res) => {
  try {
    console.log("🔍 Début checkAuth");
    const user = await User.findOne().select("-password");
    
    // TEMPORAIRE : Renvoie des données SIMPLES
    res.status(200).json({
      _id: "123",
      username: "Bhil",
      email: "test@example.com",
      role: "Superadmin", 
      level: 1,
      points: 1000,
      streak: 7,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bhil"
    });
    
  } catch (error) {
    console.log("💥 ERREUR:", error.message);
    res.status(500).json({ message: error.message });
  }
};