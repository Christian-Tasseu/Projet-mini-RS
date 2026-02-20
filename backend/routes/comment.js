const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const commentCtrl = require("../controllers/comment");

router.post("/", auth, commentCtrl.addComment);
router.get("/:postId", commentCtrl.getCommentsByPost);

module.exports = router;