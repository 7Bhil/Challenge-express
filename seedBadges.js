const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Badge = require('./models/Badge');

dotenv.config();

const badges = [
  {
    name: "🏆 Grand Maître",
    description: "Finir à la 1ère place d'un challenge",
    icon: "Trophy",
    rarity: "Gold",
    category: "Special",
    requirementType: "ranking_top3",
    requirementValue: 1
  },
  {
    name: "🥈 Elite Challenger",
    description: "Finir à la 2ème place d'un challenge",
    icon: "Medal",
    rarity: "Silver",
    category: "Special",
    requirementType: "ranking_top3",
    requirementValue: 2
  },
  {
    name: "🥉 Héros de Bronze",
    description: "Finir à la 3ème place d'un challenge",
    icon: "Award",
    rarity: "Bronze",
    category: "Special",
    requirementType: "ranking_top3",
    requirementValue: 3
  },
  {
    name: "🩸 First Blood",
    description: "Soumettre sa toute première solution",
    icon: "Zap",
    rarity: "Bronze",
    category: "Activity",
    requirementType: "submissions",
    requirementValue: 1
  },
  {
    name: "⭐ Étoile Montante",
    description: "Atteindre 500 points d'expérience",
    icon: "Star",
    rarity: "Silver",
    category: "Milestone",
    requirementType: "points",
    requirementValue: 500
  },
  {
    name: "👑 Roi du Code",
    description: "Atteindre 5000 points d'expérience",
    icon: "Crown",
    rarity: "Gold",
    category: "Milestone",
    requirementType: "points",
    requirementValue: 5000
  },
  {
    name: "✨ Clean Coder",
    description: "Obtenir un score parfait en qualité de code (20/20)",
    icon: "Code",
    rarity: "Silver",
    category: "Skill",
    requirementType: "perfect_score",
    requirementValue: 20
  },
  {
    name: "🌙 Night Owl",
    description: "Soumettre une solution tard dans la nuit (00h - 05h)",
    icon: "Moon",
    rarity: "Bronze",
    category: "Special",
    requirementType: "streak", 
    requirementValue: 0 // Logique custom gérée par l'heure
  }
];

const seedBadges = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à MongoDB pour le seeding");

    // Supprimer les badges existants pour éviter les doublons lors du test
    // await Badge.deleteMany({}); 

    for (const badge of badges) {
      await Badge.findOneAndUpdate(
        { name: badge.name },
        badge,
        { upsert: true, new: true }
      );
    }

    console.log("🚀 Badges initialisés avec succès !");
    process.exit();
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    process.exit(1);
  }
};

seedBadges();
