const express = require("express");
const { checkAuth, login } = require("../controllers/authController"); // Ajoute login
const router = express.Router();

router.get("/me", checkAuth);
router.post("/login", login); // Ajoute la route login

module.exports = router;