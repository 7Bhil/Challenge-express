// Import des modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser"); // ⚠️ AJOUTE ÇA

// Charger les variables d'environnement
dotenv.config();

// Initialiser Express
const app = express();

// ============================================
// CONFIGURATION CORS (UNE SEULE FOIS !)
// ============================================
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// ============================================
// MIDDLEWARES
// ============================================
app.use(cookieParser()); // ⚠️ AJOUTE ÇA pour lire les cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ❌ SUPPRIME CE BLOC (tu l'as déjà au-dessus)
// app.use(express.json()); 
// app.use(cors()); // ← ⚠️ C'EST CE CORS() QUI CAUSE LE PROBLÈME !

// ============================================
// ROUTES
// ============================================
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
// ============================================
// ROUTE TEST - À AJOUTER AVANT userRoutes
// ============================================
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
// ============================================
// CONNEXION MONGODB
// ============================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connecté");
    
    // Démarrer le serveur
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
      console.log(`🌐 CORS activé pour http://localhost:5174`);
    });
  })
  .catch(err => {
    console.error("❌ Erreur de connexion à MongoDB :", err);
  });
  const User = require("./models/User"); // ⬅️ AJOUTE CET IMPORT

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connecté");
    
    // ⬇️ AJOUTE CE BLOC POUR CRÉER UN USER TEST
    try {
      const testUser = await User.findOne({ email: "test@example.com" });
      if (!testUser) {
        await User.create({
          name: "john_doe",
          email: "test@example.com",
          password: "123456",
          role: "Superadmin",
          passion: "DEV_FULLSTACK"
        });
        console.log("👤 User test créé");
      } else {
        console.log("👤 User test existe déjà");
      }
    } catch (error) {
      console.log("⚠️ Erreur création user test:", error.message);
    }
    // ⬆️ FIN DU BLOC AJOUTÉ
    
    // Démarrer le serveur
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
      console.log(`🌐 CORS activé pour http://localhost:5173`); // ⬅️ ICI AUSSI
    });
  })
  .catch(err => {
    console.error("❌ Erreur de connexion à MongoDB :", err);
  });