// controllers/fav.js
const db = require("../config/db");

// Ajouter un like
exports.addFav = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  try {
    await db.query(
      "INSERT INTO favs (post_id, user_id) VALUES (?, ?)",
      [postId, userId]
    );
    
    // On récupère le nouveau compte après l'insertion
    const [likes] = await db.query(
      "SELECT COUNT(*) AS likeCount FROM favs WHERE post_id = ?",
      [postId]
    );
    
    res.status(201).json({
      nbLikes: likes[0].likeCount,
      message: "Ajouté aux favoris",
    });
  } catch (error) {
    console.error("Erreur addFav :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer un like
exports.removeFav = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  try {
    await db.query(
      "DELETE FROM favs WHERE post_id = ? AND user_id = ?",
      [postId, userId]
    );

    const [likes] = await db.query(
      "SELECT COUNT(*) AS likeCount FROM favs WHERE post_id = ?",
      [postId]
    );

    res.status(200).json({
      message: "Retiré des favoris",
      nbLikes: likes[0].likeCount,
    });
  } catch (error) {
    console.error("Erreur removeFav :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};