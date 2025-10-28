const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { auth } = require('../middleware/auth');

// Routes
router.post('/', auth, challengeController.createChallenge); // SEULEMENT celle-ci protégée
router.get('/', challengeController.getAllChallenges); // SANS auth
router.get('/:id', challengeController.getChallengeById); // SANS auth

module.exports = router;