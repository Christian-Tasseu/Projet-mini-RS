// routes/user.js
const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const auth = require("../middleware/auth");

router.post("/inscription", userCtrl.inscription);
router.post("/connexion", userCtrl.connexion);
// récupération de users pour le chat
router.get("/all", auth, userCtrl.getAllUsers);

module.exports = router;