// ============================================
// IMPORT DES MODULES
// ============================================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const User = require("./models/User");

// Charger les variables d'environnement
dotenv.config();

// Initialiser Express
const app = express();

// ============================================
// CONFIGURATION CORS (UNE SEULE FOIS)
// ============================================
app.use(cors({
  origin: process.env.REACT_APP_API_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// ============================================
// MIDDLEWARES
// ============================================
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ============================================
// CONNEXION MONGODB + DÉMARRAGE SERVEUR
// ============================================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connecté");

    // Création d’un utilisateur test (une seule fois)
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

    // Lancer le serveur
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
      console.log(`🌐 CORS activé pour ${process.env.REACT_APP_API_URL }`);
    });
  })
  .catch(err => {
    console.error("❌ Erreur de connexion à MongoDB :", err);
  });
