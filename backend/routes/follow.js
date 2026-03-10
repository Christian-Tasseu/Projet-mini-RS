const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const followCtrl = require("../controllers/follow");

router.post("/follow/:id", auth, followCtrl.followUser);
router.delete("/unfollow/:id", auth, followCtrl.unfollowUser);

module.exports = router;