
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const profilCtrl = require("../controllers/profil");

router.get("/", auth, profilCtrl.getProfil); // Récupérer les infos de l'utilisateur pour la page d'accueil
router.post("/profilPage", auth, profilCtrl.getProfilPage);
router.get("/profilPage/:userId", auth, profilCtrl.getProfilData);
router.put("/profilName/:userId", auth, profilCtrl.updateName);
router.put("/profilBio/:userId", auth, profilCtrl.updateBio);
router.put("/profilImage/:userId", auth, multer, profilCtrl.updateImage);
module.exports = router;