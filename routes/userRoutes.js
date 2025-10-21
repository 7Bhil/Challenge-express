// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Importe notre contrôleur

// POST /api/register : La route pour l'inscription
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
module.exports = router;