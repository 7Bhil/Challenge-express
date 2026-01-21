const mongoose = require('mongoose');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
require('dotenv').config();

const cleanDatabase = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Supprimer toutes les données
    await User.deleteMany({});
    console.log('🗑️  Tous les utilisateurs supprimés');

    await Challenge.deleteMany({});
    console.log('🗑️  Tous les challenges supprimés');

    await Submission.deleteMany({});
    console.log('🗑️  Toutes les soumissions supprimées');

    // Créer le Superadmin
    const superadmin = await User.create({
      name: 'Bhil',
      email: '7bhill@gmail.com',
      password: 'Bh7777777',
      role: 'Superadmin',
      passion: 'DEV_FULLSTACK',
      level: 1,
      points: 0,
      streak: 0
    });

    console.log('👑 Superadmin créé avec succès!');
    console.log(`   Email: ${superadmin.email}`);
    console.log(`   Nom: ${superadmin.name}`);
    console.log(`   Rôle: ${superadmin.role}`);

    console.log('\n✨ Base de données nettoyée et initialisée!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

cleanDatabase();
