const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: [true, 'Le challenge est obligatoire']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est obligatoire']
  },
  githubUrl: {
    type: String,
    required: [true, 'L\'URL GitHub est obligatoire'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/(www\.)?github\.com\/.+/.test(v);
      },
      message: 'URL GitHub invalide'
    }
  },
  liveUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optionnel
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL invalide'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  technologies: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  // Notation par le jury
  scores: [{
    jury: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    codeQuality: {
      type: Number,
      min: 0,
      max: 20
    },
    functionality: {
      type: Number,
      min: 0,
      max: 20
    },
    creativity: {
      type: Number,
      min: 0,
      max: 20
    },
    performance: {
      type: Number,
      min: 0,
      max: 20
    },
    documentation: {
      type: Number,
      min: 0,
      max: 20
    },
    comment: {
      type: String,
      maxlength: 500
    },
    scoredAt: {
      type: Date,
      default: Date.now
    }
  }],
  finalScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  pointsEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculer le score final basé sur les notes du jury
submissionSchema.methods.calculateFinalScore = function() {
  if (this.scores.length === 0) {
    this.finalScore = 0;
    return 0;
  }

  const totalScore = this.scores.reduce((sum, score) => {
    const avgScore = (
      (score.codeQuality || 0) +
      (score.functionality || 0) +
      (score.creativity || 0) +
      (score.performance || 0) +
      (score.documentation || 0)
    ) / 5;
    return sum + avgScore;
  }, 0);

  this.finalScore = totalScore / this.scores.length;
  
  // Calculer les points gagnés (score final * multiplicateur basé sur difficulté)
  this.pointsEarned = Math.round(this.finalScore * 10);
  
  return this.finalScore;
};

module.exports = mongoose.model('Submission', submissionSchema);
