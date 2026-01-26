const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'La date de début est obligatoire']
  },
  endDate: {
    type: Date,
    required: [true, 'La date de fin est obligatoire']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Facile', 'Moyen', 'Difficile', 'Expert'],
    default: 'Moyen'
  },
  technologies: [{
    type: String,
    trim: true
  }],
  xpPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  financialReward: {
    type: Number,
    default: 0,
    min: 0
  },
  // REMPLACE createdBy par :
createdBy: {
  type: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    }
  },
  required: true
},
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  validationStatus: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'pending',
    required: true
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  judges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Validation pour s'assurer que la date de fin est après la date de début
challengeSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    next(new Error('La date de fin doit être après la date de début'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Challenge', challengeSchema);
