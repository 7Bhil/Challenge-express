const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du badge est obligatoire'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire']
  },
  icon: {
    type: String, // Nom de l'icône Lucide (ex: speedometer, terminal, zap)
    required: true
  },
  rarity: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Diamond'],
    default: 'Bronze'
  },
  category: {
    type: String,
    enum: ['Activity', 'Skill', 'Milestone', 'Special'],
    default: 'Activity'
  },
  requirementType: {
    type: String,
    enum: ['submissions', 'points', 'streak', 'perfect_score'], // Type de critère à vérifier
    required: true
  },
  requirementValue: {
    type: Number, // Valeur à atteindre (ex: 5 soumissions, 1000 points)
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
