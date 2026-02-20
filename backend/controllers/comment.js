// controllers/comment.js
const db = require("../config/db");

exports.addComment = async (req, res) => {
  const { post_id, content } = req.body;
  try {
    const [results] = await db.query(
      "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
      [post_id, req.user.id, content]
    );
    res.status(200).json({ 
      message: "Commentaire ajouté !", 
      commentId: results.insertId 
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'ajout du commentaire" });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT c.*, u.username, u.url_photo 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.postId]
    );
    res.json(results);
  } catch (err) {
    console.log("Erreur : ", err);
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};