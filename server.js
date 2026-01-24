// ============================================
// IMPORT DES MODULES
// ============================================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const User = require("./models/User");
const Challenge = require('./models/Challenge');
const initializeSuperadmin = require('./utils/adminInitializer');


// Charger les variables d'environnement
dotenv.config();

// Initialiser Express
const app = express();

// ============================================
// CONFIGURATION CORS
// ============================================
app.use(cors({
  origin: process.env.REACT_APP_API_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));
// ============================================
// MIDDLEWARES
// ============================================
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
// ============================================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const challengeRoutes = require('./routes/challengeRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const badgeRoutes = require('./routes/badgeRoutes');

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/badges", badgeRoutes);


// ============================================
// CONNEXION MONGODB + DÉMARRAGE SERVEUR
// ============================================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connecté");

    // Initialiser le Superadmin
    await initializeSuperadmin();

    // Lancer le serveur
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
      console.log(`🌐 CORS activé pour ${process.env.REACT_APP_API_URL}`);
    });
  })
  .catch(err => {
    console.error("❌ Erreur de connexion à MongoDB :", err);
  });
