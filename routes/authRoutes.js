const express = require("express");
const { checkAuth, login, ping } = require("../controllers/authController"); // Ajoute login
const router = express.Router();

router.get("/ping", ping);
router.get("/me", checkAuth);
router.post("/login", login); // Ajoute la route login

module.exports = router;