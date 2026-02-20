// routes/fav.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const favCtrl = require("../controllers/fav");

router.post("/add/:postId", auth, favCtrl.addFav);
router.delete("/remove/:postId", auth, favCtrl.removeFav);

module.exports = router;