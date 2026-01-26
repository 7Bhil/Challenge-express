const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { auth, optionalAuth } = require('../middleware/auth');

// Routes
router.post('/', auth, challengeController.createChallenge); // SEULEMENT celle-ci protégée
router.get('/', optionalAuth, challengeController.getAllChallenges); 
router.get('/:id', optionalAuth, challengeController.getChallengeById); 
router.put('/:id', auth, challengeController.updateChallenge); // Nouvelle route UPDATE
router.delete('/:id', auth, challengeController.deleteChallenge); // Nouvelle route DELETE
router.get('/:id/leaderboard', optionalAuth, challengeController.getChallengeLeaderboard); 

// Jury management
router.post('/:id/volunteer', auth, challengeController.volunteerAsJudge);
router.post('/:id/leave-jury', auth, challengeController.leaveJudgeRole);

module.exports = router;