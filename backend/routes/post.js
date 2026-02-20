// routes/post.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const postCtrl = require("../controllers/post");


// Route pour créer un post
router.post("/publier", auth, multer, postCtrl.createPost);
// Route pour récupérer tous les posts
router.get("/", auth, postCtrl.getAllPosts);
// Route pour supprimer un post
router.delete("/:postId", auth, postCtrl.deletePost);

module.exports = router;